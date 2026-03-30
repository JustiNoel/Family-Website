import { supabase } from "@/integrations/supabase/client";

export const sendNotification = async (userId: string, type: string, message: string) => {
  await supabase.from("notifications").insert({ user_id: userId, type, message });
};

export const notifyAdmin = async (type: string, message: string) => {
  // Find admin user(s)
  const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
  if (adminRoles) {
    for (const role of adminRoles) {
      await sendNotification(role.user_id, type, message);
    }
  }
};
