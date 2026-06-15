import Link from "next/link";
import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performance-chart";
import QuizList from "./_components/quiz-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, MessageSquare } from "lucide-react";

export default async function InterviewPrepPage() {
  const assessments = await getAssessments();

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              MCQ Quiz
            </CardTitle>
            <CardDescription>
              10 multiple-choice questions based on your industry and skills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/interview/mock">
              <Button className="w-full">Start MCQ Quiz</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Mock Interview
            </CardTitle>
            <CardDescription>
              Live camera interview with AI. Technical or HR, anti-cheat proctoring,
              scored out of 10.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/interview/ai">
              <Button className="w-full">Start AI Interview</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>
    </div>
  );
}