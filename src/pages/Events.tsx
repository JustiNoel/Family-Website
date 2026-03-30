import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Check } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ScrollAnimator } from "@/components/ScrollAnimator";
import { PageHeaderSkeleton, ListSkeleton } from "@/components/LoadingSkeleton";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  type: string;
  image_url: string | null;
  active: boolean;
}

const Events = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { get } = useSiteContent(["events_header"]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    if (data) setEvents(data);
    if (user) {
      const { data: userRsvps } = await supabase.from("event_rsvps").select("*").eq("user_id", user.id);
      if (userRsvps) {
        const map: Record<string, string> = {};
        userRsvps.forEach((r: any) => { map[r.event_id] = r.status; });
        setRsvps(map);
      }
    }
    setLoading(false);
  };

  const handleRsvp = async (eventId: string, status: string) => {
    if (!user) { toast({ title: "Please sign in to RSVP" }); return; }
    const existing = rsvps[eventId];
    if (existing) {
      await supabase.from("event_rsvps").update({ status }).eq("event_id", eventId).eq("user_id", user.id);
    } else {
      await supabase.from("event_rsvps").insert({ event_id: eventId, user_id: user.id, status });
    }
    toast({ title: status === "going" ? "You're going! 🎉" : "RSVP updated" });
    fetchData();
  };

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.event_date) >= now);
  const past = events.filter(e => new Date(e.event_date) < now);

  if (loading) return (
    <div className="min-h-screen py-12"><div className="container mx-auto px-4"><PageHeaderSkeleton /><ListSkeleton /></div></div>
  );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <ScrollAnimator>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
              {get("events_header", "title", "Family Events")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {get("events_header", "content", "Stay updated on upcoming gatherings, celebrations, and special occasions")}
            </p>
          </div>
        </ScrollAnimator>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📅</p>
            <p className="text-xl text-muted-foreground">No events yet. Check back soon!</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-heading mb-8">Upcoming Events</h2>
                <div className="space-y-6">
                  {upcoming.map((event, index) => (
                    <ScrollAnimator key={event.id} delay={index * 100}>
                      <Card className="p-6 md:p-8 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-4">
                              <Badge className="mt-1">{event.type}</Badge>
                              <h3 className="text-2xl font-bold text-heading">{event.title}</h3>
                            </div>
                            {event.description && <p className="text-muted-foreground mb-4">{event.description}</p>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4 text-primary" /><span>{new Date(event.event_date).toLocaleDateString()}</span></div>
                              {event.event_time && <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4 text-primary" /><span>{event.event_time}</span></div>}
                              {event.location && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4 text-primary" /><span>{event.location}</span></div>}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 lg:min-w-[140px]">
                            {rsvps[event.id] === "going" ? (
                              <Button variant="secondary" disabled><Check className="w-4 h-4 mr-1" /> Going!</Button>
                            ) : (
                              <Button onClick={() => handleRsvp(event.id, "going")}>RSVP - Going</Button>
                            )}
                            {rsvps[event.id] !== "maybe" && (
                              <Button variant="outline" onClick={() => handleRsvp(event.id, "maybe")}>Maybe</Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </ScrollAnimator>
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-heading mb-8">Past Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {past.map((event, index) => (
                    <ScrollAnimator key={event.id} delay={index * 100}>
                      <Card className="p-6 hover:shadow-lg transition-shadow">
                        <Badge className="mb-3">{event.type}</Badge>
                        <h3 className="text-xl font-bold text-heading mb-2">{event.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Calendar className="w-4 h-4" /><span>{new Date(event.event_date).toLocaleDateString()}</span>
                        </div>
                        {event.description && <p className="text-muted-foreground text-sm">{event.description}</p>}
                      </Card>
                    </ScrollAnimator>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
