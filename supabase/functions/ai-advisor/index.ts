import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for database operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Token counting helper (rough estimation)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Date filtering helper
function getDateFilter(timeframe: string = 'month'): { startDate: string, endDate: string } {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  
  let startDate: string;
  switch (timeframe) {
    case 'day':
      startDate = endDate;
      break;
    case 'week':
      const weekStart = new Date(now.setDate(now.getDate() - 7));
      startDate = weekStart.toISOString().split('T')[0];
      break;
    case 'quarter':
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      startDate = quarterStart.toISOString().split('T')[0];
      break;
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      startDate = yearStart.toISOString().split('T')[0];
      break;
    default: // month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = monthStart.toISOString().split('T')[0];
  }
  
  return { startDate, endDate };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { message, conversationId, timeframe = 'month' } = await req.json();
    
    console.log('Received request:', { message, conversationId, timeframe });

    // Generate conversation ID if not provided
    const currentConversationId = conversationId || crypto.randomUUID();
    
    // Get date filter for financial data
    const { startDate, endDate } = getDateFilter(timeframe);
    
    // Fetch comprehensive financial data in parallel
    const [dealsResult, expensesResult, fixedCostsResult, goalsResult, recurringResult] = await Promise.allSettled([
      supabase
        .from('deals')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59'),
      
      supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('expense_date', startDate)
        .lte('expense_date', endDate),
      
      supabase
        .from('fixed_costs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true),
      
      supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active'),
      
      supabase
        .from('recurring_revenue')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
    ]);
    
    // Extract data with error handling
    const deals = dealsResult.status === 'fulfilled' ? dealsResult.value.data || [] : [];
    const expenses = expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [];
    const fixedCosts = fixedCostsResult.status === 'fulfilled' ? fixedCostsResult.value.data || [] : [];
    const goals = goalsResult.status === 'fulfilled' ? goalsResult.value.data || [] : [];
    const recurringRevenue = recurringResult.status === 'fulfilled' ? recurringResult.value.data || [] : [];
    
    // Calculate advanced financial metrics
    const totalRevenue = deals
      .filter(deal => deal.status === 'paid')
      .reduce((sum, deal) => sum + Number(deal.amount), 0);
    
    const pipelineValue = deals
      .filter(deal => deal.status !== 'paid')
      .reduce((sum, deal) => sum + Number(deal.amount), 0);
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const monthlyFixedCosts = fixedCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);
    const monthlyRecurringRevenue = recurringRevenue.reduce((sum, rev) => sum + Number(rev.monthly_amount), 0);
    
    const netCashflow = totalRevenue + monthlyRecurringRevenue - totalExpenses - monthlyFixedCosts;
    const burnRate = monthlyFixedCosts + (totalExpenses / 30); // Daily burn rate
    const cashRunway = netCashflow > 0 ? Math.ceil(netCashflow / burnRate) : 0;
    
    // Fetch conversation history (last 15 messages)
    const { data: conversationHistory } = await supabase
      .from('ai_conversations')
      .select('role, content, tokens_used, created_at')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true })
      .limit(15);
    
    const history = conversationHistory || [];
    
    // Create enhanced system prompt with real-time financial context
    const dataTimestamp = new Date().toLocaleString('nl-NL');
    const systemPrompt = `Je bent een geavanceerde financiële AI-adviseur voor Innoworks B.V. die gebruikmaakt van o4-mini reasoning om diepgaande financiële analyses te leveren.

**REAL-TIME FINANCIAL CONTEXT (${timeframe.toUpperCase()}) - Updated: ${dataTimestamp}:**

📊 REVENUE ANALYTICS:
• Totale omzet: €${totalRevenue.toLocaleString()} (${deals.filter(d => d.status === 'paid').length} betaalde deals)
• Maandelijks terugkerende omzet (MRR): €${monthlyRecurringRevenue.toLocaleString()}
• Pipeline waarde: €${pipelineValue.toLocaleString()} (${deals.filter(d => d.status !== 'paid').length} actieve deals)
• Gemiddelde deal waarde: €${deals.length > 0 ? Math.round(totalRevenue / deals.filter(d => d.status === 'paid').length || 0).toLocaleString() : 0}

💸 EXPENSE INTELLIGENCE:
• Totale uitgaven: €${totalExpenses.toLocaleString()} (${expenses.length} transacties)
• Maandelijkse vaste kosten: €${monthlyFixedCosts.toLocaleString()} (${fixedCosts.length} items)
• Gemiddelde uitgave per transactie: €${expenses.length > 0 ? Math.round(totalExpenses / expenses.length).toLocaleString() : 0}

💰 CASHFLOW METRICS:
• Netto cashflow: €${netCashflow.toLocaleString()}
• Dagelijkse burn rate: €${Math.round(burnRate).toLocaleString()}
• Cash runway: ${cashRunway} dagen
• Financiële status: ${netCashflow > 0 ? '🟢 Positief' : '🔴 Negatief'}

🎯 GOALS TRACKING:
• Actieve doelen: ${goals.length}
• Doelen op schema: ${goals.filter(g => g.current_value >= g.target_value * 0.7).length}/${goals.length}

**O4-MINI REASONING INSTRUCTIONS:**
1. Analyseer patronen en anomalieën in de financiële data met gebruikmaking van advanced reasoning
2. Lever data-gedreven inzichten met specifieke cijfers uit bovenstaande context
3. Referentieeer conversatiegeschiedenis voor continuïteit en personalisatie
4. Focus op actionable business advies specifiek voor Innoworks B.V.
5. Gebruik Nederlandse taal en vermijd jargon
6. Stel intelligente vervolgvragen gebaseerd op de data trends
7. Geef prioriteit aan cashflow optimalisatie en groei strategieën

**CONVERSATION CONTINUITY:**
${history.length > 0 ? `Vorige ${history.length} berichten in dit gesprek:\n${history.map(h => `${h.role}: ${h.content.substring(0, 150)}...`).join('\n')}` : 'Dit is het begin van een nieuwe conversatie.'}`;

    // Prepare messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];
    
    // Calculate token usage
    const totalTokens = messages.reduce((sum, msg) => sum + estimateTokens(msg.content), 0);
    
    console.log('Token usage estimate:', totalTokens);
    
    // Make API call to o4-mini reasoning model
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'o4-mini-2025-04-16',
        messages: messages,
        temperature: 0.2,
        max_tokens: 2000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const apiData = await response.json();
    const aiResponse = apiData.choices[0].message.content;
    const actualTokens = apiData.usage?.total_tokens || estimateTokens(aiResponse);
    
    console.log('AI response generated successfully, tokens used:', actualTokens);
    
    // Save conversation messages to database
    const conversationData = {
      conversation_id: currentConversationId,
      user_id: user.id,
      timeframe: timeframe,
      financial_context: {
        totalRevenue,
        totalExpenses,
        netCashflow,
        pipelineValue,
        deals: deals.length,
        expenses: expenses.length,
        dataTimestamp
      }
    };
    
    await Promise.allSettled([
      // Save user message
      supabase.from('ai_conversations').insert({
        ...conversationData,
        role: 'user',
        content: message,
        tokens_used: estimateTokens(message)
      }),
      
      // Save AI response
      supabase.from('ai_conversations').insert({
        ...conversationData,
        role: 'assistant',
        content: aiResponse,
        tokens_used: actualTokens
      })
    ]);
    
    // Generate conversation title if this is the first message
    if (history.length === 0) {
      const titlePrompt = `Genereer een korte, beschrijvende titel (max 40 karakters) voor deze financiële conversatie gebaseerd op: "${message}". Alleen de titel terugsturen, geen uitleg.`;
      
      try {
        const titleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: titlePrompt }],
            temperature: 0.3,
            max_tokens: 50,
          }),
        });
        
        if (titleResponse.ok) {
          const titleData = await titleResponse.json();
          const title = titleData.choices[0].message.content.replace(/"/g, '').trim();
          
          await supabase.from('ai_conversation_titles').insert({
            conversation_id: currentConversationId,
            user_id: user.id,
            title: title
          });
        }
      } catch (titleError) {
        console.error('Error generating title:', titleError);
      }
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      conversationId: currentConversationId,
      tokensUsed: actualTokens,
      dataTimestamp: dataTimestamp,
      financialSnapshot: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        cashflow: netCashflow,
        pipeline: pipelineValue,
        runway: cashRunway
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-advisor function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});