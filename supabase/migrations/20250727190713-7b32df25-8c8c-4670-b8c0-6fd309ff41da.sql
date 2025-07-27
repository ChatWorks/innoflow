-- Create ai_conversations table for conversation memory management
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  timeframe TEXT DEFAULT 'month',
  financial_context JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own conversation messages" 
ON public.ai_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation messages" 
ON public.ai_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation messages" 
ON public.ai_conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversation messages" 
ON public.ai_conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_ai_conversations_conversation_id ON public.ai_conversations(conversation_id);
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_created_at ON public.ai_conversations(created_at DESC);
CREATE INDEX idx_ai_conversations_user_conversation ON public.ai_conversations(user_id, conversation_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_conversations_updated_at
BEFORE UPDATE ON public.ai_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create conversation titles table for better organization
CREATE TABLE public.ai_conversation_titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nieuwe Financiële Analyse',
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for conversation titles
ALTER TABLE public.ai_conversation_titles ENABLE ROW LEVEL SECURITY;

-- Create policies for conversation titles
CREATE POLICY "Users can view their own conversation titles" 
ON public.ai_conversation_titles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation titles" 
ON public.ai_conversation_titles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation titles" 
ON public.ai_conversation_titles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversation titles" 
ON public.ai_conversation_titles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for conversation titles
CREATE INDEX idx_ai_conversation_titles_user_id ON public.ai_conversation_titles(user_id);
CREATE INDEX idx_ai_conversation_titles_last_activity ON public.ai_conversation_titles(last_activity DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_conversation_titles_updated_at
BEFORE UPDATE ON public.ai_conversation_titles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update conversation statistics
CREATE OR REPLACE FUNCTION public.update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation title stats when messages are added
  UPDATE public.ai_conversation_titles 
  SET 
    message_count = (
      SELECT COUNT(*) 
      FROM public.ai_conversations 
      WHERE conversation_id = NEW.conversation_id
    ),
    total_tokens = (
      SELECT COALESCE(SUM(tokens_used), 0)
      FROM public.ai_conversations 
      WHERE conversation_id = NEW.conversation_id
    ),
    last_activity = NEW.created_at,
    updated_at = now()
  WHERE conversation_id = NEW.conversation_id;
  
  -- Create title record if it doesn't exist
  IF NOT FOUND THEN
    INSERT INTO public.ai_conversation_titles (
      conversation_id, 
      user_id, 
      message_count, 
      total_tokens, 
      last_activity
    ) VALUES (
      NEW.conversation_id, 
      NEW.user_id, 
      1, 
      NEW.tokens_used, 
      NEW.created_at
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation stats
CREATE TRIGGER update_conversation_stats_trigger
AFTER INSERT ON public.ai_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_stats();