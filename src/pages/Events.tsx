import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const upcomingEvents = [
  { id: 1, title: "Annual Family Reunion", date: "August 15, 2024", time: "11:00 AM - 6:00 PM", location: "Azzariah Lake House", type: "Gathering", attendees: "45 confirmed", description: "Our biggest family event of the year! Join us for a day of fun, food, and fellowship." },
  { id: 2, title: "Grandma Mary's Birthday", date: "September 3, 2024", time: "4:00 PM", location: "Main Family Home", type: "Celebration", attendees: "25 confirmed", description: "Celebrating Grandma's special day with cake, stories, and family time." },
  { id: 3, title: "Michael's Soccer Championship", date: "July 28, 2024", time: "2:00 PM", location: "Community Sports Center", type: "Sports", attendees: "15 confirmed", description: "Come support Michael in the championship game! Let's cheer him on to victory!" },
];

const pastEvents = [
  { id: 4, title: "Easter Egg Hunt", date: "March 31, 2024", type: "Holiday", description: "Annual Easter celebration with egg hunt, family games, and traditional lunch." },
  { id: 5, title: "Winter Holiday Party", date: "December 23, 2023", type: "Holiday", description: "Festive celebration with gift exchange, caroling, and Grandma's famous cookies." },
];

const Events = () => {
  const { get } = useSiteContent(["events_header"]);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
            {get("events_header", "title", "Family Events")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {get("events_header", "content", "Stay updated on upcoming gatherings, celebrations, and special occasions")}
          </p>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-heading mb-8">Upcoming Events</h2>
          <div className="space-y-6">
            {upcomingEvents.map((event, index) => (
              <Card key={event.id} className="p-6 md:p-8 hover:shadow-lg transition-shadow animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-4">
                      <Badge className="mt-1">{event.type}</Badge>
                      <h3 className="text-2xl font-bold text-heading">{event.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4 text-primary" /><span>{event.date}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4 text-primary" /><span>{event.time}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4 text-primary" /><span>{event.location}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4 text-primary" /><span>{event.attendees}</span></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 lg:min-w-[120px]">
                    <Button className="w-full">RSVP</Button>
                    <Button variant="outline" className="w-full">Add to Calendar</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-heading mb-8">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastEvents.map((event) => (
              <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
                <Badge className="mb-3">{event.type}</Badge>
                <h3 className="text-xl font-bold text-heading mb-2">{event.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3"><Calendar className="w-4 h-4" /><span>{event.date}</span></div>
                <p className="text-muted-foreground text-sm">{event.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Events;
