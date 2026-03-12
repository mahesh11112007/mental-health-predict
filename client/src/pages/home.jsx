import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, ShieldCheck, Activity } from "lucide-react";
import { motion } from "framer-motion";
export default function Home() {
  return <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-teal-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -left-20 w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[80px] pointer-events-none" />

      {/* Navigation */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">NeuroPredict</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Platform</a>
          <a href="#how-it-works" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Science</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button variant="ghost" className="hidden md:flex font-semibold text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
          </Link>
          <Link href="/survey">
            <Button variant="default" className="rounded-full px-6 font-semibold shadow-md shadow-primary/20" data-testid="button-nav-start">
              Try the Model
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-24 text-center relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        ease: "easeOut"
      }} className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide uppercase mb-2">
            <Activity className="w-4 h-4" />
            <span>AI-Powered Insights</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-foreground leading-[1.05]">
            Understand Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500 relative">
              Mental Wellbeing
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-teal-200/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Take our science-backed assessment. Our trained machine learning model analyzes your responses to provide personalized mental health predictions and actionable insights.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href="/survey">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto group shadow-lg shadow-primary/20" data-testid="button-hero-start">
                Start Assessment
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto bg-white/50 backdrop-blur border-border/50" onClick={() => {
              const el = document.getElementById("how-it-works");
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}>
              View Methodology
            </Button>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.2,
        ease: "easeOut"
      }} id="how-it-works" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-5xl mx-auto w-full">
          <div className="p-8 rounded-3xl bg-card/80 backdrop-blur border border-white/40 shadow-xl shadow-black/5 text-left flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 group-hover:bg-primary/10 transition-colors" />
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-border/50">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl">Private & Secure</h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">Your data is processed safely and securely. We prioritize your privacy and confidentiality above all else.</p>
          </div>
          
          <div className="p-8 rounded-3xl bg-card/80 backdrop-blur border border-white/40 shadow-xl shadow-black/5 text-left flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] -z-10 group-hover:bg-blue-500/10 transition-colors" />
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-border/50">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl">Machine Learning</h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">Our prediction engine uses a trained model based on extensive industry survey data for accurate insights.</p>
          </div>
          
          <div className="p-8 rounded-3xl bg-card/80 backdrop-blur border border-white/40 shadow-xl shadow-black/5 text-left flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[100px] -z-10 group-hover:bg-amber-500/10 transition-colors" />
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-border/50">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl">Instant Results</h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">Get immediate feedback on your mental health status along with helpful recommendations and resources.</p>
          </div>
        </motion.div>

        {/* Project Members Section */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.4,
        ease: "easeOut"
      }} className="mt-32 w-full max-w-5xl mx-auto border-t border-border/50 pt-16 pb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Project Members</h2>
            <p className="text-muted-foreground mt-2 font-medium">The team behind this AI prediction model.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="px-6 py-3 rounded-full bg-card border border-border/50 shadow-sm text-foreground font-semibold flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">JS</div>
              Jane Smith, PhD
            </div>
            <div className="px-6 py-3 rounded-full bg-card border border-border/50 shadow-sm text-foreground font-semibold flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-sm">AD</div>
              Alex Doe, ML Eng
            </div>
            <div className="px-6 py-3 rounded-full bg-card border border-border/50 shadow-sm text-foreground font-semibold flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 text-sm">SC</div>
              Sarah Chen, Clinical Lead
            </div>
          </div>
        </motion.div>
      </main>
    </div>;
}