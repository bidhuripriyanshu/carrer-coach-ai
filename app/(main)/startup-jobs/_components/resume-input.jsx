"use client";

import { useState } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ResumeInput({ value, onChange, savedResume }) {
  const [usingSaved, setUsingSaved] = useState(false);

  const handleAutoFill = () => {
    if (!savedResume) return;
    onChange(savedResume);
    setUsingSaved(true);
  };

  const handleClear = () => {
    onChange("");
    setUsingSaved(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="resume-input" className="text-sm font-medium">
          Your Resume
        </Label>
        <div className="flex items-center gap-2">
          {usingSaved && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
          {savedResume && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={handleAutoFill}
            >
              {usingSaved ? (
                <>
                  <RefreshCw className="h-3 w-3" />
                  Re-fill from saved
                </>
              ) : (
                <>
                  <FileText className="h-3 w-3" />
                  Use saved resume
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Textarea
        id="resume-input"
        placeholder={
          savedResume
            ? `Click "Use saved resume" to auto-fill, or paste your resume here\u2026`
            : "Paste your resume text here (plain text or markdown)…"
        }
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (usingSaved) setUsingSaved(false);
        }}
        rows={10}
        className="resize-none font-mono text-xs leading-relaxed"
      />

      <p className="text-xs text-muted-foreground">
        {value.length > 0
          ? `${value.length.toLocaleString()} characters · ${Math.ceil(value.length / 4).toLocaleString()} est. tokens`
          : "Resume text helps the AI find strongly-matched startups."}
      </p>
    </div>
  );
}
