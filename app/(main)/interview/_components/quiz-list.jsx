"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuizResult from "./quiz-result";
import AiInterviewResult from "../ai/_components/ai-interview-result";

function isAiInterview(category) {
  return category?.startsWith("AI ");
}

function formatScore(assessment) {
  if (isAiInterview(assessment.category)) {
    return `${Number(assessment.quizScore).toFixed(1)}/10`;
  }
  return `${assessment.quizScore.toFixed(1)}%`;
}

export default function QuizList({ assessments }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="gradient-title text-3xl md:text-4xl">
                Recent Practice
              </CardTitle>
              <CardDescription>
                Review your quiz and AI interview performance
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => router.push("/interview/ai")}>
                AI Interview
              </Button>
              <Button onClick={() => router.push("/interview/mock")}>
                MCQ Quiz
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!assessments?.length && (
              <p className="text-sm text-muted-foreground">
                No practice sessions yet. Start an MCQ quiz or AI interview.
              </p>
            )}
            {assessments?.map((assessment, i) => (
              <Card
                key={assessment.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedQuiz(assessment)}
              >
                <CardHeader>
                  <CardTitle className="gradient-title text-2xl">
                    {isAiInterview(assessment.category)
                      ? assessment.category
                      : `Quiz ${i + 1}`}
                  </CardTitle>
                  <CardDescription className="flex justify-between w-full gap-4">
                    <div>Score: {formatScore(assessment)}</div>
                    <div>
                      {format(
                        new Date(assessment.createdAt),
                        "MMMM dd, yyyy HH:mm"
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                {assessment.improvementTip && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {assessment.improvementTip}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedQuiz?.category || "Practice Results"}
            </DialogTitle>
          </DialogHeader>
          {selectedQuiz && isAiInterview(selectedQuiz.category) ? (
            <AiInterviewResult
              result={selectedQuiz}
              onStartNew={() => {
                setSelectedQuiz(null);
                router.push("/interview/ai");
              }}
            />
          ) : (
            <QuizResult
              result={selectedQuiz}
              hideStartNew
              onStartNew={() => router.push("/interview/mock")}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
