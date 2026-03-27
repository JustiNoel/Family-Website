
-- Fix permissive INSERT policy for gallery_photos - restrict to own uploads
DROP POLICY "Authenticated can upload photos" ON public.gallery_photos;
CREATE POLICY "Authenticated can upload photos" ON public.gallery_photos FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
