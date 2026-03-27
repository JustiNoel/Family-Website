import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSiteContent } from "@/hooks/useSiteContent";

const familyMembers = [
  { name: "John Azzariah", role: "Patriarch", initials: "JA", bio: "Family storyteller and keeper of traditions. Loves woodworking and sharing wisdom with grandchildren.", funFact: "Can recite the entire family tree from memory going back 5 generations!" },
  { name: "Mary Azzariah", role: "Matriarch", initials: "MA", bio: "The heart of our family gatherings. Master chef whose recipes bring everyone together.", funFact: "Her secret ingredient is always 'a little extra love.'" },
  { name: "David Azzariah", role: "Father", initials: "DA", bio: "Tech enthusiast and family photographer. Captures every precious moment.", funFact: "Has over 50,000 family photos organized by year, event, and person!" },
  { name: "Sarah Azzariah", role: "Mother", initials: "SA", bio: "Creative soul and family event planner. Makes every celebration magical.", funFact: "Once planned a surprise party for 50 people in just 3 days!" },
  { name: "Emma Azzariah", role: "Daughter", initials: "EA", bio: "Artist and social butterfly. Connects family members across continents.", funFact: "Speaks 4 languages and uses them to chat with relatives worldwide!" },
  { name: "Michael Azzariah", role: "Son", initials: "MA", bio: "Sports enthusiast and future family historian. Documents family stories.", funFact: "Hosts an annual family trivia night that's become legendary!" },
];

const milestones = [
  { year: "1985", event: "The Azzariah family established their first home" },
  { year: "1990", event: "First family reunion with 25 members" },
  { year: "2000", event: "Started the tradition of annual summer gatherings" },
  { year: "2010", event: "Family cookbook published with 100+ recipes" },
  { year: "2020", event: "Virtual family game nights during global challenges" },
  { year: "2025", event: "Launched our digital family hub website" },
];

const About = () => {
  const { get } = useSiteContent(["about_hero", "about_values"]);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-heading mb-6">
            {get("about_hero", "title", "Our Family Story")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {get("about_hero", "content", "The Azzariah's Family is built on love, laughter, and lasting memories.")}
          </p>
        </div>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-heading text-center mb-12">
            {get("about_values", "title", "Our Core Values")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 text-center">
              <h3 className="text-xl font-semibold text-heading mb-3">Love & Unity</h3>
              <p className="text-muted-foreground">We support each other through life's ups and downs, celebrating victories and providing comfort during challenges.</p>
            </Card>
            <Card className="p-8 text-center">
              <h3 className="text-xl font-semibold text-heading mb-3">Heritage & Tradition</h3>
              <p className="text-muted-foreground">We honor our roots while embracing the future, passing down stories and customs that define who we are.</p>
            </Card>
            <Card className="p-8 text-center">
              <h3 className="text-xl font-semibold text-heading mb-3">Joy & Laughter</h3>
              <p className="text-muted-foreground">We find reasons to smile every day, creating moments of happiness and memories that last a lifetime.</p>
            </Card>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-heading text-center mb-12">Meet the Family</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyMembers.map((member, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">{member.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-heading">{member.name}</h3>
                    <p className="text-sm text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm mb-3">{member.bio}</p>
                    <div className="bg-secondary/20 rounded-lg p-3">
                      <p className="text-xs font-medium text-heading">Fun Fact:</p>
                      <p className="text-sm text-muted-foreground italic">{member.funFact}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-heading text-center mb-12">Our Journey</h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative border-l-2 border-primary/30 ml-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="mb-10 ml-6">
                  <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] border-4 border-background"></div>
                  <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-primary font-bold text-lg">{milestone.year}</span>
                    <p className="text-muted-foreground mt-2">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
