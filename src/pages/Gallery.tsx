import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, Upload, MessageCircle, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface GalleryPhoto {
  id: string;
  title: string;
  caption: string | null;
  category: string;
  image_url: string;
  created_at: string;
  uploaded_by: string | null;
}

interface PhotoComment {
  id: string;
  photo_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { display_name: string | null } | null;
}

const categories = ["All", "Holidays", "Milestones", "Vacations", "Celebrations", "Kids", "General"];

const Gallery = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [comments, setComments] = useState<PhotoComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({ title: "", caption: "", category: "General" });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (selectedPhoto) {
      fetchComments(selectedPhoto.id);
      // Realtime comments
      const channel = supabase
        .channel(`comments-${selectedPhoto.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "photo_comments", filter: `photo_id=eq.${selectedPhoto.id}` }, () => {
          fetchComments(selectedPhoto.id);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [selectedPhoto]);

  const fetchPhotos = async () => {
    setLoadingPhotos(true);
    const { data } = await supabase.from("gallery_photos").select("*").order("created_at", { ascending: false });
    if (data) setPhotos(data);
    setLoadingPhotos(false);
  };

  const fetchComments = async (photoId: string) => {
    const { data } = await supabase
      .from("photo_comments")
      .select("*, profiles(display_name)")
      .eq("photo_id", photoId)
      .order("created_at", { ascending: true });
    if (data) setComments(data as any);
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadData.title || !user) return;
    setUploading(true);
    try {
      const ext = uploadFile.name.split(".").pop();
      const path = `gallery/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(path, uploadFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);

      const { error } = await supabase.from("gallery_photos").insert({
        title: uploadData.title,
        caption: uploadData.caption || null,
        category: uploadData.category,
        image_url: urlData.publicUrl,
        uploaded_by: user.id,
      });
      if (error) throw error;

      toast({ title: "Photo uploaded!", description: "Your photo has been added to the gallery." });
      setShowUpload(false);
      setUploadData({ title: "", caption: "", category: "General" });
      setUploadFile(null);
      fetchPhotos();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedPhoto || !user) return;
    const { error } = await supabase.from("photo_comments").insert({
      photo_id: selectedPhoto.id,
      user_id: user.id,
      content: newComment.trim(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewComment("");
    }
  };

  const deleteComment = async (commentId: string) => {
    await supabase.from("photo_comments").delete().eq("id", commentId);
  };

  const deletePhoto = async (photoId: string) => {
    await supabase.from("gallery_photos").delete().eq("id", photoId);
    setSelectedPhoto(null);
    fetchPhotos();
    toast({ title: "Photo deleted" });
  };

  const filteredPhotos = photos.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.caption || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">Photo Gallery</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse through our collection of cherished memories and special moments
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {user && (
              <Button onClick={() => setShowUpload(!showUpload)} className="w-full sm:w-auto">
                <Upload className="w-4 h-4 mr-2" /> Upload Photos
              </Button>
            )}
          </div>

          {/* Upload form */}
          {showUpload && user && (
            <Card className="p-6 space-y-4 animate-fade-in">
              <h3 className="font-semibold">Upload a Photo</h3>
              <Input
                placeholder="Photo title"
                value={uploadData.title}
                onChange={(e) => setUploadData(p => ({ ...p, title: e.target.value }))}
              />
              <Textarea
                placeholder="Caption (optional)"
                value={uploadData.caption}
                onChange={(e) => setUploadData(p => ({ ...p, caption: e.target.value }))}
              />
              <select
                value={uploadData.category}
                onChange={(e) => setUploadData(p => ({ ...p, category: e.target.value }))}
                className="w-full border rounded-md p-2 bg-background"
              >
                {categories.filter(c => c !== "All").map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full"
              />
              <Button onClick={handleUpload} disabled={uploading || !uploadFile || !uploadData.title}>
                {uploading ? "Uploading..." : "Upload Photo"}
              </Button>
            </Card>
          )}

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {loadingPhotos ? (
          <div className="text-center py-12 text-muted-foreground">Loading photos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo, index) => (
              <Card
                key={photo.id}
                className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-heading group-hover:text-primary transition-colors">
                      {photo.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(photo.created_at).getFullYear()}
                    </Badge>
                  </div>
                  {photo.caption && <p className="text-sm text-muted-foreground line-clamp-2">{photo.caption}</p>}
                  <Badge variant="outline" className="mt-3 text-xs">{photo.category}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loadingPhotos && filteredPhotos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {photos.length === 0 ? "No photos yet. Be the first to upload!" : "No photos found matching your criteria."}
            </p>
          </div>
        )}

        {/* Lightbox Modal with Comments */}
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedPhoto && (
              <div className="space-y-4">
                <img
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.title}
                  className="w-full max-h-[50vh] object-contain rounded-lg bg-muted"
                />
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-heading">{selectedPhoto.title}</h2>
                    {selectedPhoto.caption && (
                      <p className="text-muted-foreground mt-1">{selectedPhoto.caption}</p>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline">{selectedPhoto.category}</Badge>
                    {isAdmin && (
                      <Button variant="destructive" size="sm" onClick={() => deletePhoto(selectedPhoto.id)}>
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <MessageCircle className="w-4 h-4" /> Comments ({comments.length})
                  </h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-muted/50 rounded-lg p-3 flex justify-between items-start">
                        <div>
                          <p className="text-xs font-medium text-primary">
                            {(comment as any).profiles?.display_name || "Family Member"}
                          </p>
                          <p className="text-sm mt-1">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {(user?.id === comment.user_id || isAdmin) && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteComment(comment.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">No comments yet.</p>
                    )}
                  </div>
                  {user ? (
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addComment()}
                      />
                      <Button size="icon" onClick={addComment}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-3 text-center">
                      Sign in to leave a comment
                    </p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Gallery;
