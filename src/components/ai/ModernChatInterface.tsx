import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bot, User, Sparkles, MessageSquare } from 'lucide-react';
import { useChatSessions, ChatMessage } from '@/hooks/useChatSessions';
import { ChatSidebar } from './ChatSidebar';

interface FinancialContext {
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashflow: number;
  pipelineValue: number;
  activeDeals: number;
  fixedCosts: number;
}

interface ModernChatInterfaceProps {
  context: FinancialContext;
}

export const ModernChatInterface: React.FC<ModernChatInterfaceProps> = ({ context }) => {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    sessions,
    currentSession,
    messages,
    loading: sessionsLoading,
    createSession,
    addMessage,
    updateSessionTitle,
    deleteSession,
    switchToSession,
  } = useChatSessions();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only scroll to bottom if there are messages
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Remove auto-creation of sessions - only create when user sends first message

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Create session if none exists when user sends first message
    let sessionToUse = currentSession;
    if (!sessionToUse) {
      sessionToUse = await createSession();
      if (!sessionToUse) return;
    }

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Add user message to chat
      await addMessage('user', userMessage, context);

      // Call the AI advisor function
      const { data, error } = await supabase.functions.invoke('ai-advisor', {
        body: {
          message: userMessage,
          context: context,
        },
      });

      if (error) {
        throw new Error(error.message || 'Er is een fout opgetreden bij het verkrijgen van een antwoord.');
      }

      // Add AI response to chat
      if (data?.response) {
        await addMessage('assistant', data.response);
        
        // Auto-generate title for new chats based on first user message
        if (messages.length <= 1 && sessionToUse.title === 'Nieuwe Chat') {
          const title = userMessage.length > 50 
            ? userMessage.substring(0, 50) + '...'
            : userMessage;
          updateSessionTitle(sessionToUse.id, title);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Er is een onverwachte fout opgetreden.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = async () => {
    await createSession();
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const suggestedQuestions = [
    "Hoe kan ik mijn cashflow verbeteren?",
    "Welke kosten kan ik besparen?",
    "Wat is een goede prijsstrategie voor mijn deals?",
    "Hoe voorspel ik mijn omzet voor volgende maand?"
  ];

  return (
    <div className="flex min-h-[700px] w-full bg-gradient-to-br from-background via-background to-muted/20">
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        currentSession={currentSession}
        onSessionSelect={switchToSession}
        onNewChat={handleNewChat}
        onDeleteSession={deleteSession}
        onUpdateTitle={updateSessionTitle}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-[700px] relative">
        {/* Messages */}
        <ScrollArea className="flex-1 p-6 max-h-[580px]">
          <div className="space-y-6 max-w-4xl mx-auto">
            {!currentSession || messages.length === 0 ? (
              <div className="text-center py-16 space-y-8 animate-fade-in">
                {/* Welcome Section */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                      <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="relative z-10 pt-12">
                    <div className="w-3 h-3 bg-primary rounded-full mx-auto animate-bounce" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold font-manrope text-foreground">
                    Welkom bij je AI Financieel Adviseur
                  </h3>
                  <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                    Ik analyseer je financiële data en geef gepersonaliseerd advies. 
                    Stel me een vraag of kies een van de onderstaande opties.
                  </p>
                </div>

                {/* Suggested Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-4 h-auto text-left justify-start transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:border-primary/40 bg-card/50 backdrop-blur-sm border-border/60"
                      onClick={() => setInput(question)}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-sm text-foreground leading-relaxed text-left flex-1">
                          {question}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Financial Context Display */}
                <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                    Jouw Financiële Context
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">
                        {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(context.monthlyIncome)}
                      </div>
                      <div className="text-muted-foreground text-xs">Inkomsten</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">
                        {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(context.monthlyExpenses)}
                      </div>
                      <div className="text-muted-foreground text-xs">Uitgaven</div>
                    </div>
                    <div className="text-center col-span-2 md:col-span-1">
                      <div className={`font-semibold ${context.netCashflow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(context.netCashflow)}
                      </div>
                      <div className="text-muted-foreground text-xs">Netto Cashflow</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, messageIndex) => (
                  <div
                    key={message.id}
                    className={`flex space-x-4 animate-fade-in ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                    style={{ animationDelay: `${messageIndex * 100}ms` }}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[75%] group ${
                        message.role === 'user' ? 'ml-auto' : ''
                      }`}
                    >
                      <div
                        className={`p-4 rounded-2xl shadow-sm transition-all duration-200 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground ml-auto hover:shadow-md'
                            : 'bg-card border border-border hover:shadow-md hover:border-primary/20'
                        }`}
                      >
                        <div className={`text-sm leading-relaxed ${
                          message.role === 'user' ? 'text-primary-foreground' : 'text-foreground'
                        }`}>
                          {formatMessage(message.content)}
                        </div>
                      </div>
                      
                      <div className={`text-xs text-muted-foreground mt-2 ${
                        message.role === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString('nl-NL', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent/20 to-accent/10 flex items-center justify-center border-2 border-accent/20">
                          <User className="h-5 w-5 text-accent-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex space-x-4 animate-fade-in">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="max-w-[75%] p-4 bg-card border border-border rounded-2xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">AI analyseert je vraag...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 border-t border-border bg-gradient-to-r from-background via-background to-muted/10 flex-shrink-0">
          <div className="relative max-w-4xl mx-auto">
            <div className="relative group">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Stel je financiële vraag..."
                className="min-h-[60px] max-h-40 resize-none pr-14 border-2 border-border focus:border-primary/50 transition-all duration-200 w-full rounded-2xl bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md focus:shadow-lg text-base"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="absolute right-3 bottom-3 h-9 w-9 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg rounded-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>Druk Enter om te verzenden, Shift+Enter voor nieuwe regel</span>
              <span className={`transition-colors ${input.length > 500 ? 'text-orange-500' : ''}`}>
                {input.length}/1000
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};