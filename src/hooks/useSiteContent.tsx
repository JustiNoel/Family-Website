import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteContentItem {
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image_url: string | null;
  metadata: any;
}

export const useSiteContent = (sectionKeys: string[]) => {
  const [content, setContent] = useState<Record<string, SiteContentItem>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("*")
        .in("section_key", sectionKeys);
      if (data) {
        const map: Record<string, SiteContentItem> = {};
        data.forEach((item) => {
          map[item.section_key] = item;
        });
        setContent(map);
      }
      setLoading(false);
    };
    fetchContent();
  }, [sectionKeys.join(",")]);

  const get = (key: string, field: "title" | "subtitle" | "content" | "image_url", fallback: string = "") => {
    return content[key]?.[field] || fallback;
  };

  return { content, loading, get };
};
