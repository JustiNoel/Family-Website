import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Clock, ChefHat, Star } from "lucide-react";

const recipes = [
  {
    id: 1,
    title: "Grandma's Famous Apple Pie",
    category: "Dessert",
    prepTime: "30 min",
    cookTime: "1 hour",
    rating: 5,
    image: "🥧",
    ingredients: [
      "6 cups sliced apples",
      "3/4 cup sugar",
      "2 tablespoons flour",
      "1 teaspoon cinnamon",
      "Pie crust (homemade or store-bought)",
    ],
    instructions: [
      "Preheat oven to 425°F (220°C)",
      "Mix apples with sugar, flour, and cinnamon",
      "Place filling in pie crust and cover with top crust",
      "Bake for 45-50 minutes until golden brown",
      "Let cool before serving with vanilla ice cream",
    ],
  },
  {
    id: 2,
    title: "Grandpa's Secret BBQ Sauce",
    category: "Sauce",
    prepTime: "10 min",
    cookTime: "20 min",
    rating: 5,
    image: "🍖",
    ingredients: [
      "2 cups ketchup",
      "1/2 cup brown sugar",
      "1/4 cup apple cider vinegar",
      "2 tablespoons Worcestershire sauce",
      "1 tablespoon mustard powder",
      "Secret spice blend",
    ],
    instructions: [
      "Combine all ingredients in a saucepan",
      "Simmer on low heat for 20 minutes, stirring occasionally",
      "Let cool and store in refrigerator",
      "Use on ribs, chicken, or pulled pork",
    ],
  },
  {
    id: 3,
    title: "Mom's Sunday Pot Roast",
    category: "Main Dish",
    prepTime: "20 min",
    cookTime: "3 hours",
    rating: 5,
    image: "🍲",
    ingredients: [
      "3-4 lb beef chuck roast",
      "4 large potatoes, quartered",
      "4 carrots, cut in chunks",
      "2 onions, quartered",
      "2 cups beef broth",
      "Herbs and seasonings",
    ],
    instructions: [
      "Season roast with salt, pepper, and herbs",
      "Brown all sides in a large pot",
      "Add vegetables and broth",
      "Cover and cook on low for 3 hours until tender",
      "Serve with gravy made from pan juices",
    ],
  },
  {
    id: 4,
    title: "Aunt Sarah's Chocolate Chip Cookies",
    category: "Dessert",
    prepTime: "15 min",
    cookTime: "12 min",
    rating: 5,
    image: "🍪",
    ingredients: [
      "2 1/4 cups flour",
      "1 cup butter, softened",
      "3/4 cup brown sugar",
      "2 eggs",
      "2 cups chocolate chips",
      "1 teaspoon vanilla",
    ],
    instructions: [
      "Preheat oven to 375°F (190°C)",
      "Cream butter and sugars together",
      "Add eggs and vanilla, mix well",
      "Stir in flour and chocolate chips",
      "Drop by spoonfuls on baking sheet",
      "Bake 9-11 minutes until golden",
    ],
  },
];

const traditions = [
  {
    title: "Sunday Family Dinners",
    description: "Every Sunday, the family gathers for a home-cooked meal. This tradition started with Grandma Mary and has been passed down for three generations. No matter where life takes us, Sunday dinner brings us home.",
    icon: "🍽️",
  },
  {
    title: "Holiday Cookie Baking",
    description: "The week before Christmas, all the women in the family gather for a marathon cookie-baking session. We make dozens of varieties, share recipes, and create memories that smell like vanilla and cinnamon.",
    icon: "🎄",
  },
  {
    title: "Summer BBQ Championship",
    description: "Every July 4th, the men of the family compete in a friendly BBQ competition. Grandpa is the reigning champion with his secret sauce, but the younger generation is always trying to dethrone him!",
    icon: "🏆",
  },
];

const Recipes = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">Family Recipes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Treasured recipes and culinary traditions passed down through generations
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Recipes Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-heading mb-8">Our Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <Card
                key={recipe.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-12 flex items-center justify-center">
                  <span className="text-8xl">{recipe.image}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge className="mb-2">{recipe.category}</Badge>
                      <h3 className="text-xl font-bold text-heading">{recipe.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(recipe.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.prepTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="w-4 h-4" />
                      <span>{recipe.cookTime}</span>
                    </div>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="ingredients">
                      <AccordionTrigger>Ingredients</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {recipe.ingredients.map((ingredient, i) => (
                            <li key={i}>• {ingredient}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="instructions">
                      <AccordionTrigger>Instructions</AccordionTrigger>
                      <AccordionContent>
                        <ol className="space-y-2 text-sm text-muted-foreground">
                          {recipe.instructions.map((step, i) => (
                            <li key={i}>
                              {i + 1}. {step}
                            </li>
                          ))}
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Family Traditions */}
        <section>
          <h2 className="text-3xl font-bold text-heading mb-8">Family Traditions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {traditions.map((tradition, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="text-6xl mb-4 block">{tradition.icon}</span>
                <h3 className="text-xl font-semibold text-heading mb-3">{tradition.title}</h3>
                <p className="text-muted-foreground text-sm">{tradition.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Recipes;
