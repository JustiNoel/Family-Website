import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageSquarePlus } from "lucide-react";

interface SuggestUpdateProps {
  page: string;
  sectionKey: string;
  currentTitle?: string;
  currentContent?: string;
}

export const SuggestUpdate = ({ page, sectionKey, currentTitle, currentContent }: SuggestUpdateProps) => {
  const { user, isApproved } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(currentTitle || "");
  const [content, setContent] = useState(currentContent || "");
  const [submitting, setSubmitting] = useState(false);

  if (!user || !isApproved) return null;

  const handleSubmit = async () => {
    if (!title && !content) return;
    setSubmitting(true);
    const { error } = await supabase.from("content_suggestions").insert({
      user_id: user.id,
      page,
      section_key: sectionKey,
      suggested_title: title || null,
      suggested_content: content || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Suggestion submitted!", description: "The admin will review your suggestion." });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
          <MessageSquarePlus className="w-3 h-3 mr-1" /> Suggest Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suggest an Update</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Your suggestion will be reviewed by the admin before being applied.</p>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium">Suggested Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Leave empty to keep current" />
          </div>
          <div>
            <label className="text-sm font-medium">Suggested Content</label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Your suggested content..." rows={4} />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "Submitting..." : "Submit Suggestion"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
