import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Calendar, Activity, LogOut, ArrowRight, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (!userData) {
      setLocation("/auth");
      return;
    }
    setUser(JSON.parse(userData));

    // Load history from session storage, or set mock data if empty
    let pastAssessments = JSON.parse(sessionStorage.getItem("assessmentHistory") || "[]");
    
    if (pastAssessments.length === 0) {
      // Generate some realistic mock history
      pastAssessments = [
        {
          id: 1,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          risk: "High",
          confidence: 89.2,
          score: 72
        },
        {
          id: 2,
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          risk: "Moderate",
          confidence: 85.5,
          score: 55
        },
        {
          id: 3,
          date: new Date().toISOString(),
          risk: "Low",
          confidence: 91.0,
          score: 28
        }
      ];
      sessionStorage.setItem("assessmentHistory", JSON.stringify(pastAssessments));
    }
    
    // Sort by date descending
    pastAssessments.sort((a, b) => new Date(b.date) - new Date(a.date));
    setHistory(pastAssessments);
  }, [setLocation]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setLocation("/");
  };

  if (!user) return null;

  const latestAssessment = history[0];

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-12 flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      
      {/* Navigation */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground hidden sm:inline-block">NeuroPredict</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground hidden md:inline-block">
            Logged in as <strong className="text-foreground">{user.name || user.email}</strong>
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-red-500 font-semibold">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Your Dashboard</h1>
              <p className="text-muted-foreground font-medium">Track your mental wellness predictions over time.</p>
            </div>
            <Link href="/survey">
              <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 font-bold gap-2">
                <Activity className="w-5 h-5" /> Take New Assessment
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Latest Result Card */}
            <Card className="border-white/40 shadow-xl rounded-3xl bg-card/80 backdrop-blur md:col-span-2 overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none -z-10 ${latestAssessment?.risk === 'High' ? 'bg-red-500' : latestAssessment?.risk === 'Moderate' ? 'bg-amber-500' : 'bg-primary'}`} />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center justify-between">
                  <span>Current Status</span>
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> {latestAssessment ? formatDate(latestAssessment.date) : 'N/A'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestAssessment ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-4">
                    <div className="space-y-2 text-center sm:text-left">
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Prediction Risk</p>
                      <p className={`text-5xl font-extrabold tracking-tighter ${latestAssessment.risk === 'High' ? 'text-red-500' : latestAssessment.risk === 'Moderate' ? 'text-amber-500' : 'text-primary'}`}>
                        {latestAssessment.risk}
                      </p>
                    </div>
                    <div className="w-px h-16 bg-border/50 hidden sm:block"></div>
                    <div className="space-y-2 text-center sm:text-left">
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Model Confidence</p>
                      <p className="text-3xl font-bold tracking-tight text-foreground">
                        {latestAssessment.confidence.toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-full sm:w-auto">
                      <Link href="/result">
                        <Button variant="outline" className="w-full rounded-full font-bold">
                          View Details <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No assessment taken yet.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Summary Card */}
            <Card className="border-white/40 shadow-xl rounded-3xl bg-card/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" /> Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-6">
                  {history.length >= 2 ? (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">
                        Risk score compared to previous assessment:
                      </p>
                      <div className="flex items-center gap-3">
                        {history[0].score < history[1].score ? (
                          <div className="flex items-center gap-2 text-green-500 font-bold bg-green-500/10 px-3 py-1.5 rounded-xl">
                            <TrendingUp className="w-5 h-5 rotate-180" /> Improved
                          </div>
                        ) : history[0].score > history[1].score ? (
                          <div className="flex items-center gap-2 text-amber-500 font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl">
                            <TrendingUp className="w-5 h-5" /> Increased Risk
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-blue-500 font-bold bg-blue-500/10 px-3 py-1.5 rounded-xl">
                            <ArrowRight className="w-5 h-5" /> Stable
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Take more assessments to see your wellness trend over time.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History List */}
          <Card className="border-white/40 shadow-xl rounded-3xl bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Assessment History</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item, i) => (
                    <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border ${i === 0 ? 'bg-primary/5 border-primary/20' : 'bg-background border-border/50 hover:bg-muted/30'} transition-colors`}>
                      <div className="flex items-center gap-4 mb-3 sm:mb-0">
                        <div className={`w-3 h-3 rounded-full ${item.risk === 'High' ? 'bg-red-500' : item.risk === 'Moderate' ? 'bg-amber-500' : 'bg-primary'}`} />
                        <div>
                          <p className="font-bold text-foreground">{formatDate(item.date)}</p>
                          <p className="text-sm text-muted-foreground font-medium">Risk: {item.risk}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-1/3">
                        <div className="w-full">
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span>Score</span>
                            <span>{item.score}/100</span>
                          </div>
                          <Progress value={item.score} className={`h-2 ${item.risk === 'High' ? '*:bg-red-500' : item.risk === 'Moderate' ? '*:bg-amber-500' : '*:bg-primary'}`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">No history available.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}