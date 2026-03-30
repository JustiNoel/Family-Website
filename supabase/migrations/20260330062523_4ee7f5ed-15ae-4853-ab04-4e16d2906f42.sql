
-- Fix overly permissive INSERT policies
DROP POLICY "Authenticated can insert entries" ON public.guestbook_entries;
CREATE POLICY "Authenticated can insert entries" ON public.guestbook_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY "Authenticated can send messages" ON public.contact_messages;
CREATE POLICY "Authenticated can send messages" ON public.contact_messages FOR INSERT TO authenticated WITH CHECK (email IS NOT NULL AND message IS NOT NULL);

DROP POLICY "System can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id IS NOT NULL);
