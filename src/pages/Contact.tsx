import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Send } from "lucide-react";

const guestbookEntries = [
  {
    id: 1,
    name: "Uncle Tom",
    date: "July 10, 2024",
    message: "What a wonderful website! It's so great to have all our memories in one place. Looking forward to the reunion!",
  },
  {
    id: 2,
    name: "Cousin Lisa",
    date: "June 28, 2024",
    message: "Love seeing all the family photos! This brings back so many happy memories. Can't wait to add more at the next gathering!",
  },
  {
    id: 3,
    name: "Aunt Patricia",
    date: "June 15, 2024",
    message: "The recipe section is amazing! I finally got Grandma's apple pie recipe right thanks to the detailed instructions here.",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [guestbookData, setGuestbookData] = useState({
    name: "",
    message: "",
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you soon!",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  const handleGuestbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Guestbook Entry Submitted!",
      description: "Your message will appear after moderation. Thank you!",
    });
    setGuestbookData({ name: "", message: "" });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question, suggestion, or just want to say hello? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Contact Form */}
          <Card className="p-6 md:p-8 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-6">
              <Mail className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-heading">Send Us a Message</h2>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-heading mb-2">
                  Your Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-2">
                  Your Message
                </label>
                <Textarea
                  placeholder="Type your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="min-h-[150px]"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-heading mb-4">Connect With Us</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-heading">Email:</strong>{" "}
                  <a href="mailto:family@azzariah.com" className="text-primary hover:underline">
                    family@azzariah.com
                  </a>
                </p>
                <p>
                  <strong className="text-heading">Phone:</strong>{" "}
                  <a href="tel:+1234567890" className="text-primary hover:underline">
                    (123) 456-7890
                  </a>
                </p>
                <p>
                  <strong className="text-heading">Address:</strong><br />
                  123 Family Lane<br />
                  Hometown, ST 12345
                </p>
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h3 className="text-lg font-semibold text-heading mb-2">Family Motto</h3>
              <p className="text-muted-foreground italic">
                "Where memories live forever, and love grows stronger with each generation."
              </p>
            </Card>
          </div>
        </div>

        {/* Guestbook Section */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold text-heading">Family Guestbook</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Guestbook Form */}
            <Card className="p-6 lg:col-span-1">
              <h3 className="text-xl font-semibold text-heading mb-4">Leave a Message</h3>
              <form onSubmit={handleGuestbookSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">
                    Your Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Name"
                    value={guestbookData.name}
                    onChange={(e) => setGuestbookData({ ...guestbookData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">
                    Message
                  </label>
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={guestbookData.message}
                    onChange={(e) => setGuestbookData({ ...guestbookData, message: e.target.value })}
                    className="min-h-[120px]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Submit</Button>
              </form>
            </Card>

            {/* Guestbook Entries */}
            <div className="lg:col-span-2 space-y-4">
              {guestbookEntries.map((entry, index) => (
                <Card
                  key={entry.id}
                  className="p-6 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-heading">{entry.name}</h4>
                      <p className="text-sm text-muted-foreground">{entry.date}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{entry.message}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
