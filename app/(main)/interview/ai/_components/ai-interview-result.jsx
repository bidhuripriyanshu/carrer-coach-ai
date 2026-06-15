"use client";

import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function AiInterviewResult({ result, onStartNew }) {
  if (!result) return null;

  const score = Number(result.quizScore) || 0;
  const scorePercent = (score / 10) * 100;

  return (
    <Card className="mx-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Interview Complete
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-xl border bg-muted/30 p-6 text-center space-y-3">
          <Badge variant="secondary">{result.category}</Badge>
          <div className="text-5xl font-bold text-primary">
            {score.toFixed(1)}
            <span className="text-2xl text-muted-foreground">/10</span>
          </div>
          <Progress value={scorePercent} className="h-3" />
          <p className="text-sm text-muted-foreground">
            Overall interview performance score
          </p>
        </div>

        {result.proctoring && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <p className="font-medium">Proctoring report</p>
            <p className="text-muted-foreground mt-1">
              Violations: {result.proctoring.violationCount} · Integrity penalty: -
              {result.proctoring.penalty} · Raw score: {Number(result.proctoring.rawScore).toFixed(1)}/10
            </p>
          </div>
        )}

        {result.improvementTip && (
          <div className="rounded-lg bg-muted p-4">
            <p className="font-medium">Improvement tip</p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.improvementTip}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold">Question breakdown</h3>
          {result.questions?.map((item, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-sm">{item.question}</p>
                <Badge variant="outline" className="shrink-0 font-mono">
                  {Number(item.score).toFixed(1)}/10
                </Badge>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground font-medium">Your answer</p>
                <p className="mt-1">{item.userAnswer}</p>
              </div>
              {item.feedback && (
                <div className="text-sm rounded-md bg-muted/50 p-3">
                  <p className="font-medium">Feedback</p>
                  <p className="text-muted-foreground mt-1">{item.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={onStartNew} className="w-full">
          Start New Interview
        </Button>
      </CardFooter>
    </Card>
  );
}
