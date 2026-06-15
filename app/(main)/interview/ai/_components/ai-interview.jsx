"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";
import {
  Briefcase,
  Code2,
  FileText,
  Loader2,
  Upload,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  extractInterviewResumeText,
  evaluateAiInterview,
  getSavedResumeForInterview,
} from "@/actions/ai-interview";
import { useInterviewProctor } from "@/hooks/use-interview-proctor";
import ProctorSetup from "./proctor-setup";
import LiveInterviewRoom from "./live-interview-room";
import AiInterviewResult from "./ai-interview-result";

const INTERVIEW_TYPES = [
  {
    id: "technical",
    label: "Technical Interview",
    description: "Live face-to-face technical deep-dive from your resume",
    icon: Code2,
  },
  {
    id: "hr",
    label: "HR Interview",
    description: "Live behavioral & communication interview with AI HR manager",
    icon: Users,
  },
];

export default function AiInterview() {
  const [step, setStep] = useState("setup");
  const [interviewType, setInterviewType] = useState(null);
  const [resumeMeta, setResumeMeta] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const { videoRef, startMedia, stopMedia } = useInterviewProctor({ active: false });

  const resetInterview = () => {
    stopMedia();
    setStep("setup");
    setInterviewType(null);
    setResumeMeta(null);
    setResult(null);
    setFile(null);
  };

  const proceedToProctor = async (type, meta) => {
    setInterviewType(type);
    setResumeMeta(meta);
    setStep("proctor");
  };

  const startWithSavedResume = async (type) => {
    setLoading(true);
    try {
      const saved = await getSavedResumeForInterview();
      if (!saved?.text) {
        toast.error("No saved resume found. Upload a resume or build one first.");
        return;
      }
      await proceedToProctor(type, saved);
    } catch (err) {
      toast.error(err.message || "Failed to load saved resume");
    } finally {
      setLoading(false);
    }
  };

  const startWithUpload = async (type) => {
    if (!file) {
      toast.error("Please upload your resume first");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const extracted = await extractInterviewResumeText(formData);
      await proceedToProctor(type, extracted);
    } catch (err) {
      toast.error(err.message || "Failed to read resume");
    } finally {
      setLoading(false);
    }
  };

  const handleProctorReady = async () => {
    await startMedia();
    setStep("live");
  };

  const handleInterviewComplete = async ({ conversation, proctoring }) => {
    setStep("evaluating");
    setLoading(true);
    try {
      stopMedia();
      const assessment = await evaluateAiInterview({
        type: interviewType,
        resumeText: resumeMeta.text,
        conversation,
        proctoring,
      });
      setResult(assessment);
      setStep("result");
      toast.success("Live interview evaluated");
    } catch (err) {
      toast.error(err.message || "Failed to evaluate interview");
      setStep("live");
    } finally {
      setLoading(false);
    }
  };

  if (step === "result" && result) {
    return <AiInterviewResult result={result} onStartNew={resetInterview} />;
  }

  if (step === "evaluating") {
    return (
      <Card className="mx-2">
        <CardContent className="py-16 space-y-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="font-medium">AI is scoring your live interview…</p>
          <BarLoader width="100%" color="gray" />
        </CardContent>
      </Card>
    );
  }

  if (step === "live" && interviewType && resumeMeta) {
    return (
      <LiveInterviewRoom
        interviewType={interviewType}
        resumeMeta={resumeMeta}
        onComplete={handleInterviewComplete}
        onExit={resetInterview}
      />
    );
  }

  if (step === "proctor") {
    return (
      <ProctorSetup
        videoRef={videoRef}
        onReady={handleProctorReady}
        onCancel={() => setStep("setup")}
      />
    );
  }

  return (
    <div className="mx-2 space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 flex flex-wrap items-center gap-3">
          <Video className="h-5 w-5 text-primary" />
          <p className="text-sm">
            <strong>Live AI face-to-face interview</strong> — camera on, voice answers,
            real-time follow-ups, and anti-cheat proctoring.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Choose interview type
          </CardTitle>
          <CardDescription>
            The AI interviewer reads your resume and asks personalized questions in real time.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {INTERVIEW_TYPES.map((type) => {
            const Icon = type.icon;
            const selected = interviewType === type.id;

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setInterviewType(type.id)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{type.label}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    Live
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume source
          </CardTitle>
          <CardDescription>
            Upload a PDF/DOCX resume or use your saved resume from the builder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed p-6 text-center">
            <input
              id="interview-resume-upload"
              type="file"
              accept=".pdf,.docx"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="interview-resume-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="font-medium">
                {file ? file.name : "Upload resume (PDF or DOCX)"}
              </span>
              <span className="text-xs text-muted-foreground">Max 2MB</span>
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            className="flex-1"
            disabled={!interviewType || loading}
            onClick={() => startWithUpload(interviewType)}
          >
            Start live interview (upload)
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={!interviewType || loading}
            onClick={() => startWithSavedResume(interviewType)}
          >
            Start live interview (saved resume)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
