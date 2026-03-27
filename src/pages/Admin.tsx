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
import { Plus, Trash2, Edit, Image, Upload, Save, UserCheck, UserX, Users } from "lucide-react";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [newSlide, setNewSlide] = useState({ title: "", subtitle: "", image_url: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
      return;
    }
    if (isAdmin) {
      fetchAll();
    }
  }, [loading, user, isAdmin]);

  const fetchAll = async () => {
    const [slides, content, photos, membersRes] = await Promise.all([
      supabase.from("hero_slides").select("*").order("sort_order"),
      supabase.from("site_content").select("*"),
      supabase.from("gallery_photos").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    if (slides.data) setHeroSlides(slides.data);
    if (content.data) setSiteContent(content.data);
    if (photos.data) setGalleryPhotos(photos.data);
    if (membersRes.data) setMembers(membersRes.data);
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

  // Hero Slides Management
  const addSlide = async () => {
    if (!newSlide.title || !newSlide.image_url) return;
    const { error } = await supabase.from("hero_slides").insert({
      ...newSlide,
      sort_order: heroSlides.length,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Slide added!" });
      setNewSlide({ title: "", subtitle: "", image_url: "" });
      fetchAll();
    }
  };

  const updateSlide = async (slide: any) => {
    const { error } = await supabase.from("hero_slides").update({
      title: slide.title,
      subtitle: slide.subtitle,
      image_url: slide.image_url,
      active: slide.active,
    }).eq("id", slide.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Slide updated!" });
      setEditingSlide(null);
      fetchAll();
    }
  };

  const deleteSlide = async (id: string) => {
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);
    if (!error) {
      toast({ title: "Slide deleted" });
      fetchAll();
    }
  };

  // Site Content Management
  const updateContent = async (item: any) => {
    const { error } = await supabase.from("site_content").update({
      title: item.title,
      subtitle: item.subtitle,
      content: item.content,
      image_url: item.image_url,
      updated_at: new Date().toISOString(),
      updated_by: user?.id,
    }).eq("id", item.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Content updated!" });
      setEditingContent(null);
      fetchAll();
    }
  };

  // Gallery Management
  const deletePhoto = async (id: string) => {
    const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
    if (!error) {
      toast({ title: "Photo deleted" });
      fetchAll();
    }
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "new" | "edit") => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, "hero");
      if (target === "new") {
        setNewSlide(prev => ({ ...prev, image_url: url }));
      } else if (editingSlide) {
        setEditingSlide((prev: any) => ({ ...prev, image_url: url }));
      }
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-heading">Admin Dashboard</h1>
          <Badge variant="default" className="text-sm">Admin</Badge>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hero">Hero Slides</TabsTrigger>
            <TabsTrigger value="content">Site Content</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>

          {/* Hero Slides Tab */}
          <TabsContent value="hero" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Image className="w-5 h-5" /> Add New Hero Slide
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Slide title"
                  value={newSlide.title}
                  onChange={(e) => setNewSlide(p => ({ ...p, title: e.target.value }))}
                />
                <Input
                  placeholder="Subtitle"
                  value={newSlide.subtitle}
                  onChange={(e) => setNewSlide(p => ({ ...p, subtitle: e.target.value }))}
                />
                <div className="md:col-span-2 flex gap-2">
                  <Input
                    placeholder="Image URL (or upload)"
                    value={newSlide.image_url}
                    onChange={(e) => setNewSlide(p => ({ ...p, image_url: e.target.value }))}
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <Button variant="outline" asChild disabled={uploading}>
                      <span><Upload className="w-4 h-4 mr-1" />{uploading ? "..." : "Upload"}</span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSlideImageUpload(e, "new")} />
                  </label>
                </div>
                {newSlide.image_url && (
                  <div className="md:col-span-2">
                    <img src={newSlide.image_url} alt="Preview" className="h-32 rounded object-cover" />
                  </div>
                )}
                <Button onClick={addSlide} className="md:col-span-2">
                  <Plus className="w-4 h-4 mr-2" /> Add Slide
                </Button>
              </div>
            </Card>

            <div className="grid gap-4">
              {heroSlides.map((slide) => (
                <Card key={slide.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      className="w-24 h-16 rounded object-cover bg-muted"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{slide.title}</h3>
                      <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
                    </div>
                    <Badge variant={slide.active ? "default" : "secondary"}>
                      {slide.active ? "Active" : "Inactive"}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setEditingSlide({ ...slide })}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Slide</DialogTitle>
                        </DialogHeader>
                        {editingSlide && (
                          <div className="space-y-4">
                            <Input
                              placeholder="Title"
                              value={editingSlide.title}
                              onChange={(e) => setEditingSlide((p: any) => ({ ...p, title: e.target.value }))}
                            />
                            <Input
                              placeholder="Subtitle"
                              value={editingSlide.subtitle || ""}
                              onChange={(e) => setEditingSlide((p: any) => ({ ...p, subtitle: e.target.value }))}
                            />
                            <div className="flex gap-2">
                              <Input
                                placeholder="Image URL"
                                value={editingSlide.image_url}
                                onChange={(e) => setEditingSlide((p: any) => ({ ...p, image_url: e.target.value }))}
                                className="flex-1"
                              />
                              <label className="cursor-pointer">
                                <Button variant="outline" asChild disabled={uploading}>
                                  <span><Upload className="w-4 h-4" /></span>
                                </Button>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSlideImageUpload(e, "edit")} />
                              </label>
                            </div>
                            {editingSlide.image_url && (
                              <img src={editingSlide.image_url} alt="Preview" className="h-32 rounded object-cover" />
                            )}
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editingSlide.active}
                                onChange={(e) => setEditingSlide((p: any) => ({ ...p, active: e.target.checked }))}
                              />
                              <label>Active</label>
                            </div>
                            <Button onClick={() => updateSlide(editingSlide)} className="w-full">
                              <Save className="w-4 h-4 mr-2" /> Save Changes
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" size="icon" onClick={() => deleteSlide(slide.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Site Content Tab */}
          <TabsContent value="content" className="space-y-4">
            {siteContent.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline">{item.section_key}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingContent(editingContent?.id === item.id ? null : { ...item })}
                  >
                    <Edit className="w-4 h-4 mr-1" /> {editingContent?.id === item.id ? "Cancel" : "Edit"}
                  </Button>
                </div>
                {editingContent?.id === item.id ? (
                  <div className="space-y-3">
                    <Input
                      placeholder="Title"
                      value={editingContent.title || ""}
                      onChange={(e) => setEditingContent((p: any) => ({ ...p, title: e.target.value }))}
                    />
                    <Input
                      placeholder="Subtitle"
                      value={editingContent.subtitle || ""}
                      onChange={(e) => setEditingContent((p: any) => ({ ...p, subtitle: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Content"
                      value={editingContent.content || ""}
                      onChange={(e) => setEditingContent((p: any) => ({ ...p, content: e.target.value }))}
                      rows={4}
                    />
                    <Button onClick={() => updateContent(editingContent)}>
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
                    <p className="mt-2 text-foreground">{item.content}</p>
                  </div>
                )}
              </Card>
            ))}
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
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => deletePhoto(photo.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  </div>
                </Card>
              ))}
              {galleryPhotos.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-8">
                  No photos yet. Upload some from the Gallery page!
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
