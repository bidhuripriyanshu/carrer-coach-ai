"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mic, MicOff, ShieldAlert, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useInterviewProctor } from "@/hooks/use-interview-proctor";
import { useInterviewSpeech } from "@/hooks/use-interview-speech";
import { getLiveInterviewTurn } from "@/actions/ai-interview";
import InterviewerPanel from "./interviewer-panel";

const TOTAL_TURNS = 5;

export default function LiveInterviewRoom({
  interviewType,
  resumeMeta,
  onComplete,
  onExit,
}) {
  const [conversation, setConversation] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [acknowledgment, setAcknowledgment] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("thinking");
  const [loading, setLoading] = useState(true);
  const [violationCount, setViolationCount] = useState(0);

  const {
    videoRef,
    cameraReady,
    micReady,
    startMedia,
    stopMedia,
    getProctoringReport,
    recordViolation,
  } = useInterviewProctor({
    active: true,
    onViolation: () => {
      setViolationCount((c) => c + 1);
      toast.warning("Proctoring violation recorded", { duration: 2000 });
    },
  });

  const {
    speechSupported,
    isListening,
    isSpeaking,
    transcript,
    setTranscript,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    resetTranscript,
  } = useInterviewSpeech();

  const interviewerName =
    interviewType === "technical" ? "Alex (Tech Lead)" : "Sarah (HR Manager)";
  const typeLabel = interviewType === "technical" ? "Technical" : "HR";

  useEffect(() => {
    startMedia().catch((err) => {
      toast.error(err.message);
      onExit();
    });

    return () => {
      stopMedia();
      stopSpeaking();
      stopListening();
    };
  }, []);

  useEffect(() => {
    if (speechSupported && transcript) {
      setAnswer(transcript);
    }
  }, [transcript, speechSupported]);

  const loadTurn = async (index, history) => {
    setLoading(true);
    setStatus("thinking");
    try {
      const turn = await getLiveInterviewTurn({
        type: interviewType,
        resumeText: resumeMeta.text,
        conversation: history,
        turnIndex: index,
      });

      setAcknowledgment(turn.acknowledgment || "");
      setCurrentQuestion(turn.question);
      setStatus("speaking");

      const spoken = [turn.acknowledgment, turn.question].filter(Boolean).join(" ");
      await speak(spoken);
      setStatus("listening");

      if (speechSupported) {
        resetTranscript();
        startListening();
      }
    } catch (err) {
      toast.error(err.message || "Failed to load interview question");
      onExit();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTurn(0, []);
  }, []);

  const handleSubmitAnswer = async () => {
    const finalAnswer = (answer || transcript || "").trim();

    if (finalAnswer.length < 20) {
      toast.error("Please give a fuller spoken answer (at least a few sentences).");
      return;
    }

    if (/(.)\1{8,}/.test(finalAnswer) || finalAnswer.split(" ").length < 5) {
      recordViolation("suspicious_answer", "Answer appears invalid or too short");
    }

    stopListening();
    stopSpeaking();
    setStatus("thinking");

    const entry = {
      question: currentQuestion,
      userAnswer: finalAnswer,
      acknowledgment,
    };

    const updated = [...conversation, entry];
    setConversation(updated);
    setAnswer("");
    resetTranscript();

    const nextTurn = turnIndex + 1;

    if (nextTurn >= TOTAL_TURNS) {
      onComplete({
        conversation: updated,
        proctoring: getProctoringReport(),
      });
      return;
    }

    setTurnIndex(nextTurn);
    await loadTurn(nextTurn, updated);
  };

  const handleManualType = (value) => {
    if (value.length > answer.length + 40) {
      recordViolation("paste_suspected", "Large text insert detected — typing only");
      return;
    }
    setAnswer(value);
    setTranscript(value);
  };

  return (
    <div className="mx-2 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="outline" className="gap-1">
          <ShieldAlert className="h-3.5 w-3.5" />
          Proctored live session
        </Badge>
        <div className="flex gap-2 text-xs">
          <Badge variant={cameraReady ? "default" : "destructive"}>Camera</Badge>
          <Badge variant={micReady ? "default" : "destructive"}>Mic</Badge>
          {violationCount > 0 && (
            <Badge variant="destructive">{violationCount} violation(s)</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <div className="rounded-xl border overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="aspect-video w-full object-cover -scale-x-100"
            />
            <p className="p-2 text-xs text-center text-muted-foreground bg-muted/30">
              You — stay visible on camera
            </p>
          </div>

          <InterviewerPanel
            interviewerName={interviewerName}
            interviewType={typeLabel}
            status={loading ? "thinking" : isSpeaking ? "speaking" : isListening ? "listening" : status}
            currentQuestion={currentQuestion}
            acknowledgment={turnIndex > 0 ? acknowledgment : null}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              <span>
                Turn {Math.min(turnIndex + 1, TOTAL_TURNS)} of {TOTAL_TURNS}
              </span>
              {isListening && (
                <span className="text-xs font-normal text-green-600 flex items-center gap-1">
                  <Mic className="h-3.5 w-3.5 animate-pulse" /> Recording
                </span>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {speechSupported
                ? "Speak your answer naturally. The AI interviewer is listening. Copy/paste is disabled."
                : "Voice not supported in this browser — type your answer manually (no paste)."}
            </p>

            <Textarea
              value={answer}
              onChange={(e) => handleManualType(e.target.value)}
              onPaste={(e) => {
                e.preventDefault();
                recordViolation("clipboard", "Paste blocked during interview");
                toast.error("Paste is not allowed during the interview");
              }}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              placeholder={
                speechSupported
                  ? "Your spoken answer appears here…"
                  : "Type your answer here (no paste)…"
              }
              rows={8}
              readOnly={speechSupported && isListening}
              className="min-h-[180px] resize-none"
            />

            {speechSupported && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4 mr-1" /> Stop mic
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-1" /> Start mic
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => speak(currentQuestion)}
                  disabled={!currentQuestion || isSpeaking}
                >
                  <Volume2 className="h-4 w-4 mr-1" /> Repeat question
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between gap-3">
            <Button type="button" variant="destructive" onClick={onExit}>
              <Square className="h-4 w-4 mr-1" /> End interview
            </Button>
            <Button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={loading || isSpeaking}
            >
              {turnIndex >= TOTAL_TURNS - 1 ? "Finish interview" : "Submit & next question"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
