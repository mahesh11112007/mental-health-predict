import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, CheckCircle2, Info, Activity, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
export default function Result() {
  const [, setLocation] = useLocation();
  const [prediction, setPrediction] = useState(null);
  useEffect(() => {
    // Read session storage to see if we have mock data
    const data = sessionStorage.getItem("surveyResult");
    if (!data) {
      setLocation("/survey");
      return;
    }
    const parsed = JSON.parse(data);

    // Simple heuristic for mock prediction
    let riskScore = 0;
    if (parsed.familyHistory === "Yes") riskScore += 30;
    if (parsed.workInterfere === "Often" || parsed.workInterfere === "Sometimes") riskScore += 40;
    if (parsed.benefits === "No") riskScore += 10;
    let riskLevel = "Low";
    if (riskScore > 60) riskLevel = "High";else if (riskScore > 30) riskLevel = "Moderate";
    setPrediction({
      risk: riskLevel,
      confidence: 75 + Math.random() * 20 // Random confidence between 75-95%
    });
  }, [setLocation]);
  if (!prediction) return null;
  return <div className="min-h-screen bg-muted/30 py-12 px-4 flex flex-col items-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className={`absolute top-20 right-0 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none opacity-20 ${prediction.risk === "High" ? "bg-red-500" : prediction.risk === "Moderate" ? "bg-amber-500" : "bg-primary"}`} />

      <div className="max-w-4xl w-full mb-8 relative z-10">
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground mb-6 font-semibold" data-testid="button-home">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
        
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="space-y-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide uppercase mb-4 border border-primary/20">
              <Activity className="w-4 h-4" /> Model Analysis Complete
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">Your Prediction Results</h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">Based on our machine learning analysis of your survey responses and historical tech industry data.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-white/40 shadow-2xl shadow-black/5 rounded-[2rem] overflow-hidden bg-card/80 backdrop-blur-xl col-span-1 md:col-span-2 relative">
              <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 z-10 relative">
                <div className="space-y-6 max-w-md">
                  <div>
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Treatment Probability Level</h2>
                    <div className="flex items-baseline gap-4">
                      <span className={`text-5xl md:text-6xl font-extrabold tracking-tighter ${prediction.risk === "High" ? "text-red-500" : prediction.risk === "Moderate" ? "text-amber-500" : "text-primary"}`}>
                        {prediction.risk}
                      </span>
                    </div>
                  </div>
                  <p className="text-foreground text-lg leading-relaxed font-medium">
                    {prediction.risk === "High" ? "Our model indicates a higher likelihood that you might benefit from seeking professional mental health support. The combination of your inputs highly correlates with individuals seeking treatment." : prediction.risk === "Moderate" ? "Our model suggests a moderate probability. It may be beneficial to proactively monitor your well-being, manage stress, and utilize available resources." : "Our model indicates a lower probability for requiring immediate clinical intervention, but well-being is an ongoing practice. Keep up the good work maintaining balance."}
                  </p>
                </div>
                
                <div className="relative w-56 h-56 flex items-center justify-center shrink-0">
                  <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${prediction.risk === "High" ? "bg-red-500" : prediction.risk === "Moderate" ? "bg-amber-500" : "bg-primary"}`} />
                  <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/30" />
                    <motion.circle initial={{
                    strokeDashoffset: 276.46
                  }} animate={{
                    strokeDashoffset: 276.46 - 276.46 * prediction.confidence / 100
                  }} transition={{
                    duration: 1.5,
                    ease: "easeOut",
                    delay: 0.5
                  }} cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray="276.46" className={prediction.risk === "High" ? "text-red-500" : prediction.risk === "Moderate" ? "text-amber-500" : "text-primary"} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <span className="text-4xl font-extrabold tracking-tighter">{prediction.confidence.toFixed(1)}%</span>
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Confidence</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/40 shadow-xl rounded-3xl bg-card/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Info className="w-6 h-6 text-blue-500" /> Key Feature Weights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm font-medium text-muted-foreground">The model weighted these inputs most heavily based on your specific responses:</p>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span>Family History</span>
                      <span className="text-muted-foreground">High Impact</span>
                    </div>
                    <Progress value={85} className="h-2.5 bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span>Work Interference</span>
                      <span className="text-muted-foreground">High Impact</span>
                    </div>
                    <Progress value={70} className="h-2.5 bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span>Company Benefits</span>
                      <span className="text-muted-foreground">Moderate Impact</span>
                    </div>
                    <Progress value={45} className="h-2.5 bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/40 shadow-xl rounded-3xl bg-card/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <CheckCircle2 className="w-6 h-6 text-primary" /> Recommended Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {prediction.risk === "High" && (
                    <>
                      <li className="flex gap-4 text-base font-medium text-foreground bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0" />
                        Please consult a healthcare professional or licensed therapist for a comprehensive evaluation and personalized treatment plan.
                      </li>
                      <li className="flex gap-4 text-base font-medium text-foreground bg-muted/30 p-4 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        Review your employer's HR portal for available mental health benefits or Employee Assistance Programs (EAPs) to help cover costs.
                      </li>
                      <li className="flex gap-4 text-base font-medium text-foreground bg-muted/30 p-4 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        Reach out to a trusted friend, family member, or support group to share how you're feeling and seek immediate support.
                      </li>
                    </>
                  )}
                  {prediction.risk === "Moderate" && (
                    <>
                      <li className="flex gap-4 text-base font-medium text-foreground bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                        Consider speaking with a counselor or therapist to address current stressors before they escalate.
                      </li>
                      <li className="flex gap-4 text-base font-medium text-foreground bg-muted/30 p-4 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        Evaluate your work-life balance and discuss potential adjustments with your manager if work is interfering with your wellbeing.
                      </li>
                      <li className="flex gap-4 text-base font-medium text-foreground bg-muted/30 p-4 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        Explore self-care strategies, such as mindfulness, regular exercise, and ensuring adequate sleep to help manage stress.
                      </li>
                    </>
                  )}
                  {prediction.risk === "Low" && (
                    <>
                      <li className="flex gap-4 text-base font-medium text-foreground bg-primary/10 p-4 rounded-2xl border border-primary/20">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        Continue your current self-care routines and healthy habits, as they appear to be supporting your well-being.
                      </li>
                      <li className="flex gap-4 text-base font-medium text-foreground bg-muted/30 p-4 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        Stay proactive by monitoring your stress levels and making adjustments if you notice changes in your mood or energy.
                      </li>
                      <li className="flex gap-4 text-base font-medium text-foreground bg-muted/30 p-4 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        Familiarize yourself with your company's mental health resources so you know where to turn if your situation changes in the future.
                      </li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-8">
            <Link href="/survey">
              <Button variant="outline" size="lg" className="rounded-full h-14 px-8 font-bold gap-2 bg-white/50 backdrop-blur shadow-sm hover:bg-white" onClick={() => sessionStorage.removeItem("surveyResult")} data-testid="button-retake">
                <RefreshCw className="w-5 h-5" /> Retake Assessment
              </Button>
            </Link>
          </div>
          
          <div className="text-center pt-8 flex flex-col items-center">
            <div className="flex items-start md:items-center justify-center gap-3 text-sm font-medium text-muted-foreground bg-muted/50 p-4 rounded-2xl max-w-2xl text-left md:text-center">
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500" />
              Disclaimer: This is a machine learning prediction mockup based on survey data. It is not a substitute for professional medical advice, diagnosis, or treatment.
            </div>
          </div>
        </motion.div>
      </div>
    </div>;
}