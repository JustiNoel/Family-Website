import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, MessageSquare } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { ScrollAnimator } from "@/components/ScrollAnimator";
import { PageHeaderSkeleton, CardGridSkeleton } from "@/components/LoadingSkeleton";

interface BlogPost {
  id: string;
  title: string;
  author: string;
  content: string | null;
  excerpt: string | null;
  category: string;
  image_url: string | null;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { get } = useSiteContent(["blog_header"]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.from("blog_posts").select("*").eq("published", true).order("created_at", { ascending: false });
      if (data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  if (loading) return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <PageHeaderSkeleton />
        <CardGridSkeleton count={3} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <ScrollAnimator>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
              {get("blog_header", "title", "Family Blog")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {get("blog_header", "content", "Stories, updates, and announcements from the Azzariah family")}
            </p>
          </div>
        </ScrollAnimator>

        {selectedPost ? (
          <ScrollAnimator>
            <div className="max-w-4xl mx-auto">
              <Button variant="outline" onClick={() => setSelectedPost(null)} className="mb-6">← Back to all posts</Button>
              <Card className="p-8 md:p-12">
                {selectedPost.image_url && (
                  <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-64 object-cover rounded-lg mb-8" loading="lazy" />
                )}
                <Badge className="mb-4">{selectedPost.category}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-heading mb-4">{selectedPost.title}</h1>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
                  <div className="flex items-center gap-2"><User className="w-4 h-4" /><span>{selectedPost.author}</span></div>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{new Date(selectedPost.created_at).toLocaleDateString()}</span></div>
                </div>
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{selectedPost.content || selectedPost.excerpt}</p>
                </div>
              </Card>
            </div>
          </ScrollAnimator>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📝</p>
            <p className="text-xl text-muted-foreground">No blog posts yet. Stay tuned!</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">
            {posts.map((post, index) => (
              <ScrollAnimator key={post.id} delay={index * 100}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => setSelectedPost(post)}>
                  <div className="md:flex">
                    {post.image_url ? (
                      <div className="md:w-1/3">
                        <img src={post.image_url} alt={post.title} className="w-full h-full min-h-[200px] object-cover" loading="lazy" />
                      </div>
                    ) : (
                      <div className="md:w-1/3 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center p-12">
                        <span className="text-8xl">📄</span>
                      </div>
                    )}
                    <div className="md:w-2/3 p-6 md:p-8">
                      <Badge className="mb-3">{post.category}</Badge>
                      <h2 className="text-2xl md:text-3xl font-bold text-heading mb-3 hover:text-primary transition-colors">{post.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1"><User className="w-4 h-4" /><span>{post.author}</span></div>
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{new Date(post.created_at).toLocaleDateString()}</span></div>
                      </div>
                      <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt || post.content}</p>
                      <Button variant="outline">Read More →</Button>
                    </div>
                  </div>
                </Card>
              </ScrollAnimator>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
