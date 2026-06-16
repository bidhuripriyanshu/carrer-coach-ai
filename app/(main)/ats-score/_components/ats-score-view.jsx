"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Upload,
  FileText,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAtsAnalysisById } from "@/actions/ats-score";
import AtsResults from "./ats-results";
import AtsHistory from "./ats-history";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_EXT = [".pdf", ".docx"];

export default function AtsScoreView({ initialHistory = [] }) {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [historyLoadingId, setHistoryLoadingId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const validateFile = (selected) => {
    if (!selected) return "Please select a file";
    const name = selected.name.toLowerCase();

    if (!ALLOWED_EXT.some((ext) => name.endsWith(ext))) {
      return "Only PDF or DOCX allowed";
    }

    if (selected.size > MAX_SIZE) {
      return "File must be under 2MB";
    }

    return null;
  };

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

  const handleUpload = async () => {
    if (!file) {
      inputRef.current?.click();
      return;
    }

    setLoading(true);

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
      setSelectedId(json.data.id);
      toast.success("Resume analyzed and saved to history");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = async (id) => {
    if (!id) {
      setSelectedId(null);
      setResult(null);
      return;
    }

    if (selectedId === id && result) return;

    setHistoryLoadingId(id);
    try {
      const data = await getAtsAnalysisById(id);
      setResult(data);
      setSelectedId(id);
    } catch (err) {
      toast.error(err.message || "Failed to load analysis");
    } finally {
      setHistoryLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-3 border-b pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wider">
            ATS
          </Badge>
          <span className="text-sm text-muted-foreground">Applicant Tracking System</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight gradient-title md:text-6xl text-white">
          ATS Resume Score
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Get instant, AI-powered feedback on how well your resume passes applicant tracking systems.
          Upload your resume to see scores, explanations, and your saved scan history.
        </p>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)] lg:grid-cols-1 lg:gap-8">
        {/* Upload */}
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

            <p className="mt-6 text-xs text-muted-foreground">
              Results are saved to your account history after each scan.
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="min-h-0 min-w-0 w-full">
          {result ? (
            <div className="overflow-y-auto rounded-xl border bg-card/50 lg:max-h-[calc(100vh-12rem)] lg:pr-1">
              {result.fileName && (
                <div className="border-b bg-muted/30 px-4 py-3">
                  <p className="text-sm font-medium truncate">{result.fileName}</p>
                  {result.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(result.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              <div className="p-4">
                <AtsResults result={result} />
              </div>
            </div>
          ) : (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="flex min-h-[320px] flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  Your score and breakdown will appear here after you upload a resume,
                  or select a past scan from history.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History */}
        <div className="min-w-0">
          <AtsHistory
            history={initialHistory}
            selectedId={selectedId}
            loadingId={historyLoadingId}
            onSelect={handleSelectHistory}
          />
        </div>
      </div>
    </div>
  );
}
