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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, Image, Upload, Save, UserCheck, UserX, Users, FileText, MessageSquareText, Check, X } from "lucide-react";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [newSlide, setNewSlide] = useState({ title: "", subtitle: "", image_url: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
      return;
    }
    if (isAdmin) fetchAll();
  }, [loading, user, isAdmin]);

  const fetchAll = async () => {
    const [slides, content, photos, membersRes, suggestionsRes] = await Promise.all([
      supabase.from("hero_slides").select("*").order("sort_order"),
      supabase.from("site_content").select("*"),
      supabase.from("gallery_photos").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("content_suggestions").select("*").order("created_at", { ascending: false }),
    ]);
    if (slides.data) setHeroSlides(slides.data);
    if (content.data) setSiteContent(content.data);
    if (photos.data) setGalleryPhotos(photos.data);
    if (membersRes.data) setMembers(membersRes.data);
    if (suggestionsRes.data) setSuggestions(suggestionsRes.data);
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
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);
    if (!error) { toast({ title: "Slide deleted" }); fetchAll(); }
  };

  const updateContent = async (item: any) => {
    const { error } = await supabase.from("site_content").update({
      title: item.title, subtitle: item.subtitle, content: item.content, image_url: item.image_url,
      updated_at: new Date().toISOString(), updated_by: user?.id,
    }).eq("id", item.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Content updated!" }); setEditingContent(null); fetchAll(); }
  };

  const deletePhoto = async (id: string) => {
    const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
    if (!error) { toast({ title: "Photo deleted" }); fetchAll(); }
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "new" | "edit") => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, "hero");
      if (target === "new") setNewSlide(prev => ({ ...prev, image_url: url }));
      else if (editingSlide) setEditingSlide((prev: any) => ({ ...prev, image_url: url }));
    } catch (err: any) { toast({ title: "Upload failed", description: err.message, variant: "destructive" }); }
  };

  const approveMember = async (id: string) => {
    const { error } = await supabase.from("profiles").update({ approved: true }).eq("id", id);
    if (!error) { toast({ title: "Member approved!" }); fetchAll(); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const revokeMember = async (id: string) => {
    const { error } = await supabase.from("profiles").update({ approved: false }).eq("id", id);
    if (!error) { toast({ title: "Member access revoked" }); fetchAll(); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const handleSuggestion = async (id: string, action: "approved" | "rejected") => {
    const suggestion = suggestions.find(s => s.id === id);
    if (action === "approved" && suggestion) {
      // Apply the suggestion to site_content
      const existing = siteContent.find(c => c.section_key === suggestion.section_key);
      if (existing) {
        await supabase.from("site_content").update({
          title: suggestion.suggested_title || existing.title,
          content: suggestion.suggested_content || existing.content,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        }).eq("id", existing.id);
      }
    }
    await supabase.from("content_suggestions").update({
      status: action, reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    toast({ title: action === "approved" ? "Suggestion approved & applied!" : "Suggestion rejected" });
    fetchAll();
  };

  // Group site content by page for organized editing
  const contentByPage: Record<string, any[]> = {};
  const pageLabels: Record<string, string> = {
    home_intro: "Home", newsletter: "Home", hero_title: "Home", hero_subtitle: "Home",
    about_hero: "About", about_values: "About",
    contact_header: "Contact", contact_info: "Contact",
    events_header: "Events", recipes_header: "Recipes", blog_header: "Blog",
  };
  siteContent.forEach(item => {
    const page = pageLabels[item.section_key] || "Other";
    if (!contentByPage[page]) contentByPage[page] = [];
    contentByPage[page].push(item);
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return null;

  const pendingCount = members.filter(m => !m.approved).length;
  const pendingSuggestions = suggestions.filter(s => s.status === "pending").length;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-heading">Admin Dashboard</h1>
          <Badge variant="default" className="text-sm">Admin</Badge>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="members">
              Members {pendingCount > 0 && (
                <span className="ml-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">{pendingCount}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="hero">Hero Slides</TabsTrigger>
            <TabsTrigger value="pages">
              <FileText className="w-3 h-3 mr-1" /> Page Content
            </TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="suggestions">
              <MessageSquareText className="w-3 h-3 mr-1" /> Suggestions
              {pendingSuggestions > 0 && (
                <span className="ml-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">{pendingSuggestions}</span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="w-5 h-5" /> Family Members</h2>
            {pendingCount > 0 && (
              <Card className="p-4 border-primary/50 bg-primary/5">
                <h3 className="font-semibold mb-3 text-primary">⏳ Pending Approval</h3>
                <div className="space-y-3">
                  {members.filter(m => !m.approved).map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div>
                        <p className="font-medium">{member.display_name || "No name"}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">Joined {new Date(member.created_at).toLocaleDateString()}</p>
                      </div>
                      <Button size="sm" onClick={() => approveMember(member.id)}><UserCheck className="w-4 h-4 mr-1" /> Approve</Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">✅ Approved Members</h3>
              <div className="space-y-3">
                {members.filter(m => m.approved).map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{member.display_name || "No name"}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    {member.email !== 'justinoel254@gmail.com' && (
                      <Button size="sm" variant="outline" onClick={() => revokeMember(member.id)}><UserX className="w-4 h-4 mr-1" /> Revoke</Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Hero Slides Tab */}
          <TabsContent value="hero" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Image className="w-5 h-5" /> Add New Hero Slide</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Slide title" value={newSlide.title} onChange={(e) => setNewSlide(p => ({ ...p, title: e.target.value }))} />
                <Input placeholder="Subtitle" value={newSlide.subtitle} onChange={(e) => setNewSlide(p => ({ ...p, subtitle: e.target.value }))} />
                <div className="md:col-span-2 flex gap-2">
                  <Input placeholder="Image URL (or upload)" value={newSlide.image_url} onChange={(e) => setNewSlide(p => ({ ...p, image_url: e.target.value }))} className="flex-1" />
                  <label className="cursor-pointer">
                    <Button variant="outline" asChild disabled={uploading}><span><Upload className="w-4 h-4 mr-1" />{uploading ? "..." : "Upload"}</span></Button>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSlideImageUpload(e, "new")} />
                  </label>
                </div>
                {newSlide.image_url && <div className="md:col-span-2"><img src={newSlide.image_url} alt="Preview" className="h-32 rounded object-cover" /></div>}
                <Button onClick={addSlide} className="md:col-span-2"><Plus className="w-4 h-4 mr-2" /> Add Slide</Button>
              </div>
            </Card>
            <div className="grid gap-4">
              {heroSlides.map((slide) => (
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
                                <Button variant="outline" asChild disabled={uploading}><span><Upload className="w-4 h-4" /></span></Button>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSlideImageUpload(e, "edit")} />
                              </label>
                            </div>
                            {editingSlide.image_url && <img src={editingSlide.image_url} alt="Preview" className="h-32 rounded object-cover" />}
                            <div className="flex items-center gap-2">
                              <input type="checkbox" checked={editingSlide.active} onChange={(e) => setEditingSlide((p: any) => ({ ...p, active: e.target.checked }))} />
                              <label>Active</label>
                            </div>
                            <Button onClick={() => updateSlide(editingSlide)} className="w-full"><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" size="icon" onClick={() => deleteSlide(slide.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Page Content Tab */}
          <TabsContent value="pages" className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> Edit Page Content</h2>
            <p className="text-sm text-muted-foreground">Edit the text and content displayed on each page of the website. Changes are applied immediately.</p>
            {Object.entries(contentByPage).map(([page, items]) => (
              <Card key={page} className="p-6">
                <h3 className="text-lg font-semibold text-heading mb-4 flex items-center gap-2">
                  <Badge variant="outline">{page}</Badge>
                </h3>
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
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Title</label>
                            <Input value={editingContent.title || ""} onChange={(e) => setEditingContent((p: any) => ({ ...p, title: e.target.value }))} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Subtitle</label>
                            <Input value={editingContent.subtitle || ""} onChange={(e) => setEditingContent((p: any) => ({ ...p, subtitle: e.target.value }))} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Content</label>
                            <Textarea value={editingContent.content || ""} onChange={(e) => setEditingContent((p: any) => ({ ...p, content: e.target.value }))} rows={4} />
                          </div>
                          <Button onClick={() => updateContent(editingContent)} size="sm"><Save className="w-3 h-3 mr-1" /> Save</Button>
                        </div>
                      ) : (
                        <div className="text-sm">
                          {item.title && <p className="font-medium text-heading">{item.title}</p>}
                          {item.subtitle && <p className="text-muted-foreground text-xs">{item.subtitle}</p>}
                          {item.content && <p className="text-muted-foreground mt-1">{item.content}</p>}
                          {!item.title && !item.content && <p className="text-muted-foreground italic">No content set</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
            {siteContent.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No editable content sections found.</p>
            )}
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <img src={photo.image_url} alt={photo.title} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{photo.title}</p>
                    <p className="text-xs text-muted-foreground">{photo.category}</p>
                    <Button variant="destructive" size="sm" className="mt-2 w-full" onClick={() => deletePhoto(photo.id)}>
                      <Trash2 className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  </div>
                </Card>
              ))}
              {galleryPhotos.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-8">No photos yet.</p>
              )}
            </div>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><MessageSquareText className="w-5 h-5" /> Member Suggestions</h2>
            <p className="text-sm text-muted-foreground">Review and approve content suggestions from family members.</p>
            {suggestions.filter(s => s.status === "pending").length > 0 && (
              <Card className="p-4 border-primary/50 bg-primary/5">
                <h3 className="font-semibold mb-3 text-primary">⏳ Pending Suggestions</h3>
                <div className="space-y-3">
                  {suggestions.filter(s => s.status === "pending").map(suggestion => (
                    <div key={suggestion.id} className="p-4 bg-background rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex gap-2 mb-2">
                            <Badge variant="outline">{suggestion.page}</Badge>
                            <Badge variant="secondary">{suggestion.section_key}</Badge>
                          </div>
                          {suggestion.suggested_title && <p className="font-medium text-heading">Title: {suggestion.suggested_title}</p>}
                          {suggestion.suggested_content && <p className="text-sm text-muted-foreground mt-1">{suggestion.suggested_content}</p>}
                          <p className="text-xs text-muted-foreground mt-2">{new Date(suggestion.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" onClick={() => handleSuggestion(suggestion.id, "approved")}><Check className="w-3 h-3 mr-1" /> Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleSuggestion(suggestion.id, "rejected")}><X className="w-3 h-3 mr-1" /> Reject</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">📋 All Suggestions</h3>
              {suggestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No suggestions yet.</p>
              ) : (
                <div className="space-y-2">
                  {suggestions.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{s.suggested_title || s.suggested_content?.slice(0, 50) || "Untitled"}</p>
                        <p className="text-xs text-muted-foreground">{s.page} · {s.section_key}</p>
                      </div>
                      <Badge variant={s.status === "approved" ? "default" : s.status === "rejected" ? "destructive" : "secondary"}>
                        {s.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
