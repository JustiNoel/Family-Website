
-- Blog posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL DEFAULT 'The Azzariah Family',
  content text,
  excerpt text,
  category text NOT NULL DEFAULT 'General',
  image_url text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published posts" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage posts" ON public.blog_posts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_time text,
  location text,
  type text NOT NULL DEFAULT 'Gathering',
  image_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Event RSVPs
CREATE TABLE public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'going',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view rsvps" ON public.event_rsvps FOR SELECT USING (true);
CREATE POLICY "Users can manage own rsvps" ON public.event_rsvps FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rsvps" ON public.event_rsvps FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own rsvps" ON public.event_rsvps FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Recipes table
CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  prep_time text,
  cook_time text,
  servings text,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  instructions jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  rating integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Admins can manage recipes" ON public.recipes FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Family members directory
CREATE TABLE public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  bio text,
  fun_fact text,
  avatar_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view family members" ON public.family_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage family members" ON public.family_members FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Guestbook entries
CREATE TABLE public.guestbook_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  message text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved entries" ON public.guestbook_entries FOR SELECT USING (approved = true);
CREATE POLICY "Authenticated can insert entries" ON public.guestbook_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage entries" ON public.guestbook_entries FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Contact messages
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can send messages" ON public.contact_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage messages" ON public.contact_messages FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_rsvps;
