import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  type: "blog" | "event" | "recipe" | "photo";
  title: string;
  id: string;
}

export const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      const q = `%${query}%`;
      const [blogs, events, recipes, photos] = await Promise.all([
        supabase.from("blog_posts").select("id, title").ilike("title", q).eq("published", true).limit(3),
        supabase.from("events").select("id, title").ilike("title", q).limit(3),
        supabase.from("recipes").select("id, title").ilike("title", q).limit(3),
        supabase.from("gallery_photos").select("id, title").ilike("title", q).limit(3),
      ]);
      const r: SearchResult[] = [
        ...(blogs.data || []).map(b => ({ type: "blog" as const, title: b.title, id: b.id })),
        ...(events.data || []).map(e => ({ type: "event" as const, title: e.title, id: e.id })),
        ...(recipes.data || []).map(r => ({ type: "recipe" as const, title: r.title, id: r.id })),
        ...(photos.data || []).map(p => ({ type: "photo" as const, title: p.title, id: p.id })),
      ];
      setResults(r);
      setOpen(r.length > 0);
    }, 300);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    const routes: Record<string, string> = { blog: "/blog", event: "/events", recipe: "/recipes", photo: "/gallery" };
    navigate(routes[result.type]);
  };

  const typeLabels: Record<string, string> = { blog: "Blog", event: "Event", recipe: "Recipe", photo: "Photo" };
  const typeColors: Record<string, string> = { blog: "text-blue-500", event: "text-green-500", recipe: "text-orange-500", photo: "text-purple-500" };

  return (
    <div ref={ref} className="relative hidden lg:block">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="pl-8 pr-8 h-8 w-48 text-sm"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); }} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute top-full mt-1 w-72 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-3 py-2.5 hover:bg-muted/50 flex items-center gap-2 text-sm border-b last:border-0"
            >
              <span className={`text-xs font-medium ${typeColors[r.type]}`}>{typeLabels[r.type]}</span>
              <span className="text-foreground truncate">{r.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
