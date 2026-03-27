import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, LogIn, UserPlus, Clock, ShieldCheck } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isApproved } = useAuth();

  // If user is logged in and approved, redirect
  if (user && isApproved) {
    navigate("/");
    return null;
  }

  // If user is logged in but not approved, show pending
  if (user && !isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-heading">Awaiting Approval</h1>
          <p className="text-muted-foreground">
            Your account has been created successfully! The family admin needs to approve your membership before you can access the site.
          </p>
          <p className="text-sm text-muted-foreground">
            You'll be able to access all features once approved. Check back soon!
          </p>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); setPendingApproval(false); }}>
            Sign Out
          </Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Check if approved
        const { data: profile } = await supabase.from("profiles").select("approved").eq("id", data.user.id).maybeSingle();
        if (!profile?.approved) {
          setPendingApproval(true);
          setLoading(false);
          return;
        }

        toast({ title: "Welcome back!", description: "You've been signed in successfully." });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        if (error) throw error;
        setPendingApproval(true);
        toast({
          title: "Account created!",
          description: "Your request has been sent to the admin for approval.",
        });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (pendingApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-heading">Awaiting Approval</h1>
          <p className="text-muted-foreground">
            {isLogin
              ? "Your account is pending admin approval. Please check back later."
              : "Your account has been created! The family admin will review and approve your membership."}
          </p>
          <Button variant="outline" onClick={() => { setPendingApproval(false); supabase.auth.signOut(); }}>
            Back to Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-heading mb-2">
            {isLogin ? "Welcome Back" : "Join the Family"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? "Sign in to your account" : "Request to join — admin approval required"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium mb-1 block">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? (
              <><LogIn className="w-4 h-4 mr-2" /> Sign In</>
            ) : (
              <><UserPlus className="w-4 h-4 mr-2" /> Request Access</>
            )}
          </Button>
        </form>

        <div className="text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
            {isLogin ? "Don't have an account? Request Access" : "Already have an account? Sign In"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
