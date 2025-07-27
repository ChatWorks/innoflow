import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { message, context } = await req.json();
    
    console.log('Received request:', { message, context });

    // Create system prompt with financial context
    const systemPrompt = `Je bent een financiële AI-adviseur voor Innoflow. Je helpt gebruikers hun financiële situatie te begrijpen en geeft praktische adviezen.

Financiële context:
- Maandelijks inkomen: €${context?.monthlyIncome || 0}
- Maandelijkse uitgaven: €${context?.monthlyExpenses || 0}
- Netto cashflow: €${context?.netCashflow || 0}
- Pipeline waarde: €${context?.pipelineValue || 0}
- Aantal actieve deals: ${context?.activeDeals || 0}
- Aantal vaste kosten: ${context?.fixedCosts || 0}

Richtlijnen:
- Geef concrete, praktische adviezen
- Gebruik Nederlandse taal
- Focus op cashflow management
- Stel vervolgvragen als je meer context nodig hebt
- Wees vriendelijk en professioneel
- Vermijd financieel jargon waar mogelijk`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ response: aiResponse }), {
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