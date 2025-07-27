import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  financial_context?: any;
}

export const useChatSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all sessions for the user
  const loadSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  // Load messages for a specific session
  const loadMessages = async (sessionId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant'
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new session
  const createSession = async (title?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user_id: user.id,
            title: title || 'Nieuwe Chat'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newSession = data as ChatSession;
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
      
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  };

  // Add a message to the current session
  const addMessage = async (
    role: 'user' | 'assistant',
    content: string,
    financialContext?: any
  ) => {
    if (!currentSession) return null;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: currentSession.id,
            role,
            content,
            financial_context: financialContext
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newMessage = data as ChatMessage;
      setMessages(prev => [...prev, newMessage]);
      
      return newMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  };

  // Update session title
  const updateSessionTitle = async (sessionId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, title }
            : session
        )
      );

      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title } : null);
      }
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  };

  // Delete a session
  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  // Switch to a different session
  const switchToSession = (session: ChatSession) => {
    setCurrentSession(session);
    loadMessages(session.id);
  };

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  return {
    sessions,
    currentSession,
    messages,
    loading,
    createSession,
    addMessage,
    updateSessionTitle,
    deleteSession,
    switchToSession,
    loadSessions
  };
};