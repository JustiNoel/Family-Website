
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  -- Auto-assign admin role for the admin email
  IF NEW.email = 'justinoel254@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Gallery photos table
CREATE TABLE public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  caption TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  image_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Photo comments table
CREATE TABLE public.photo_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID REFERENCES public.gallery_photos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.photo_comments ENABLE ROW LEVEL SECURITY;

-- Site content table (for editable sections)
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Hero slides table
CREATE TABLE public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- user_roles: only admins can view, nobody can self-assign
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- profiles: users can view all, update own
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- gallery_photos: public read, authenticated upload, admin manage
CREATE POLICY "Anyone can view photos" ON public.gallery_photos FOR SELECT USING (true);
CREATE POLICY "Authenticated can upload photos" ON public.gallery_photos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage photos" ON public.gallery_photos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Uploaders can update own photos" ON public.gallery_photos FOR UPDATE TO authenticated USING (uploaded_by = auth.uid());

-- photo_comments: public read, authenticated create, own delete
CREATE POLICY "Anyone can view comments" ON public.photo_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated can comment" ON public.photo_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own comments" ON public.photo_comments FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage comments" ON public.photo_comments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- site_content: public read, admin write
CREATE POLICY "Anyone can view site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage site content" ON public.site_content FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- hero_slides: public read, admin write
CREATE POLICY "Anyone can view hero slides" ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "Admins can manage hero slides" ON public.hero_slides FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Storage RLS policies
CREATE POLICY "Anyone can view photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Authenticated can upload photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'photos');
CREATE POLICY "Admins can delete photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'photos' AND public.has_role(auth.uid(), 'admin'));

-- Insert default site content
INSERT INTO public.site_content (section_key, title, subtitle, content) VALUES
  ('hero_welcome', 'Welcome to The Azzariah''s Family', 'Our Digital Home', 'Where family bonds grow stronger'),
  ('home_intro', 'Welcome to Our Digital Home', NULL, 'The Azzariah''s Family website is a place where we celebrate our heritage, share our stories, and stay connected no matter where life takes us. From treasured recipes to precious memories, this is where our family''s legacy lives on for generations to come.'),
  ('newsletter', 'Stay Connected', NULL, 'Subscribe to our family newsletter for updates, event reminders, and special announcements.');

-- Insert default hero slides
INSERT INTO public.hero_slides (title, subtitle, image_url, sort_order) VALUES
  ('Welcome to Our Family', 'Creating memories together', '/placeholder.svg', 0),
  ('Cherish Every Moment', 'Love, laughter, and togetherness', '/placeholder.svg', 1),
  ('Our Family Legacy', 'Passing traditions to the next generation', '/placeholder.svg', 2);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.photo_comments;
