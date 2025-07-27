import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bot, User, Sparkles, TrendingUp } from 'lucide-react';
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
    scrollToBottom();
  }, [messages]);

  // Auto-create first session if none exists
  useEffect(() => {
    if (!sessionsLoading && sessions.length === 0 && !currentSession) {
      createSession();
    }
  }, [sessionsLoading, sessions.length, currentSession, createSession]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !currentSession) return;

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
        if (messages.length <= 1 && currentSession.title === 'Nieuwe Chat') {
          const title = userMessage.length > 50 
            ? userMessage.substring(0, 50) + '...'
            : userMessage;
          updateSessionTitle(currentSession.id, title);
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
    <div className="h-full w-full">
      <div className="flex h-full bg-background overflow-hidden">
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
        <div className="flex-1 flex flex-col min-w-0">

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12 space-y-6">
                <div className="p-4 rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold font-manrope text-foreground mb-2">
                    Welkom bij je AI Financieel Adviseur
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Ik help je met financieel advies op basis van je data. Stel me een vraag!
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-4 h-auto text-left justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
                      onClick={() => setInput(question)}
                    >
                      <div className="text-sm">{question}</div>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex space-x-4 animate-fade-in ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="p-2 rounded-full bg-primary/10 h-fit">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-card border border-border'
                    }`}
                  >
                    <div className={`text-sm leading-relaxed ${
                      message.role === 'user' ? 'text-primary-foreground' : 'text-foreground'
                    }`}>
                      {formatMessage(message.content)}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="p-2 rounded-full bg-accent/10 h-fit">
                      <User className="h-5 w-5 text-accent-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex space-x-4 animate-fade-in">
                <div className="p-2 rounded-full bg-primary/10 h-fit">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="max-w-[80%] p-3 bg-card border border-border rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">Aan het denken...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background flex-shrink-0">
          <div className="relative max-w-3xl mx-auto">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Stel een vraag..."
              className="min-h-[50px] max-h-32 resize-none pr-12 border-border focus:border-primary transition-colors w-full rounded-xl"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 h-7 w-7 bg-primary hover:bg-primary/90 rounded-lg"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};