"use client";

import { Bot, Mic, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InterviewerPanel({
  interviewerName,
  interviewType,
  status,
  currentQuestion,
  acknowledgment,
}) {
  const statusLabel =
    status === "speaking"
      ? "Speaking"
      : status === "listening"
        ? "Listening to you"
        : status === "thinking"
          ? "Thinking…"
          : "Ready";

  return (
    <div className="rounded-xl border bg-gradient-to-br from-primary/10 via-background to-muted/40 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 ${
              status === "speaking" ? "animate-pulse" : ""
            }`}
          >
            <Bot className="h-8 w-8 text-primary" />
            {status === "speaking" && (
              <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
            )}
          </div>
          <div>
            <p className="font-semibold">{interviewerName}</p>
            <p className="text-xs text-muted-foreground">AI Interviewer</p>
          </div>
        </div>
        <Badge variant="secondary">{interviewType}</Badge>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {status === "speaking" ? (
          <Volume2 className="h-4 w-4 text-primary animate-pulse" />
        ) : status === "listening" ? (
          <Mic className="h-4 w-4 text-green-500 animate-pulse" />
        ) : (
          <Bot className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-muted-foreground">{statusLabel}</span>
      </div>

      {acknowledgment && (
        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <p className="text-xs font-medium text-muted-foreground mb-1">Interviewer</p>
          <p>{acknowledgment}</p>
        </div>
      )}

      {currentQuestion && (
        <div className="rounded-lg border bg-background/80 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Current question</p>
          <p className="font-medium leading-relaxed">{currentQuestion}</p>
        </div>
      )}
    </div>
  );
}
