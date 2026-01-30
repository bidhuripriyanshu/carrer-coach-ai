"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, FileText, Lock, CheckCircle2, XCircle, AlertCircle, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_EXT = [".pdf", ".docx"];

export default function ATSUploadSimple() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  /* ---------- validation ---------- */
  const validateFile = (file) => {
    if (!file) return "Please select a file";
    const name = file.name.toLowerCase();

    if (!ALLOWED_EXT.some((ext) => name.endsWith(ext))) {
      return "Only PDF or DOCX allowed";
    }

    if (file.size > MAX_SIZE) {
      return "File must be under 2MB";
    }

    return null;
  };

  /* ---------- input select ---------- */
  const handleChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const err = validateFile(selected);
    if (err) {
      toast.error(err);
      return;
    }

    setFile(selected);
  };

  /* ---------- drag & drop ---------- */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    const err = validateFile(dropped);
    if (err) {
      toast.error(err);
      return;
    }

    setFile(dropped);
  };

  /* ---------- submit ---------- */
  const handleUpload = async () => {
    if (!file) {
      inputRef.current?.click();
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/ats-analyze", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Upload failed");
      }

      setResult(json.data);
      toast.success("Resume analyzed successfully 🎉");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page heading & tagline with ATS header line */}
      <header className="space-y-3 border-b pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wider">
            ATS
          </Badge>
          <span className="text-sm text-muted-foreground">Applicant Tracking System</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight gradient-title md:text-6xl">
          ATS Resume Score
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Get instant, AI-powered feedback on how well your resume passes applicant tracking systems. Upload your resume to see scores and actionable improvements.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-10 lg:items-start">
        {/* Upload card - stays at top */}
        <Card
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!file) inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => {
            if (!file) inputRef.current?.click();
          }}
          className={`
            relative cursor-pointer transition-all duration-200
            border-2 border-dashed
            ${dragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"}
          `}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <input
              ref={inputRef}
              id="resume-upload"
              type="file"
              accept=".pdf,.docx"
              onChange={handleChange}
              className="sr-only"
              aria-hidden
            />

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>

            <h3 className="mb-1 font-semibold text-foreground">
              Drop your resume here or click to choose
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              PDF or DOCX · Max 2MB
            </p>

            {file && (
              <p className="mb-4 truncate max-w-full rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
                {file.name}
              </p>
            )}

            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              disabled={loading}
              className="gap-2 font-semibold"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {loading ? "Analyzing…" : "Analyze Resume"}
            </Button>

            <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              Your file is processed securely and not stored.
            </p>
          </CardContent>
        </Card>

        {/* ATS Score result - scrollable container to prevent layout leak */}
        {result && (
          <div className="min-h-0 min-w-0 w-full overflow-y-auto rounded-xl border bg-card/50 lg:max-h-[calc(100vh-12rem)] lg:pr-1">
            <div className="space-y-6 pb-4">
            {/* Overall score card */}
            <Card className="overflow-hidden border-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Overall ATS Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                    <span className="text-3xl font-bold text-primary">
                      {result.overallScore}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Progress value={result.overallScore} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      {result.totalIssues} issue{result.totalIssues !== 1 ? "s" : ""} found
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category breakdown */}
            {[
              { key: "content", label: "Content" },
              { key: "formatBrevity", label: "Format & brevity" },
              { key: "style", label: "Style" },
              { key: "sections", label: "Sections" },
              { key: "skills", label: "Skills" },
            ].map(({ key, label }) => {
              const cat = result[key];
              if (!cat?.items?.length) return null;
              return (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between text-base">
                      <span>{label}</span>
                      <span className="font-mono text-muted-foreground">{cat.score}/100</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {cat.items.map((item, i) => {
                        const Icon =
                          item.status === "pass"
                            ? CheckCircle2
                            : item.status === "fail"
                              ? XCircle
                              : AlertCircle;
                        const color =
                          item.status === "pass"
                            ? "text-green-600 dark:text-green-400"
                            : item.status === "fail"
                              ? "text-destructive"
                              : "text-muted-foreground";
                        return (
                          <li key={i} className="flex gap-3 text-sm">
                            <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${color}`} />
                            <span className="min-w-0 flex-1 break-words text-foreground">
                              <span className="font-medium">{item.name}</span>
                              {item.detail && (
                                <span className="text-muted-foreground"> — {item.detail}</span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}

            {/* Feedback snippets */}
            {result.contentDetails?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Detailed feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {result.contentDetails.map((d, i) => (
                      <li key={i} className="overflow-hidden rounded-lg border bg-muted/30 p-3 text-sm">
                        <span className="font-medium text-foreground">{d.category}</span>
                        <span className="text-muted-foreground"> — {d.score}/100</span>
                        <p className="mt-1 break-words text-muted-foreground">{d.feedback}</p>
                        {d.snippet && (
                          <p className="mt-2 break-words text-xs italic text-muted-foreground">
                            &quot;{d.snippet}&quot;
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            </div>
          </div>
        )}

        {/* Placeholder when no result yet - keeps layout balanced */}
        {!result && (
          <div className="min-w-0">
            <Card className="border-dashed bg-muted/20">
              <CardContent className="flex min-h-[320px] flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                Your score and breakdown will appear here after you upload a resume.
              </p>
            </CardContent>
          </Card>
          </div>
        )}
      </div>
    </div>
  );
}
