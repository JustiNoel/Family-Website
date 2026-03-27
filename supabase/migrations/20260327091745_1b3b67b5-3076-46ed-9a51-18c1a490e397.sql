
-- Add approved column to profiles (admin auto-approved, others pending)
ALTER TABLE public.profiles ADD COLUMN approved BOOLEAN NOT NULL DEFAULT false;

-- Auto-approve the admin if they already exist
UPDATE public.profiles SET approved = true WHERE email = 'justinoel254@gmail.com';

-- Update the trigger to auto-approve admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, approved)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email = 'justinoel254@gmail.com' THEN true ELSE false END
  );
  
  IF NEW.email = 'justinoel254@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;
