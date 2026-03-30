import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { GlobalSearch } from "@/components/GlobalSearch";
import familyLogo from "@/assets/family-logo.png";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Gallery", path: "/gallery" },
  { name: "Blog", path: "/blog" },
  { name: "Events", path: "/events" },
  { name: "Recipes", path: "/recipes" },
  { name: "Contact", path: "/contact" },
];

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={familyLogo} alt="The Azzariah's Family Logo" className="w-12 h-12 transition-transform group-hover:scale-110 group-hover:rotate-3" />
            <span className="text-xl font-semibold text-heading hidden sm:inline">The Azzariah's Family</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary hover:text-heading"
                )}
              >
                {item.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1",
                  location.pathname === "/admin"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary hover:text-heading"
                )}
              >
                <Shield className="w-3 h-3" /> Admin
              </Link>
            )}
            <GlobalSearch />
            <NotificationBell />
            <ThemeToggle />
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="ml-1">
                <LogOut className="w-4 h-4 mr-1" /> Sign Out
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="ml-1">
                  <LogIn className="w-4 h-4 mr-1" /> Sign In
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <NotificationBell />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in-up">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                {item.name}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary">
                <Shield className="w-3 h-3 inline mr-1" /> Admin Dashboard
              </Link>
            )}
            <div className="flex items-center justify-between px-4 py-3">
              {user ? (
                <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="rounded-lg text-sm font-medium text-foreground hover:bg-secondary px-3 py-2">
                  <LogOut className="w-3 h-3 inline mr-1" /> Sign Out
                </button>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="rounded-lg text-sm font-medium text-primary hover:bg-secondary px-3 py-2">
                  <LogIn className="w-3 h-3 inline mr-1" /> Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
