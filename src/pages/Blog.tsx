import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, MessageSquare } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "Summer Reunion 2024: A Weekend to Remember",
    author: "David Azzariah",
    date: "July 15, 2024",
    category: "Events",
    excerpt: "This year's summer reunion was our biggest gathering yet! With over 40 family members in attendance, we created memories that will last a lifetime. From the epic water balloon fight to Grandma's famous BBQ, every moment was special.",
    image: "🌞",
  },
  {
    id: 2,
    title: "Emma's Art Exhibition: A Proud Family Moment",
    author: "Sarah Azzariah",
    date: "June 3, 2024",
    category: "Milestones",
    excerpt: "Our talented Emma held her first solo art exhibition last month, and the entire family showed up to support her! The gallery was filled with her stunning paintings, each telling a story of our family's journey. We couldn't be more proud!",
    image: "🎨",
  },
  {
    id: 3,
    title: "Grandpa's Secret Recipe Finally Revealed!",
    author: "Mary Azzariah",
    date: "May 20, 2024",
    category: "Recipes",
    excerpt: "After 50 years of keeping it under wraps, Grandpa John has finally shared his legendary BBQ sauce recipe! Get ready to elevate your grilling game with this family treasure. The secret? Well, you'll have to read on to find out...",
    image: "🍖",
  },
];

const Blog = () => {
  const [selectedPost, setSelectedPost] = useState<typeof blogPosts[0] | null>(null);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">Family Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stories, updates, and announcements from the Azzariah family
          </p>
        </div>

        {selectedPost ? (
          /* Full Post View */
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <Button
              variant="outline"
              onClick={() => setSelectedPost(null)}
              className="mb-6"
            >
              ← Back to all posts
            </Button>
            <Card className="p-8 md:p-12">
              <div className="text-center mb-8">
                <span className="text-8xl mb-6 block">{selectedPost.image}</span>
                <Badge className="mb-4">{selectedPost.category}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-heading mb-4">
                  {selectedPost.title}
                </h1>
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{selectedPost.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedPost.date}</span>
                  </div>
                </div>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {selectedPost.excerpt}
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                  fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
                  culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-xl font-semibold text-heading mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments
                </h3>
                <p className="text-muted-foreground text-center py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              </div>
            </Card>
          </div>
        ) : (
          /* Blog Post List */
          <div className="max-w-5xl mx-auto space-y-8">
            {blogPosts.map((post, index) => (
              <Card
                key={post.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedPost(post)}
              >
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center p-12">
                    <span className="text-8xl">{post.image}</span>
                  </div>
                  <div className="md:w-2/3 p-6 md:p-8">
                    <Badge className="mb-3">{post.category}</Badge>
                    <h2 className="text-2xl md:text-3xl font-bold text-heading mb-3 hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <Button variant="outline">Read More →</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
