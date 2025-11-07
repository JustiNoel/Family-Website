import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Upload } from "lucide-react";

// Sample gallery data - in production, this would come from a database
const galleryItems = [
  { id: 1, title: "Summer Reunion 2024", year: "2024", category: "Holidays", caption: "Annual family gathering at the lake house" },
  { id: 2, title: "Sarah's Graduation", year: "2023", category: "Milestones", caption: "Celebrating Sarah's college graduation" },
  { id: 3, title: "Christmas Dinner", year: "2023", category: "Holidays", caption: "Traditional family Christmas celebration" },
  { id: 4, title: "Beach Vacation", year: "2024", category: "Vacations", caption: "Fun in the sun at the beach" },
  { id: 5, title: "Grandpa's 80th Birthday", year: "2023", category: "Celebrations", caption: "Milestone birthday celebration" },
  { id: 6, title: "Emma's Art Show", year: "2024", category: "Milestones", caption: "Emma's first solo art exhibition" },
  { id: 7, title: "Thanksgiving 2023", year: "2023", category: "Holidays", caption: "Grateful hearts and full plates" },
  { id: 8, title: "Michael's Soccer Game", year: "2024", category: "Kids", caption: "Championship game victory!" },
  { id: 9, title: "Easter Egg Hunt", year: "2024", category: "Holidays", caption: "Annual Easter tradition" },
];

const categories = ["All", "Holidays", "Milestones", "Vacations", "Celebrations", "Kids"];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<typeof galleryItems[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems = galleryItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.caption.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
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
                placeholder="Search photos by title or caption..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Upload className="w-4 h-4 mr-2" />
              Upload Photos
            </Button>
          </div>

          {/* Category Filter */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <Card
              key={item.id}
              className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedImage(item)}
            >
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <span className="text-6xl">📷</span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-heading group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">{item.year}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.caption}</p>
                <Badge variant="outline" className="mt-3 text-xs">{item.category}</Badge>
              </div>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No photos found matching your criteria.</p>
          </div>
        )}

        {/* Lightbox Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            {selectedImage && (
              <div className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                  <span className="text-8xl">📷</span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-heading">{selectedImage.title}</h2>
                    <Badge>{selectedImage.year}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{selectedImage.caption}</p>
                  <Badge variant="outline">{selectedImage.category}</Badge>
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
