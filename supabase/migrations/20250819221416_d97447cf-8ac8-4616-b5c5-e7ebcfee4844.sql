-- Create flip_history table to store coin flip results
CREATE TABLE public.flip_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  option_1 TEXT NOT NULL,
  option_2 TEXT NOT NULL,
  heads_option TEXT NOT NULL,
  tails_option TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('heads', 'tails')),
  winner TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.flip_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own flip history" 
ON public.flip_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flip history" 
ON public.flip_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_flip_history_user_id_created_at ON public.flip_history(user_id, created_at DESC);