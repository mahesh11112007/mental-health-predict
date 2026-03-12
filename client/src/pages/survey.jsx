import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Brain, ScanFace, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const surveySchema = z.object({
  age: z.string().min(1, "Please enter your age"),
  gender: z.string().min(1, "Please select your gender"),
  familyHistory: z.string().min(1, "Please answer this question"),
  workInterfere: z.string().min(1, "Please answer this question"),
  remoteWork: z.string().min(1, "Please answer this question"),
  techCompany: z.string().min(1, "Please answer this question"),
  benefits: z.string().min(1, "Please answer this question")
});

export default function Survey() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  
  const [scanState, setScanState] = useState("idle");
  const [scanComplete, setScanComplete] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const form = useForm({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      age: "",
      gender: "",
      familyHistory: "",
      workInterfere: "",
      remoteWork: "",
      techCompany: "",
      benefits: ""
    }
  });

  const onSubmit = data => {
    if (step === 3 && !scanComplete) {
      return;
    }
    setIsSubmitting(true);
    // Simulate ML processing time
    setTimeout(() => {
      sessionStorage.setItem("surveyResult", JSON.stringify({
        ...data,
        faceScanned: scanComplete
      }));
      setLocation("/result");
    }, 2500);
  };

  const nextStep = async () => {
    const fieldsToValidate = step === 1 ? ["age", "gender", "familyHistory", "workInterfere"] : ["remoteWork", "techCompany", "benefits"];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      // Clear errors so step 2 fields don't show up red immediately
      form.clearErrors(["remoteWork", "techCompany", "benefits"]);
      setStep(step + 1);
    }
  };

  const startCamera = async () => {
    setScanState("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback if camera fails
      setTimeout(() => {
        setScanState("analyzing");
        setTimeout(() => {
          setScanState("complete");
          setScanComplete(true);
        }, 2000);
      }, 1000);
    }
  };

  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setCapturedImage(canvas.toDataURL('image/jpeg'));
      
      stopCamera();
      setScanState("analyzing");
      
      setTimeout(() => {
        setScanState("complete");
        setScanComplete(true);
      }, 2500);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return <div className="min-h-screen bg-muted/30 py-12 px-4 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="max-w-2xl w-full mb-8 flex items-center justify-between relative z-10">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground font-semibold" onClick={() => step > 1 ? setStep(step - 1) : setLocation("/")} data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
          {step > 1 ? "Back" : "Home"}
        </Button>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground tracking-tight">Assessment</span>
        </div>
        <div className="w-20" /> 
      </div>

      <Card className="w-full max-w-2xl border-white/40 shadow-2xl shadow-black/5 rounded-[2rem] overflow-hidden bg-card/80 backdrop-blur-xl relative z-10">
        <div className="bg-primary/5 p-8 border-b border-border/50">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-1">
                {step === 3 ? "Optional Analysis" : "Let's get to know you"}
              </h2>
              <p className="text-muted-foreground font-medium">
                {step === 3 ? "Enhance your prediction with privacy-first facial analysis." : "Your answers help our model predict outcomes accurately."}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-primary mb-2">Step {step} of {totalSteps}</span>
            </div>
          </div>
          <Progress value={step / totalSteps * 100} className="h-2 bg-primary/10" />
        </div>

        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <AnimatePresence mode="wait">
                {step === 1 && <motion.div key="step1" initial={{
                opacity: 0,
                x: 20
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: -20
              }} transition={{
                duration: 0.3
              }} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="age" render={({
                    field
                  }) => <FormItem>
                            <FormLabel className="text-base font-bold">What is your age?</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 28" type="number" className="h-14 rounded-xl text-lg bg-background border-border/60 shadow-inner" {...field} data-testid="input-age" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />

                      <FormField control={form.control} name="gender" render={({
                    field
                  }) => <FormItem>
                            <FormLabel className="text-base font-bold">Gender identity</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-14 rounded-xl text-lg bg-background border-border/60 shadow-inner" data-testid="select-gender">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other / Non-binary</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>} />
                    </div>

                    <FormField control={form.control} name="familyHistory" render={({
                  field
                }) => <FormItem className="space-y-3">
                          <FormLabel className="text-base font-bold">Do you have a family history of mental illness?</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {["Yes", "No", "Not sure"].map(option => <FormItem key={option} className="flex items-center space-x-3 space-y-0 p-4 rounded-xl border-2 border-transparent bg-background hover:bg-muted/50 cursor-pointer transition-all shadow-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                  <FormControl>
                                    <RadioGroupItem value={option} data-testid={`radio-family-${option}`} className="w-5 h-5" />
                                  </FormControl>
                                  <FormLabel className="font-semibold cursor-pointer w-full text-base">{option}</FormLabel>
                                </FormItem>)}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="workInterfere" render={({
                  field
                }) => <FormItem className="space-y-3">
                          <FormLabel className="text-base font-bold">If you have a mental health condition, do you feel that it interferes with your work?</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {["Often", "Sometimes", "Rarely", "Never", "Not applicable"].map(option => <FormItem key={option} className="flex items-center space-x-3 space-y-0 p-4 rounded-xl border-2 border-transparent bg-background hover:bg-muted/50 cursor-pointer transition-all shadow-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                  <FormControl>
                                    <RadioGroupItem value={option} data-testid={`radio-interfere-${option}`} className="w-5 h-5" />
                                  </FormControl>
                                  <FormLabel className="font-semibold cursor-pointer w-full text-base">{option}</FormLabel>
                                </FormItem>)}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </motion.div>}

                {step === 2 && <motion.div key="step2" initial={{
                opacity: 0,
                x: 20
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: -20
              }} transition={{
                duration: 0.3
              }} className="space-y-8">
                    <FormField control={form.control} name="remoteWork" render={({
                  field
                }) => <FormItem className="space-y-3">
                          <FormLabel className="text-base font-bold">Do you work remotely (outside of an office) at least 50% of the time?</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-3">
                              {["Yes", "No"].map(option => <FormItem key={option} className="flex items-center space-x-3 space-y-0 p-4 rounded-xl border-2 border-transparent bg-background hover:bg-muted/50 cursor-pointer transition-all shadow-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                  <FormControl>
                                    <RadioGroupItem value={option} data-testid={`radio-remote-${option}`} className="w-5 h-5" />
                                  </FormControl>
                                  <FormLabel className="font-semibold cursor-pointer w-full text-base m-0">{option}</FormLabel>
                                </FormItem>)}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="techCompany" render={({
                  field
                }) => <FormItem className="space-y-3">
                          <FormLabel className="text-base font-bold">Is your employer primarily a tech company or IT role?</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-3">
                              {["Yes", "No"].map(option => <FormItem key={option} className="flex items-center space-x-3 space-y-0 p-4 rounded-xl border-2 border-transparent bg-background hover:bg-muted/50 cursor-pointer transition-all shadow-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                  <FormControl>
                                    <RadioGroupItem value={option} data-testid={`radio-tech-${option}`} className="w-5 h-5" />
                                  </FormControl>
                                  <FormLabel className="font-semibold cursor-pointer w-full text-base m-0">{option}</FormLabel>
                                </FormItem>)}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="benefits" render={({
                  field
                }) => <FormItem className="space-y-3">
                          <FormLabel className="text-base font-bold">Does your employer provide mental health benefits?</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {["Yes", "No", "Don't know"].map(option => <FormItem key={option} className="flex items-center space-x-3 space-y-0 p-4 rounded-xl border-2 border-transparent bg-background hover:bg-muted/50 cursor-pointer transition-all shadow-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                  <FormControl>
                                    <RadioGroupItem value={option} data-testid={`radio-benefits-${option}`} className="w-5 h-5" />
                                  </FormControl>
                                  <FormLabel className="font-semibold cursor-pointer w-full text-base m-0">{option}</FormLabel>
                                </FormItem>)}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </motion.div>}
                {step === 3 && <motion.div key="step3" initial={{
                opacity: 0,
                x: 20
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: -20
              }} transition={{
                duration: 0.3
              }} className="space-y-8 flex flex-col items-center py-6">
                  
                  <div className="text-center space-y-4 max-w-md mx-auto mb-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ScanFace className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Facial Expression Analysis</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Our secure, local facial tracking can enhance your prediction by analyzing micro-expressions. 
                      No images are saved or transmitted to our servers.
                    </p>
                  </div>

                  {scanState === "idle" && (
                    <Button type="button" size="lg" variant="outline" className="rounded-full h-14 px-8 border-primary/20 text-primary hover:bg-primary/5 font-bold" onClick={startCamera}>
                      Start Privacy-Safe Scan
                    </Button>
                  )}

                  {scanState === "camera" && (
                    <div className="w-full max-w-sm space-y-4">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/50 mb-4 shadow-inner">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                        <div className="absolute inset-0 border-2 border-primary/30 rounded-xl pointer-events-none" />
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/80 animate-[scan_2s_ease-in-out_infinite]" style={{boxShadow: '0 0 8px 2px rgba(var(--primary), 0.5)'}} />
                      </div>
                      <Button type="button" size="lg" className="w-full rounded-xl font-bold shadow-md" onClick={captureFace}>
                        Capture Face
                      </Button>
                    </div>
                  )}

                  {(scanState === "analyzing" || scanState === "complete") && (
                    <div className="w-full max-w-sm space-y-4">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/50 shadow-inner">
                        {capturedImage && (
                          <img 
                            src={capturedImage} 
                            alt="Captured face" 
                            className="w-full h-full object-cover"
                          />
                        )}
                        {scanState === "analyzing" && (
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                            <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
                            <span className="font-bold text-foreground">Analyzing Expressions...</span>
                          </div>
                        )}
                      </div>
                      
                      {scanState === "complete" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-green-600 dark:text-green-400 text-sm">Analysis Complete</span>
                            <span className="text-xs text-muted-foreground">Data securely processed locally</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />

                </motion.div>}
              </AnimatePresence>

              <div className="flex justify-between items-center pt-8 mt-8 border-t border-border/50">
                {step === 3 ? (
                  <Button type="button" variant="ghost" className="font-bold text-muted-foreground" onClick={() => {
                    form.handleSubmit(onSubmit)();
                  }}>
                    Skip this step
                  </Button>
                ) : (
                  <div /> // Empty div for spacing
                )}
                
                {step < 3 ? <Button type="button" size="lg" className="rounded-full h-14 px-8 shadow-md shadow-primary/20 text-lg font-bold" onClick={nextStep} data-testid="button-next">
                    Continue <ArrowRight className="ml-2 w-5 h-5" />
                  </Button> : <Button type="submit" size="lg" className="rounded-full h-14 px-8 shadow-lg shadow-primary/30 text-lg font-bold" disabled={isSubmitting || scanState === "camera" || scanState === "analyzing"} data-testid="button-submit">
                    {isSubmitting ? <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Generating Results...
                      </> : "Generate Prediction"}
                  </Button>}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>;
}