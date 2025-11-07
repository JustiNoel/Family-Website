import { Heart, Facebook, Instagram, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Family Motto */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <Heart className="w-5 h-5 text-primary" />
              <span className="font-semibold text-heading">The Azzariah's Family</span>
            </div>
            <p className="text-muted-foreground italic">
              "Where memories live forever, and love grows stronger with each generation."
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="font-semibold text-heading mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/gallery" className="block text-muted-foreground hover:text-primary transition-colors">
                Gallery
              </Link>
              <Link to="/events" className="block text-muted-foreground hover:text-primary transition-colors">
                Events
              </Link>
            </div>
          </div>

          {/* Social Media */}
          <div className="text-center md:text-right">
            <h4 className="font-semibold text-heading mb-4">Connect With Us</h4>
            <div className="flex gap-3 justify-center md:justify-end">
              <Button variant="outline" size="icon" className="hover:bg-primary hover:text-primary-foreground">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="hover:bg-primary hover:text-primary-foreground">
                <Instagram className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} The Azzariah's Family. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <Button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 rounded-full shadow-lg"
        size="icon"
      >
        <ArrowUp className="w-4 h-4" />
      </Button>
    </footer>
  );
};
