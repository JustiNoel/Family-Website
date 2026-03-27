import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import heroImage1 from "@/assets/hero-family-1.jpg";
import heroImage2 from "@/assets/hero-family-2.jpg";
import heroImage3 from "@/assets/hero-family-3.jpg";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  sort_order: number;
  active: boolean;
}

const fallbackImages = [
  { src: heroImage1, alt: "Family portrait" },
  { src: heroImage2, alt: "Family gathering" },
  { src: heroImage3, alt: "Family celebration" },
];

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [siteContent, setSiteContent] = useState<{ title?: string; subtitle?: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [slidesRes, contentRes] = await Promise.all([
        supabase.from("hero_slides").select("*").eq("active", true).order("sort_order"),
        supabase.from("site_content").select("*").eq("section_key", "hero_welcome").maybeSingle(),
      ]);
      if (slidesRes.data && slidesRes.data.length > 0) setSlides(slidesRes.data);
      if (contentRes.data) setSiteContent(contentRes.data);
    };
    fetchData();
  }, []);

  const images = slides.length > 0
    ? slides.map(s => ({ src: s.image_url, alt: s.title }))
    : fallbackImages;

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const goToPrevious = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);

  const heroTitle = siteContent?.title || "Welcome to The Azzariah's Family Hub";
  const heroSubtitle = siteContent?.subtitle || "Where Memories Live Forever";

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 animate-fade-in">
          {heroTitle}
        </h1>
        <p className="text-xl md:text-2xl text-white/90 max-w-2xl animate-fade-in-up">
          {heroSubtitle}
        </p>
      </div>

      <Button variant="ghost" size="icon" onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white">
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <Button variant="ghost" size="icon" onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white">
        <ChevronRight className="w-6 h-6" />
      </Button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-white w-8" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
