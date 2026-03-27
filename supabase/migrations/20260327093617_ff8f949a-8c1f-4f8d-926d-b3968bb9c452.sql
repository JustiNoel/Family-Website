
-- Content suggestions table for family members to propose updates
CREATE TABLE public.content_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  page TEXT NOT NULL,
  section_key TEXT NOT NULL,
  suggested_title TEXT,
  suggested_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.content_suggestions ENABLE ROW LEVEL SECURITY;

-- Members can view their own suggestions
CREATE POLICY "Users can view own suggestions" ON public.content_suggestions
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Members can insert suggestions
CREATE POLICY "Users can insert suggestions" ON public.content_suggestions
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Admins can do everything
CREATE POLICY "Admins can manage suggestions" ON public.content_suggestions
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
