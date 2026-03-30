import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Plus, Trash2, Edit, Upload, Save, UserCheck, UserX, Users, FileText, MessageSquareText, Check, X,
  LayoutDashboard, Image, BookOpen, Calendar, UtensilsCrossed, MessageCircle, UsersRound, Settings, Eye, EyeOff, Mail
} from "lucide-react";
import { notifyAdmin, sendNotification } from "@/hooks/useNotifications";

const adminSections = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "members", label: "Members", icon: Users },
  { id: "hero", label: "Hero Slides", icon: Image },
  { id: "pages", label: "Page Content", icon: FileText },
  { id: "blog", label: "Blog Posts", icon: BookOpen },
  { id: "events", label: "Events", icon: Calendar },
  { id: "recipes", label: "Recipes", icon: UtensilsCrossed },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "family", label: "Family Members", icon: UsersRound },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "guestbook", label: "Guestbook", icon: MessageCircle },
  { id: "suggestions", label: "Suggestions", icon: MessageSquareText },
  { id: "settings", label: "Site Settings", icon: Settings },
];

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("overview");

  // Data states
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [guestbookEntries, setGuestbookEntries] = useState<any[]>([]);

  // Edit states
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [newSlide, setNewSlide] = useState({ title: "", subtitle: "", image_url: "" });
  const [uploading, setUploading] = useState(false);

  // New item states
  const [newPost, setNewPost] = useState({ title: "", author: "The Azzariah Family", content: "", excerpt: "", category: "General", image_url: "", published: false });
  const [newEvent, setNewEvent] = useState({ title: "", description: "", event_date: "", event_time: "", location: "", type: "Gathering", image_url: "" });
  const [newRecipe, setNewRecipe] = useState({ title: "", category: "Dessert", prep_time: "", cook_time: "", servings: "", ingredients: "", instructions: "", image_url: "" });
  const [newFamilyMember, setNewFamilyMember] = useState({ name: "", role: "", bio: "", fun_fact: "", avatar_url: "" });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) { navigate("/auth"); return; }
    if (isAdmin) fetchAll();
  }, [loading, user, isAdmin]);

  const fetchAll = async () => {
    const [slides, content, photos, membersRes, suggestionsRes, posts, evts, recs, fam, msgs, gb] = await Promise.all([
      supabase.from("hero_slides").select("*").order("sort_order"),
      supabase.from("site_content").select("*"),
      supabase.from("gallery_photos").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("content_suggestions").select("*").order("created_at", { ascending: false }),
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("event_date", { ascending: false }),
      supabase.from("recipes").select("*").order("created_at", { ascending: false }),
      supabase.from("family_members").select("*").order("sort_order"),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("guestbook_entries").select("*").order("created_at", { ascending: false }),
    ]);
    if (slides.data) setHeroSlides(slides.data);
    if (content.data) setSiteContent(content.data);
    if (photos.data) setGalleryPhotos(photos.data);
    if (membersRes.data) setMembers(membersRes.data);
    if (suggestionsRes.data) setSuggestions(suggestionsRes.data);
    if (posts.data) setBlogPosts(posts.data);
    if (evts.data) setEvents(evts.data);
    if (recs.data) setRecipes(recs.data);
    if (fam.data) setFamilyMembers(fam.data);
    if (msgs.data) setContactMessages(msgs.data);
    if (gb.data) setGuestbookEntries(gb.data);
  };

  const uploadImage = async (file: File, folder: string = "general") => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("photos").upload(path, file);
    setUploading(false);
    if (error) throw error;
    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    return data.publicUrl;
  };

  // Hero slides
  const addSlide = async () => {
    if (!newSlide.title || !newSlide.image_url) return;
    const { error } = await supabase.from("hero_slides").insert({ ...newSlide, sort_order: heroSlides.length });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Slide added!" }); setNewSlide({ title: "", subtitle: "", image_url: "" }); fetchAll(); }
  };
  const updateSlide = async (slide: any) => {
    const { error } = await supabase.from("hero_slides").update({ title: slide.title, subtitle: slide.subtitle, image_url: slide.image_url, active: slide.active }).eq("id", slide.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Slide updated!" }); setEditingSlide(null); fetchAll(); }
  };
  const deleteSlide = async (id: string) => {
    await supabase.from("hero_slides").delete().eq("id", id);
    toast({ title: "Slide deleted" }); fetchAll();
  };

  // Site content
  const updateContent = async (item: any) => {
    const { error } = await supabase.from("site_content").update({
      title: item.title, subtitle: item.subtitle, content: item.content, image_url: item.image_url,
      updated_at: new Date().toISOString(), updated_by: user?.id,
    }).eq("id", item.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Content updated!" }); setEditingContent(null); fetchAll(); }
  };

  // Blog posts
  const addBlogPost = async () => {
    if (!newPost.title) return;
    const { error } = await supabase.from("blog_posts").insert(newPost);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Post created!" }); setNewPost({ title: "", author: "The Azzariah Family", content: "", excerpt: "", category: "General", image_url: "", published: false }); fetchAll(); }
  };
  const togglePostPublish = async (id: string, published: boolean) => {
    await supabase.from("blog_posts").update({ published: !published }).eq("id", id);
    toast({ title: published ? "Post unpublished" : "Post published!" }); fetchAll();
  };
  const deletePost = async (id: string) => {
    await supabase.from("blog_posts").delete().eq("id", id);
    toast({ title: "Post deleted" }); fetchAll();
  };

  // Events
  const addEvent = async () => {
    if (!newEvent.title || !newEvent.event_date) return;
    const { error } = await supabase.from("events").insert(newEvent);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Event created!" }); setNewEvent({ title: "", description: "", event_date: "", event_time: "", location: "", type: "Gathering", image_url: "" }); fetchAll(); }
  };
  const deleteEvent = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    toast({ title: "Event deleted" }); fetchAll();
  };

  // Recipes
  const addRecipe = async () => {
    if (!newRecipe.title) return;
    const ingredients = newRecipe.ingredients.split("\n").filter(Boolean);
    const instructions = newRecipe.instructions.split("\n").filter(Boolean);
    const { error } = await supabase.from("recipes").insert({
      title: newRecipe.title, category: newRecipe.category, prep_time: newRecipe.prep_time,
      cook_time: newRecipe.cook_time, servings: newRecipe.servings, ingredients, instructions, image_url: newRecipe.image_url,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Recipe added!" }); setNewRecipe({ title: "", category: "Dessert", prep_time: "", cook_time: "", servings: "", ingredients: "", instructions: "", image_url: "" }); fetchAll(); }
  };
  const deleteRecipe = async (id: string) => {
    await supabase.from("recipes").delete().eq("id", id);
    toast({ title: "Recipe deleted" }); fetchAll();
  };

  // Family members
  const addFamilyMember = async () => {
    if (!newFamilyMember.name) return;
    const { error } = await supabase.from("family_members").insert({ ...newFamilyMember, sort_order: familyMembers.length });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Family member added!" }); setNewFamilyMember({ name: "", role: "", bio: "", fun_fact: "", avatar_url: "" }); fetchAll(); }
  };
  const deleteFamilyMember = async (id: string) => {
    await supabase.from("family_members").delete().eq("id", id);
    toast({ title: "Member removed" }); fetchAll();
  };

  // Members
  const approveMember = async (member: any) => {
    const { error } = await supabase.from("profiles").update({ approved: true }).eq("id", member.id);
    if (!error) {
      toast({ title: "Member approved!" });
      await sendNotification(member.id, "approval", "Your account has been approved! Welcome to the family site.");
      fetchAll();
    }
  };
  const revokeMember = async (id: string) => {
    await supabase.from("profiles").update({ approved: false }).eq("id", id);
    toast({ title: "Access revoked" }); fetchAll();
  };

  // Suggestions
  const handleSuggestion = async (id: string, action: "approved" | "rejected") => {
    const suggestion = suggestions.find((s: any) => s.id === id);
    if (action === "approved" && suggestion) {
      const existing = siteContent.find((c: any) => c.section_key === suggestion.section_key);
      if (existing) {
        await supabase.from("site_content").update({
          title: suggestion.suggested_title || existing.title,
          content: suggestion.suggested_content || existing.content,
          updated_at: new Date().toISOString(), updated_by: user?.id,
        }).eq("id", existing.id);
      }
    }
    await supabase.from("content_suggestions").update({ status: action, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (suggestion) {
      await sendNotification(suggestion.user_id, "suggestion", `Your content suggestion was ${action}.`);
    }
    toast({ title: action === "approved" ? "Suggestion approved & applied!" : "Suggestion rejected" }); fetchAll();
  };

  // Guestbook
  const approveGuestbook = async (id: string) => {
    await supabase.from("guestbook_entries").update({ approved: true }).eq("id", id);
    toast({ title: "Entry approved!" }); fetchAll();
  };
  const deleteGuestbook = async (id: string) => {
    await supabase.from("guestbook_entries").delete().eq("id", id);
    toast({ title: "Entry deleted" }); fetchAll();
  };

  // Messages
  const markMessageRead = async (id: string) => {
    await supabase.from("contact_messages").update({ read: true }).eq("id", id);
    fetchAll();
  };
  const deleteMessage = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    toast({ title: "Message deleted" }); fetchAll();
  };

  // Gallery
  const deletePhoto = async (id: string) => {
    await supabase.from("gallery_photos").delete().eq("id", id);
    toast({ title: "Photo deleted" }); fetchAll();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void, folder = "general") => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, folder);
      callback(url);
    } catch (err: any) { toast({ title: "Upload failed", description: err.message, variant: "destructive" }); }
  };

  // Content grouping
  const contentByPage: Record<string, any[]> = {};
  const pageLabels: Record<string, string> = {
    home_intro: "Home", newsletter: "Home", hero_welcome: "Home",
    about_hero: "About", about_values: "About",
    contact_header: "Contact", contact_info: "Contact",
    events_header: "Events", recipes_header: "Recipes", blog_header: "Blog",
    footer_motto: "Footer", footer_social: "Footer",
  };
  siteContent.forEach((item: any) => {
    const page = pageLabels[item.section_key] || "Other";
    if (!contentByPage[page]) contentByPage[page] = [];
    contentByPage[page].push(item);
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return null;

  const pendingCount = members.filter((m: any) => !m.approved).length;
  const pendingSuggestions = suggestions.filter((s: any) => s.status === "pending").length;
  const unreadMessages = contactMessages.filter((m: any) => !m.read).length;
  const pendingGuestbook = guestbookEntries.filter((g: any) => !g.approved).length;

  const stats = [
    { label: "Total Members", value: members.length, icon: Users, color: "text-blue-500" },
    { label: "Pending Approvals", value: pendingCount, icon: UserCheck, color: "text-orange-500" },
    { label: "Gallery Photos", value: galleryPhotos.length, icon: Image, color: "text-purple-500" },
    { label: "Blog Posts", value: blogPosts.length, icon: BookOpen, color: "text-green-500" },
    { label: "Events", value: events.length, icon: Calendar, color: "text-pink-500" },
    { label: "Recipes", value: recipes.length, icon: UtensilsCrossed, color: "text-amber-500" },
    { label: "Unread Messages", value: unreadMessages, icon: Mail, color: "text-red-500" },
    { label: "Pending Suggestions", value: pendingSuggestions, icon: MessageSquareText, color: "text-teal-500" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Admin Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminSections.map((section) => (
                    <SidebarMenuItem key={section.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(section.id)}
                        className={activeSection === section.id ? "bg-primary/10 text-primary font-medium" : ""}
                      >
                        <section.icon className="w-4 h-4 mr-2" />
                        <span>{section.label}</span>
                        {section.id === "members" && pendingCount > 0 && (
                          <Badge variant="destructive" className="ml-auto text-xs h-5 w-5 p-0 flex items-center justify-center">{pendingCount}</Badge>
                        )}
                        {section.id === "messages" && unreadMessages > 0 && (
                          <Badge variant="destructive" className="ml-auto text-xs h-5 w-5 p-0 flex items-center justify-center">{unreadMessages}</Badge>
                        )}
                        {section.id === "suggestions" && pendingSuggestions > 0 && (
                          <Badge variant="destructive" className="ml-auto text-xs h-5 w-5 p-0 flex items-center justify-center">{pendingSuggestions}</Badge>
                        )}
                        {section.id === "guestbook" && pendingGuestbook > 0 && (
                          <Badge variant="destructive" className="ml-auto text-xs h-5 w-5 p-0 flex items-center justify-center">{pendingGuestbook}</Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4 gap-3">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-heading">Admin Dashboard</h1>
            <Badge className="ml-auto">Admin</Badge>
          </header>

          <ScrollArea className="flex-1 p-6">
            {/* OVERVIEW */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-heading">Dashboard Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((s, i) => (
                    <Card key={i} className="p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <s.icon className={`w-8 h-8 ${s.color}`} />
                        <div>
                          <p className="text-2xl font-bold">{s.value}</p>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                {pendingCount > 0 && (
                  <Card className="p-4 border-primary/30 bg-primary/5">
                    <h3 className="font-semibold text-primary mb-2">⏳ {pendingCount} member(s) awaiting approval</h3>
                    <Button size="sm" onClick={() => setActiveSection("members")}>Review Now</Button>
                  </Card>
                )}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setActiveSection("blog")}><Plus className="w-3 h-3 mr-1" /> New Post</Button>
                    <Button size="sm" variant="outline" onClick={() => setActiveSection("events")}><Plus className="w-3 h-3 mr-1" /> New Event</Button>
                    <Button size="sm" variant="outline" onClick={() => setActiveSection("recipes")}><Plus className="w-3 h-3 mr-1" /> New Recipe</Button>
                    <Button size="sm" variant="outline" onClick={() => setActiveSection("hero")}><Plus className="w-3 h-3 mr-1" /> New Slide</Button>
                  </div>
                </Card>
              </div>
            )}

            {/* MEMBERS */}
            {activeSection === "members" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-heading flex items-center gap-2"><Users className="w-6 h-6" /> Family Members</h2>
                {pendingCount > 0 && (
                  <Card className="p-4 border-primary/50 bg-primary/5">
                    <h3 className="font-semibold mb-3 text-primary">⏳ Pending Approval ({pendingCount})</h3>
                    <div className="space-y-3">
                      {members.filter((m: any) => !m.approved).map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                          <div>
                            <p className="font-medium">{member.display_name || "No name"}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <p className="text-xs text-muted-foreground">Joined {new Date(member.created_at).toLocaleDateString()}</p>
                          </div>
                          <Button size="sm" onClick={() => approveMember(member)}><UserCheck className="w-4 h-4 mr-1" /> Approve</Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">✅ Approved Members ({members.filter((m: any) => m.approved).length})</h3>
                  <div className="space-y-3">
                    {members.filter((m: any) => m.approved).map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{member.display_name || "No name"}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        {member.email !== "justinoel254@gmail.com" && (
                          <Button size="sm" variant="outline" onClick={() => revokeMember(member.id)}><UserX className="w-4 h-4 mr-1" /> Revoke</Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* HERO SLIDES */}
            {activeSection === "hero" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-heading">Hero Slides</h2>
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Add New Slide</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Slide title" value={newSlide.title} onChange={(e) => setNewSlide(p => ({ ...p, title: e.target.value }))} />
                    <Input placeholder="Subtitle" value={newSlide.subtitle} onChange={(e) => setNewSlide(p => ({ ...p, subtitle: e.target.value }))} />
                    <div className="md:col-span-2 flex gap-2">
                      <Input placeholder="Image URL (or upload)" value={newSlide.image_url} onChange={(e) => setNewSlide(p => ({ ...p, image_url: e.target.value }))} className="flex-1" />
                      <label className="cursor-pointer">
                        <Button variant="outline" asChild disabled={uploading}><span><Upload className="w-4 h-4 mr-1" />{uploading ? "..." : "Upload"}</span></Button>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, url => setNewSlide(p => ({ ...p, image_url: url })), "hero")} />
                      </label>
                    </div>
                    {newSlide.image_url && <img src={newSlide.image_url} alt="Preview" className="h-32 rounded object-cover md:col-span-2" />}
                    <Button onClick={addSlide} className="md:col-span-2"><Plus className="w-4 h-4 mr-2" /> Add Slide</Button>
                  </div>
                </Card>
                <div className="grid gap-4">
                  {heroSlides.map((slide: any) => (
                    <Card key={slide.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <img src={slide.image_url} alt={slide.title} className="w-24 h-16 rounded object-cover bg-muted" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{slide.title}</h3>
                          <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
                        </div>
                        <Badge variant={slide.active ? "default" : "secondary"}>{slide.active ? "Active" : "Inactive"}</Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => setEditingSlide({ ...slide })}><Edit className="w-4 h-4" /></Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Edit Slide</DialogTitle></DialogHeader>
                            {editingSlide && (
                              <div className="space-y-4">
                                <Input placeholder="Title" value={editingSlide.title} onChange={(e) => setEditingSlide((p: any) => ({ ...p, title: e.target.value }))} />
                                <Input placeholder="Subtitle" value={editingSlide.subtitle || ""} onChange={(e) => setEditingSlide((p: any) => ({ ...p, subtitle: e.target.value }))} />
                                <div className="flex gap-2">
                                  <Input placeholder="Image URL" value={editingSlide.image_url} onChange={(e) => setEditingSlide((p: any) => ({ ...p, image_url: e.target.value }))} className="flex-1" />
                                  <label className="cursor-pointer">
                                    <Button variant="outline" asChild><span><Upload className="w-4 h-4" /></span></Button>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, url => setEditingSlide((p: any) => ({ ...p, image_url: url })), "hero")} />
                                  </label>
                                </div>
                                {editingSlide.image_url && <img src={editingSlide.image_url} alt="Preview" className="h-32 rounded object-cover" />}
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" checked={editingSlide.active} onChange={(e) => setEditingSlide((p: any) => ({ ...p, active: e.target.checked }))} />
                                  <label>Active</label>
                                </div>
                                <Button onClick={() => updateSlide(editingSlide)} className="w-full"><Save className="w-4 h-4 mr-2" /> Save</Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete this slide?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteSlide(slide.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* PAGE CONTENT */}
            {activeSection === "pages" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-heading">Edit Page Content</h2>
                <p className="text-sm text-muted-foreground">Edit text displayed on each page. Changes are applied immediately.</p>
                {Object.entries(contentByPage).map(([page, items]) => (
                  <Card key={page} className="p-6">
                    <h3 className="text-lg font-semibold text-heading mb-4"><Badge variant="outline">{page}</Badge></h3>
                    <div className="space-y-4">
                      {items.map((item: any) => (
                        <div key={item.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="secondary" className="text-xs">{item.section_key}</Badge>
                            <Button variant="outline" size="sm" onClick={() => setEditingContent(editingContent?.id === item.id ? null : { ...item })}>
                              <Edit className="w-3 h-3 mr-1" /> {editingContent?.id === item.id ? "Cancel" : "Edit"}
                            </Button>
                          </div>
                          {editingContent?.id === item.id ? (
                            <div className="space-y-3">
                              <div><label className="text-xs font-medium text-muted-foreground">Title</label><Input value={editingContent.title || ""} onChange={(e) => setEditingContent((p: any) => ({ ...p, title: e.target.value }))} /></div>
                              <div><label className="text-xs font-medium text-muted-foreground">Subtitle</label><Input value={editingContent.subtitle || ""} onChange={(e) => setEditingContent((p: any) => ({ ...p, subtitle: e.target.value }))} /></div>
                              <div><label className="text-xs font-medium text-muted-foreground">Content</label><Textarea value={editingContent.content || ""} onChange={(e) => setEditingContent((p: any) => ({ ...p, content: e.target.value }))} rows={4} /></div>
                              <Button onClick={() => updateContent(editingContent)}><Save className="w-4 h-4 mr-2" /> Save</Button>
                            </div>
                          ) : (
                            <div className="text-sm space-y-1">
                              {item.title && <p><span className="font-medium">Title:</span> {item.title}</p>}
                              {item.subtitle && <p><span className="font-medium">Subtitle:</span> {item.subtitle}</p>}
                              {item.content && <p className="text-muted-foreground line-clamp-2">{item.content}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* BLOG POSTS */}
            {activeSection === "blog" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-heading">Blog Posts</h2>
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Create New Post</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Post title" value={newPost.title} onChange={(e) => setNewPost(p => ({ ...p, title: e.target.value }))} />
                      <Input placeholder="Author" value={newPost.author} onChange={(e) => setNewPost(p => ({ ...p, author: e.target.value }))} />
                      <Input placeholder="Category" value={newPost.category} onChange={(e) => setNewPost(p => ({ ...p, category: e.target.value }))} />
                      <div className="flex gap-2">
                        <Input placeholder="Image URL" value={newPost.image_url} onChange={(e) => setNewPost(p => ({ ...p, image_url: e.target.value }))} className="flex-1" />
                        <label className="cursor-pointer">
                          <Button variant="outline" asChild><span><Upload className="w-4 h-4" /></span></Button>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, url => setNewPost(p => ({ ...p, image_url: url })), "blog")} />
                        </label>
                      </div>
                    </div>
                    <Textarea placeholder="Excerpt (short summary)" value={newPost.excerpt} onChange={(e) => setNewPost(p => ({ ...p, excerpt: e.target.value }))} rows={2} />
                    <Textarea placeholder="Full content" value={newPost.content} onChange={(e) => setNewPost(p => ({ ...p, content: e.target.value }))} rows={6} />
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={newPost.published} onChange={(e) => setNewPost(p => ({ ...p, published: e.target.checked }))} />
                      <label className="text-sm">Publish immediately</label>
                    </div>
                    <Button onClick={addBlogPost}><Plus className="w-4 h-4 mr-2" /> Create Post</Button>
                  </div>
                </Card>
                <div className="space-y-3">
                  {blogPosts.map((post: any) => (
                    <Card key={post.id} className="p-4">
                      <div className="flex items-center gap-4">
                        {post.image_url && <img src={post.image_url} alt={post.title} className="w-20 h-14 rounded object-cover bg-muted" />}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{post.title}</h4>
                          <p className="text-xs text-muted-foreground">{post.author} · {post.category} · {new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => togglePostPublish(post.id, post.published)}>
                          {post.published ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete this post?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deletePost(post.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Card>
                  ))}
                  {blogPosts.length === 0 && <p className="text-muted-foreground text-center py-8">No blog posts yet. Create your first one above!</p>}
                </div>
              </div>
            )}

            {/* EVENTS */}
            {activeSection === "events" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-heading">Events</h2>
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Create New Event</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Event title" value={newEvent.title} onChange={(e) => setNewEvent(p => ({ ...p, title: e.target.value }))} />
                    <Input placeholder="Type (e.g. Gathering, Birthday)" value={newEvent.type} onChange={(e) => setNewEvent(p => ({ ...p, type: e.target.value }))} />
                    <Input type="date" value={newEvent.event_date} onChange={(e) => setNewEvent(p => ({ ...p, event_date: e.target.value }))} />
                    <Input placeholder="Time (e.g. 2:00 PM)" value={newEvent.event_time} onChange={(e) => setNewEvent(p => ({ ...p, event_time: e.target.value }))} />
                    <Input placeholder="Location" value={newEvent.location} onChange={(e) => setNewEvent(p => ({ ...p, location: e.target.value }))} />
                    <div className="flex gap-2">
                      <Input placeholder="Image URL" value={newEvent.image_url} onChange={(e) => setNewEvent(p => ({ ...p, image_url: e.target.value }))} className="flex-1" />
                      <label className="cursor-pointer">
                        <Button variant="outline" asChild><span><Upload className="w-4 h-4" /></span></Button>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, url => setNewEvent(p => ({ ...p, image_url: url })), "events")} />
                      </label>
                    </div>
                    <Textarea placeholder="Description" className="md:col-span-2" value={newEvent.description} onChange={(e) => setNewEvent(p => ({ ...p, description: e.target.value }))} rows={3} />
                    <Button onClick={addEvent} className="md:col-span-2"><Plus className="w-4 h-4 mr-2" /> Create Event</Button>
                  </div>
                </Card>
                <div className="space-y-3">
                  {events.map((event: any) => (
                    <Card key={event.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge>{event.type}</Badge>
                            <h4 className="font-semibold">{event.title}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{event.event_date} · {event.event_time} · {event.location}</p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete this event?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteEvent(event.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Card>
                  ))}
                  {events.length === 0 && <p className="text-muted-foreground text-center py-8">No events yet.</p>}
                </div>
              </div>
            )}

            {/* RECIPES */}
            {activeSection === "recipes" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-heading">Recipes</h2>
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Add New Recipe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Recipe title" value={newRecipe.title} onChange={(e) => setNewRecipe(p => ({ ...p, title: e.target.value }))} />
                    <Input placeholder="Category" value={newRecipe.category} onChange={(e) => setNewRecipe(p => ({ ...p, category: e.target.value }))} />
                    <Input placeholder="Prep time" value={newRecipe.prep_time} onChange={(e) => setNewRecipe(p => ({ ...p, prep_time: e.target.value }))} />
                    <Input placeholder="Cook time" value={newRecipe.cook_time} onChange={(e) => setNewRecipe(p => ({ ...p, cook_time: e.target.value }))} />
                    <Input placeholder="Servings" value={newRecipe.servings} onChange={(e) => setNewRecipe(p => ({ ...p, servings: e.target.value }))} />
                    <div className="flex gap-2">
                      <Input placeholder="Image URL" value={newRecipe.image_url} onChange={(e) => setNewRecipe(p => ({ ...p, image_url: e.target.value }))} className="flex-1" />
                      <label className="cursor-pointer">
                        <Button variant="outline" asChild><span><Upload className="w-4 h-4" /></span></Button>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, url => setNewRecipe(p => ({ ...p, image_url: url })), "recipes")} />
                      </label>
                    </div>
                    <Textarea placeholder="Ingredients (one per line)" className="md:col-span-2" value={newRecipe.ingredients} onChange={(e) => setNewRecipe(p => ({ ...p, ingredients: e.target.value }))} rows={4} />
                    <Textarea placeholder="Instructions (one step per line)" className="md:col-span-2" value={newRecipe.instructions} onChange={(e) => setNewRecipe(p => ({ ...p, instructions: e.target.value }))} rows={4} />
                    <Button onClick={addRecipe} className="md:col-span-2"><Plus className="w-4 h-4 mr-2" /> Add Recipe</Button>
                  </div>
                </Card>
                <div className="space-y-3">
                  {recipes.map((recipe: any) => (
                    <Card key={recipe.id} className="p-4">
                      <div className="flex items-center gap-4">
                        {recipe.image_url && <img src={recipe.image_url} alt={recipe.title} className="w-16 h-16 rounded object-cover bg-muted" />}
                        <div className="flex-1">
                          <h4 className="font-semibold">{recipe.title}</h4>
                          <p className="text-xs text-muted-foreground">{recipe.category} · {recipe.prep_time} prep · {recipe.cook_time} cook</p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete this recipe?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteRecipe(recipe.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Card>
                  ))}
                  {recipes.length === 0 && <p className="text-muted-foreground text-center py-8">No recipes yet.</p>}
                </div>
              </div>
            )}

            {/* GALLERY */}
            {activeSection === "gallery" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-heading">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galleryPhotos.map((photo: any) => (
                    <Card key={photo.id} className="overflow-hidden">
                      <img src={photo.image_url} alt={photo.title} className="w-full h-32 object-cover" />
                      <div className="p-3">
                        <p className="text-sm font-medium truncate">{photo.title}</p>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant="outline" className="text-xs">{photo.category}</Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive" size="icon" className="h-7 w-7"><Trash2 className="w-3 h-3" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Delete this photo?</AlertDialogTitle></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deletePhoto(photo.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                {galleryPhotos.length === 0 && <p className="text-muted-foreground text-center py-8">No photos yet.</p>}
              </div>
            )}

            {/* FAMILY MEMBERS */}
            {activeSection === "family" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-heading">Family Members Directory</h2>
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Add Family Member</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Name" value={newFamilyMember.name} onChange={(e) => setNewFamilyMember(p => ({ ...p, name: e.target.value }))} />
                    <Input placeholder="Role (e.g. Father, Mother)" value={newFamilyMember.role} onChange={(e) => setNewFamilyMember(p => ({ ...p, role: e.target.value }))} />
                    <Textarea placeholder="Short bio" className="md:col-span-2" value={newFamilyMember.bio} onChange={(e) => setNewFamilyMember(p => ({ ...p, bio: e.target.value }))} rows={2} />
                    <Input placeholder="Fun fact" value={newFamilyMember.fun_fact} onChange={(e) => setNewFamilyMember(p => ({ ...p, fun_fact: e.target.value }))} />
                    <div className="flex gap-2">
                      <Input placeholder="Avatar URL" value={newFamilyMember.avatar_url} onChange={(e) => setNewFamilyMember(p => ({ ...p, avatar_url: e.target.value }))} className="flex-1" />
                      <label className="cursor-pointer">
                        <Button variant="outline" asChild><span><Upload className="w-4 h-4" /></span></Button>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, url => setNewFamilyMember(p => ({ ...p, avatar_url: url })), "avatars")} />
                      </label>
                    </div>
                    <Button onClick={addFamilyMember} className="md:col-span-2"><Plus className="w-4 h-4 mr-2" /> Add Member</Button>
                  </div>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {familyMembers.map((member: any) => (
                    <Card key={member.id} className="p-4">
                      <div className="flex items-center gap-4">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {member.name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-xs text-primary">{member.role}</p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Remove {member.name}?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteFamilyMember(member.id)}>Remove</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Card>
                  ))}
                </div>
                {familyMembers.length === 0 && <p className="text-muted-foreground text-center py-8">No family members added yet.</p>}
              </div>
            )}

            {/* MESSAGES */}
            {activeSection === "messages" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-heading">Contact Messages</h2>
                <div className="space-y-3">
                  {contactMessages.map((msg: any) => (
                    <Card key={msg.id} className={`p-4 ${!msg.read ? "border-primary/30 bg-primary/5" : ""}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{msg.name}</p>
                            {!msg.read && <Badge variant="default" className="text-xs">New</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{msg.email}</p>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-1">
                          {!msg.read && <Button variant="outline" size="sm" onClick={() => markMessageRead(msg.id)}><Check className="w-3 h-3" /></Button>}
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="w-3 h-3" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Delete this message?</AlertDialogTitle></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMessage(msg.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {contactMessages.length === 0 && <p className="text-muted-foreground text-center py-8">No messages yet.</p>}
                </div>
              </div>
            )}

            {/* GUESTBOOK */}
            {activeSection === "guestbook" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-heading">Guestbook Moderation</h2>
                {pendingGuestbook > 0 && (
                  <Card className="p-4 border-primary/30 bg-primary/5">
                    <h3 className="font-semibold text-primary mb-3">Pending Approval ({pendingGuestbook})</h3>
                    <div className="space-y-3">
                      {guestbookEntries.filter((g: any) => !g.approved).map((entry: any) => (
                        <div key={entry.id} className="flex items-start justify-between p-3 bg-background rounded-lg">
                          <div>
                            <p className="font-medium">{entry.name}</p>
                            <p className="text-sm mt-1">{entry.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(entry.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => approveGuestbook(entry.id)}><Check className="w-3 h-3 mr-1" /> Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteGuestbook(entry.id)}><X className="w-3 h-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Approved Entries</h3>
                  <div className="space-y-3">
                    {guestbookEntries.filter((g: any) => g.approved).map((entry: any) => (
                      <div key={entry.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{entry.name}</p>
                          <p className="text-sm">{entry.message}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteGuestbook(entry.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    ))}
                    {guestbookEntries.filter((g: any) => g.approved).length === 0 && <p className="text-sm text-muted-foreground">No approved entries.</p>}
                  </div>
                </Card>
              </div>
            )}

            {/* SUGGESTIONS */}
            {activeSection === "suggestions" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-heading">Member Suggestions</h2>
                <div className="space-y-3">
                  {suggestions.map((s: any) => (
                    <Card key={s.id} className={`p-4 ${s.status === "pending" ? "border-primary/30" : ""}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={s.status === "pending" ? "default" : s.status === "approved" ? "secondary" : "destructive"}>{s.status}</Badge>
                            <span className="text-xs text-muted-foreground">{s.page} · {s.section_key}</span>
                          </div>
                          {s.suggested_title && <p className="font-medium">Title: {s.suggested_title}</p>}
                          {s.suggested_content && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.suggested_content}</p>}
                          <p className="text-xs text-muted-foreground mt-2">{new Date(s.created_at).toLocaleDateString()}</p>
                        </div>
                        {s.status === "pending" && (
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => handleSuggestion(s.id, "approved")}><Check className="w-3 h-3 mr-1" /> Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => handleSuggestion(s.id, "rejected")}><X className="w-3 h-3 mr-1" /> Reject</Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  {suggestions.length === 0 && <p className="text-muted-foreground text-center py-8">No suggestions yet.</p>}
                </div>
              </div>
            )}

            {/* SITE SETTINGS */}
            {activeSection === "settings" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-heading">Site Settings</h2>
                <p className="text-sm text-muted-foreground">Edit site-wide settings like name, motto, and contact info via the Page Content section.</p>
                <Button variant="outline" onClick={() => setActiveSection("pages")}>Go to Page Content</Button>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
