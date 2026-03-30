import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Clock, ChefHat, Star } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { ScrollAnimator } from "@/components/ScrollAnimator";
import { PageHeaderSkeleton, CardGridSkeleton } from "@/components/LoadingSkeleton";

interface Recipe {
  id: string;
  title: string;
  category: string;
  prep_time: string | null;
  cook_time: string | null;
  servings: string | null;
  ingredients: string[];
  instructions: string[];
  image_url: string | null;
  rating: number;
}

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { get } = useSiteContent(["recipes_header"]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const { data } = await supabase.from("recipes").select("*").order("created_at", { ascending: false });
      if (data) setRecipes(data.map((r: any) => ({
        ...r,
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
        instructions: Array.isArray(r.instructions) ? r.instructions : [],
      })));
      setLoading(false);
    };
    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen py-12"><div className="container mx-auto px-4"><PageHeaderSkeleton /><CardGridSkeleton /></div></div>
  );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <ScrollAnimator>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
              {get("recipes_header", "title", "Family Recipes")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {get("recipes_header", "content", "Treasured recipes and culinary traditions passed down through generations")}
            </p>
          </div>
        </ScrollAnimator>

        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="text" placeholder="Search recipes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🍳</p>
            <p className="text-xl text-muted-foreground">No recipes yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <ScrollAnimator key={recipe.id} delay={index * 100}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                  {recipe.image_url ? (
                    <img src={recipe.image_url} alt={recipe.title} className="w-full h-48 object-cover" loading="lazy" />
                  ) : (
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-12 flex items-center justify-center">
                      <span className="text-8xl">🍽️</span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge className="mb-2">{recipe.category}</Badge>
                        <h3 className="text-xl font-bold text-heading">{recipe.title}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(recipe.rating)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-current" />))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      {recipe.prep_time && <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{recipe.prep_time}</span></div>}
                      {recipe.cook_time && <div className="flex items-center gap-1"><ChefHat className="w-4 h-4" /><span>{recipe.cook_time}</span></div>}
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="ingredients">
                        <AccordionTrigger>Ingredients</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {recipe.ingredients.map((ingredient, i) => (<li key={i}>• {ingredient}</li>))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="instructions">
                        <AccordionTrigger>Instructions</AccordionTrigger>
                        <AccordionContent>
                          <ol className="space-y-2 text-sm text-muted-foreground">
                            {recipe.instructions.map((step, i) => (<li key={i}>{i + 1}. {step}</li>))}
                          </ol>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
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

export default Recipes;
