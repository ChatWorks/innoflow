import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used?: number;
  created_at: string;
}

export interface ChatSession {
  conversation_id: string;
  title: string;
  message_count: number;
  total_tokens: number;
  last_activity: string;
  created_at: string;
}

export const useChatSessions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch all chat sessions for the user
  const fetchSessions = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_conversation_titles')
        .select('*')
        .eq('user_id', user.id)
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      setSessions(data?.map(session => ({
        conversation_id: session.conversation_id,
        title: session.title,
        message_count: session.message_count,
        total_tokens: session.total_tokens,
        last_activity: session.last_activity,
        created_at: session.created_at
      })) || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }, [user]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (sessionId: string) => {
    if (!user || !sessionId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('id, role, content, tokens_used, created_at')
        .eq('conversation_id', sessionId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages((data || []).map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant' | 'system'
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new conversation
  const createNewConversation = useCallback(() => {
    const newConversationId = crypto.randomUUID();
    setConversationId(newConversationId);
    setMessages([]);
    return newConversationId;
  }, []);

  // Select an existing conversation
  const selectConversation = useCallback((sessionId: string) => {
    setConversationId(sessionId);
    fetchMessages(sessionId);
  }, [fetchMessages]);

  // Send a message with advanced AI integration
  const sendMessage = useCallback(async (
    content: string, 
    timeframe: string = 'month'
  ): Promise<string | null> => {
    if (!user || !content.trim()) return null;

    try {
      setSendingMessage(true);
      
      // Use current conversation or create new one
      const currentConversationId = conversationId || createNewConversation();
      
      // Add user message to local state immediately
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Call the enhanced AI advisor function
      const { data: aiResponse, error } = await supabase.functions.invoke('ai-advisor', {
        body: {
          message: content.trim(),
          conversationId: currentConversationId,
          timeframe: timeframe
        }
      });

      if (error) {
        console.error('AI Advisor error:', error);
        toast({
          title: "AI Fout",
          description: "Er is een fout opgetreden bij het verwerken van je bericht.",
          variant: "destructive",
        });
        
        // Remove user message on error
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
        return null;
      }

      // Add AI response to local state
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse.response,
        tokens_used: aiResponse.tokensUsed,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update conversation ID if it was newly created
      if (!conversationId) {
        setConversationId(aiResponse.conversationId);
      }
      
      // Refresh sessions to show updated stats
      await fetchSessions();
      
      toast({
        title: "AI Advies Ontvangen",
        description: `Gebruikt ${aiResponse.tokensUsed} tokens voor deze analyse.`,
      });

      return aiResponse.response;
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Fout bij versturen",
        description: "Er is een fout opgetreden bij het versturen van je bericht.",
        variant: "destructive",
      });
      return null;
    } finally {
      setSendingMessage(false);
    }
  }, [user, conversationId, createNewConversation, fetchSessions, toast]);

  // Update conversation title
  const updateConversationTitle = useCallback(async (sessionId: string, newTitle: string) => {
    if (!user || !newTitle.trim()) return false;

    try {
      const { error } = await supabase
        .from('ai_conversation_titles')
        .update({ title: newTitle.trim() })
        .eq('conversation_id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating title:', error);
        return false;
      }

      // Update local state
      setSessions(prev => prev.map(session => 
        session.conversation_id === sessionId 
          ? { ...session, title: newTitle.trim() }
          : session
      ));

      toast({
        title: "Titel bijgewerkt",
        description: "De conversatie titel is succesvol gewijzigd.",
      });

      return true;
    } catch (error) {
      console.error('Error updating title:', error);
      return false;
    }
  }, [user, toast]);

  // Delete a conversation
  const deleteConversation = useCallback(async (sessionId: string) => {
    if (!user) return false;

    try {
      // Delete messages first
      const { error: messagesError } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('conversation_id', sessionId)
        .eq('user_id', user.id);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        return false;
      }

      // Delete session title
      const { error: titleError } = await supabase
        .from('ai_conversation_titles')
        .delete()
        .eq('conversation_id', sessionId)
        .eq('user_id', user.id);

      if (titleError) {
        console.error('Error deleting title:', titleError);
        return false;
      }

      // Update local state
      setSessions(prev => prev.filter(session => session.conversation_id !== sessionId));
      
      // Clear current conversation if it was deleted
      if (conversationId === sessionId) {
        setConversationId(null);
        setMessages([]);
      }

      toast({
        title: "Conversatie verwijderd",
        description: "De conversatie is succesvol verwijderd.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }, [user, conversationId, toast]);

  // Initialize data on component mount
  useEffect(() => {
    if (user) {
      fetchSessions();
      setLoading(false);
    }
  }, [user, fetchSessions]);

  return {
    conversationId,
    messages,
    sessions,
    loading,
    sendingMessage,
    sendMessage,
    createNewConversation,
    selectConversation,
    updateConversationTitle,
    deleteConversation,
    refetchSessions: fetchSessions
  };
};