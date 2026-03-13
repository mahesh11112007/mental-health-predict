import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Lock, Mail, User, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      const email = e.target.email.value;
      const password = e.target.password.value;
      
      let users = JSON.parse(localStorage.getItem("users") || "[]");
      let activeUser = null;

      if (isLogin) {
        activeUser = users.find(u => u.email === email && u.password === password);
        if (!activeUser) {
          alert("Invalid credentials. Please check your email and password.");
          return;
        }
      } else {
        if (users.find(u => u.email === email)) {
          alert("An account with this email already exists.");
          return;
        }
        activeUser = { 
          id: Date.now(), 
          name: e.target.name.value, 
          email, 
          password, 
          history: [] 
        };
        users.push(activeUser);
      }
      
      // Check for pending assessment
      const pending = sessionStorage.getItem("pendingAssessment");
      if (pending) {
        const p = JSON.parse(pending);
        if (!activeUser.history) activeUser.history = [];
        if (!activeUser.history.find(h => h.id === p.id)) {
          activeUser.history.push(p);
        }
        sessionStorage.removeItem("pendingAssessment");
      }

      // Save back users if updated
      const userIndex = users.findIndex(u => u.email === activeUser.email);
      users[userIndex] = activeUser;
      localStorage.setItem("users", JSON.stringify(users));
      
      localStorage.setItem("currentUser", JSON.stringify(activeUser));
      
      setLocation("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] bg-primary/20 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[100px] bg-blue-500/10 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground mb-6 font-semibold" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-3xl font-extrabold tracking-tight">NeuroPredict</span>
            </div>
          </div>

          <Card className="border-white/40 shadow-2xl shadow-black/5 rounded-[2rem] overflow-hidden bg-card/80 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight mb-2">
                  {isLogin ? "Welcome back" : "Create your account"}
                </h1>
                <p className="text-muted-foreground font-medium">
                  {isLogin 
                    ? "Enter your details to access your assessment history." 
                    : "Save your prediction results and track your well-being over time."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-bold">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="name" 
                        placeholder="Alex Doe" 
                        className="pl-10 h-12 rounded-xl bg-background border-border/60 shadow-inner" 
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="alex@example.com" 
                      className="pl-10 h-12 rounded-xl bg-background border-border/60 shadow-inner" 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="font-bold">Password</Label>
                    {isLogin && (
                      <a href="#" className="text-sm font-bold text-primary hover:underline">
                        Forgot password?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 h-12 rounded-xl bg-background border-border/60 shadow-inner" 
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="terms" required />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                    >
                      I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl font-bold text-base shadow-md shadow-primary/20 mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                </Button>
              </form>

              <div className="mt-6 mb-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/60"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card/80 backdrop-blur-xl text-muted-foreground font-medium">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12 rounded-xl font-bold bg-background shadow-sm hover:bg-muted/50">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="h-12 rounded-xl font-bold bg-background shadow-sm hover:bg-muted/50">
                  <Github className="w-5 h-5 mr-2" />
                  GitHub
                </Button>
              </div>

              <div className="mt-8 text-center text-sm font-medium">
                {isLogin ? (
                  <p className="text-muted-foreground">
                    Don't have an account?{" "}
                    <button onClick={() => setIsLogin(false)} className="text-primary font-bold hover:underline">
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <button onClick={() => setIsLogin(true)} className="text-primary font-bold hover:underline">
                      Log in
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}