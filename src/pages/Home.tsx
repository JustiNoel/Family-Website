import { Link } from "react-router-dom";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Image, Calendar, BookOpen, Mail, UtensilsCrossed } from "lucide-react";

const featureCards = [
  {
    icon: Users,
    title: "Our Story",
    description: "Discover our family's journey, values, and the bonds that connect us across generations.",
    link: "/about",
  },
  {
    icon: Image,
    title: "Photo Gallery",
    description: "Browse through cherished memories, special moments, and milestone celebrations.",
    link: "/gallery",
  },
  {
    icon: Calendar,
    title: "Upcoming Events",
    description: "Stay updated on family gatherings, celebrations, and important dates.",
    link: "/events",
  },
  {
    icon: UtensilsCrossed,
    title: "Family Recipes",
    description: "Explore treasured recipes and culinary traditions passed down through generations.",
    link: "/recipes",
  },
  {
    icon: BookOpen,
    title: "Family Blog",
    description: "Read updates, stories, and announcements from family members.",
    link: "/blog",
  },
  {
    icon: Mail,
    title: "Connect With Us",
    description: "Get in touch, share your thoughts, or leave a message in our guestbook.",
    link: "/contact",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroCarousel />

      {/* Family Introduction */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-heading mb-6">
            Welcome to Our Digital Home
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The Azzariah's Family website is a place where we celebrate our heritage, share our stories, 
            and stay connected no matter where life takes us. From treasured recipes to precious memories, 
            this is where our family's legacy lives on for generations to come.
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container mx-auto px-4 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((card, index) => (
            <Link to={card.link} key={index}>
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <card.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-heading">{card.title}</h3>
                  <p className="text-muted-foreground">{card.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-card border-y border-border py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-heading mb-4">Stay Connected</h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to our family newsletter for updates, event reminders, and special announcements.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button className="sm:w-auto">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
