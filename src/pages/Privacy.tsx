import { Card } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-heading mb-4">Introduction</h2>
            <p className="text-muted-foreground">
              This website is a private family platform created for The Azzariah's Family members 
              to share memories, stories, and stay connected. We take your privacy seriously and 
              are committed to protecting your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-heading mb-4">Information We Collect</h2>
            <p className="text-muted-foreground mb-3">
              We may collect the following types of information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Name and email address when you submit contact forms</li>
              <li>Photos and content you upload or share on the site</li>
              <li>Comments and messages in the guestbook</li>
              <li>Basic usage data to improve site functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-heading mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-3">
              Your information is used solely for family purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To facilitate family communication and event planning</li>
              <li>To share photos and memories with family members</li>
              <li>To send newsletters and event updates (if you subscribe)</li>
              <li>To maintain and improve the website experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-heading mb-4">Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information. 
              However, please note that this is a private family website, and access should be 
              limited to family members only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-heading mb-4">Sharing of Information</h2>
            <p className="text-muted-foreground">
              We do not share your personal information with third parties. All content on this 
              website is intended for family members only and should not be shared outside the family.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-heading mb-4">Your Rights</h2>
            <p className="text-muted-foreground mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of your personal information</li>
              <li>Request deletion of your content from the website</li>
              <li>Opt out of newsletter communications at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-heading mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy or your personal information, 
              please contact us at{" "}
              <a href="mailto:family@azzariah.com" className="text-primary hover:underline">
                family@azzariah.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-heading mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify family members 
              of any significant changes via email or through the website.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
