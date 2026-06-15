"use client";

import { useEffect, useState } from "react";
import { Camera, Mic, ShieldAlert, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const RULES = [
  "Keep your camera and microphone on for the entire interview.",
  "Do not switch tabs, minimize the window, or leave this page.",
  "Copy, paste, and right-click are disabled during the session.",
  "Answer yourself — AI may reduce your score for suspicious activity.",
  "Speak clearly; the AI interviewer will ask follow-up questions in real time.",
];

export default function ProctorSetup({ videoRef, onReady, onCancel }) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    return () => {};
  }, []);

  const handleEnable = async () => {
    setChecking(true);
    setError(null);
    try {
      await onReady();
    } catch (err) {
      setError(err.message || "Could not access camera or microphone");
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card className="mx-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          Live interview proctoring
        </CardTitle>
        <CardDescription>
          This is a face-to-face AI interview. Camera, microphone, and anti-cheat
          monitoring are required before you begin.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-muted/20 overflow-hidden">
            <div className="aspect-video bg-black/80 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover -scale-x-100"
              />
            </div>
            <p className="p-2 text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Camera className="h-3.5 w-3.5" /> Your camera preview
            </p>
          </div>

          <ul className="space-y-2 text-sm">
            {RULES.map((rule) => (
              <li key={rule} className="flex gap-2">
                <Monitor className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm">
            I agree to proctored monitoring and will complete this interview
            without external help or cheating.
          </span>
        </label>

        {error && (
          <p className="text-sm text-destructive flex items-center gap-2">
            <Mic className="h-4 w-4" />
            {error}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={!agreed || checking}
          onClick={handleEnable}
        >
          {checking ? "Enabling camera…" : "Enable camera & enter interview"}
        </Button>
      </CardFooter>

    </Card>
  );
}
