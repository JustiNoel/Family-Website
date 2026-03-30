import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { ScrollAnimator } from "@/components/ScrollAnimator";
import { PageHeaderSkeleton } from "@/components/LoadingSkeleton";

interface FamilyMember {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  fun_fact: string | null;
  avatar_url: string | null;
  sort_order: number;
}

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
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase.from("family_members").select("*").order("sort_order");
      if (data) setFamilyMembers(data);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <ScrollAnimator>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-heading mb-6">
              {get("about_hero", "title", "Our Family Story")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {get("about_hero", "content", "The Azzariah's Family is built on love, laughter, and lasting memories.")}
            </p>
          </div>
        </ScrollAnimator>

        <section className="mb-20">
          <ScrollAnimator>
            <h2 className="text-3xl font-bold text-heading text-center mb-12">
              {get("about_values", "title", "Our Core Values")}
            </h2>
          </ScrollAnimator>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Love & Unity", desc: "We support each other through life's ups and downs, celebrating victories and providing comfort during challenges." },
              { title: "Heritage & Tradition", desc: "We honor our roots while embracing the future, passing down stories and customs that define who we are." },
              { title: "Joy & Laughter", desc: "We find reasons to smile every day, creating moments of happiness and memories that last a lifetime." },
            ].map((v, i) => (
              <ScrollAnimator key={i} delay={i * 100}>
                <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <h3 className="text-xl font-semibold text-heading mb-3">{v.title}</h3>
                  <p className="text-muted-foreground">{v.desc}</p>
                </Card>
              </ScrollAnimator>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <ScrollAnimator>
            <h2 className="text-3xl font-bold text-heading text-center mb-12">Meet the Family</h2>
          </ScrollAnimator>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading family members...</div>
          ) : familyMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">👨‍👩‍👧‍👦</p>
              <p className="text-muted-foreground">Family members will appear here once added by the admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {familyMembers.map((member, index) => (
                <ScrollAnimator key={member.id} delay={index * 80}>
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex flex-col items-center text-center gap-4">
                      <Avatar className="w-20 h-20">
                        {member.avatar_url ? (
                          <AvatarImage src={member.avatar_url} alt={member.name} />
                        ) : null}
                        <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold text-heading">{member.name}</h3>
                        {member.role && <p className="text-sm text-primary font-medium mb-3">{member.role}</p>}
                        {member.bio && <p className="text-muted-foreground text-sm mb-3">{member.bio}</p>}
                        {member.fun_fact && (
                          <div className="bg-secondary/20 rounded-lg p-3">
                            <p className="text-xs font-medium text-heading">Fun Fact:</p>
                            <p className="text-sm text-muted-foreground italic">{member.fun_fact}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </ScrollAnimator>
              ))}
            </div>
          )}
        </section>

        <section>
          <ScrollAnimator>
            <h2 className="text-3xl font-bold text-heading text-center mb-12">Our Journey</h2>
          </ScrollAnimator>
          <div className="max-w-3xl mx-auto">
            <div className="relative border-l-2 border-primary/30 ml-6">
              {milestones.map((milestone, index) => (
                <ScrollAnimator key={index} delay={index * 100}>
                  <div className="mb-10 ml-6">
                    <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] border-4 border-background"></div>
                    <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-primary font-bold text-lg">{milestone.year}</span>
                      <p className="text-muted-foreground mt-2">{milestone.event}</p>
                    </div>
                  </div>
                </ScrollAnimator>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
