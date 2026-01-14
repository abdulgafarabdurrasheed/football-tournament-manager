CREATE TABLE IF NOT EXISTS public.gameplans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id)
ON DELETE CASCADE,
    name TEXT NOT NULL,
    tactics JSONB NOT NULL DEFAULT '{}'::jsonb,
    players JSONB,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gameplans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own gameplans"
    ON public.gameplans FOR ALL
    USING (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS one_default_per_user
    ON public.gameplans (user_id)
    WHERE is_default = true;

CREATE TRIGGER update_gameplans_updated_at
  BEFORE UPDATE ON public.gameplans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();