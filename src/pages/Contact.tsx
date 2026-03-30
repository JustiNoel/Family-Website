import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Send } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { notifyAdmin } from "@/hooks/useNotifications";
import { ScrollAnimator } from "@/components/ScrollAnimator";

const Contact = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { get } = useSiteContent(["contact_header", "contact_info"]);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [guestbookData, setGuestbookData] = useState({ name: "", message: "" });
  const [guestbookEntries, setGuestbookEntries] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGuestbook();
  }, []);

  const fetchGuestbook = async () => {
    const { data } = await supabase.from("guestbook_entries").select("*").eq("approved", true).order("created_at", { ascending: false });
    if (data) setGuestbookEntries(data);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Please sign in to send a message" }); return; }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert(formData);
    setSubmitting(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await notifyAdmin("contact", `New contact message from ${formData.name}`);
    toast({ title: "Message Sent!", description: "Thank you for reaching out." });
    setFormData({ name: "", email: "", message: "" });
  };

  const handleGuestbookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Please sign in to leave a message" }); return; }
    setSubmitting(true);
    const { error } = await supabase.from("guestbook_entries").insert({
      ...guestbookData, user_id: user.id,
    });
    setSubmitting(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await notifyAdmin("guestbook", `New guestbook entry from ${guestbookData.name}`);
    toast({ title: "Submitted!", description: "Your message will appear after moderation." });
    setGuestbookData({ name: "", message: "" });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <ScrollAnimator>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
              {get("contact_header", "title", "Get in Touch")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {get("contact_header", "content", "Have a question, suggestion, or just want to say hello?")}
            </p>
          </div>
        </ScrollAnimator>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <ScrollAnimator>
            <Card className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Mail className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-heading">Send Us a Message</h2>
              </div>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Your Name</label>
                  <Input placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Email Address</label>
                  <Input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Your Message</label>
                  <Textarea placeholder="Type your message here..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="min-h-[150px]" required />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  <Send className="w-4 h-4 mr-2" />{submitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </ScrollAnimator>

          <ScrollAnimator delay={100}>
            <div className="space-y-6">
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-heading mb-4">
                  {get("contact_info", "title", "Connect With Us")}
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-heading">Email:</strong>{" "}<a href="mailto:family@azzariah.com" className="text-primary hover:underline">family@azzariah.com</a></p>
                  <p><strong className="text-heading">Phone:</strong>{" "}<a href="tel:+1234567890" className="text-primary hover:underline">(123) 456-7890</a></p>
                  <p><strong className="text-heading">Address:</strong><br />123 Family Lane<br />Hometown, ST 12345</p>
                </div>
              </Card>
              <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
                <h3 className="text-lg font-semibold text-heading mb-2">Family Motto</h3>
                <p className="text-muted-foreground italic">"Where memories live forever, and love grows stronger with each generation."</p>
              </Card>
            </div>
          </ScrollAnimator>
        </div>

        <section>
          <ScrollAnimator>
            <div className="flex items-center gap-2 mb-8">
              <MessageSquare className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold text-heading">Family Guestbook</h2>
            </div>
          </ScrollAnimator>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ScrollAnimator>
              <Card className="p-6 lg:col-span-1">
                <h3 className="text-xl font-semibold text-heading mb-4">Leave a Message</h3>
                <form onSubmit={handleGuestbookSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">Your Name</label>
                    <Input placeholder="Name" value={guestbookData.name} onChange={(e) => setGuestbookData({ ...guestbookData, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">Message</label>
                    <Textarea placeholder="Share your thoughts..." value={guestbookData.message} onChange={(e) => setGuestbookData({ ...guestbookData, message: e.target.value })} className="min-h-[120px]" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>Submit</Button>
                </form>
              </Card>
            </ScrollAnimator>
            <div className="lg:col-span-2 space-y-4">
              {guestbookEntries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📖</p>
                  <p className="text-muted-foreground">No guestbook entries yet. Be the first!</p>
                </div>
              ) : (
                guestbookEntries.map((entry, index) => (
                  <ScrollAnimator key={entry.id} delay={index * 80}>
                    <Card className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-heading">{entry.name}</h4>
                          <p className="text-sm text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{entry.message}</p>
                    </Card>
                  </ScrollAnimator>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
