import { Brain, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function isAiInterview(category) {
  return category?.startsWith("AI ");
}

function formatScoreValue(assessment) {
  if (!assessment) return "0";
  if (isAiInterview(assessment.category)) {
    return `${Number(assessment.quizScore).toFixed(1)}/10`;
  }
  return `${assessment.quizScore.toFixed(1)}%`;
}

function getNormalizedScore(assessment) {
  if (!assessment) return 0;
  if (isAiInterview(assessment.category)) {
    return (Number(assessment.quizScore) / 10) * 100;
  }
  return assessment.quizScore;
}

export default function StatsCards({ assessments }) {
  const getAverageScore = () => {
    if (!assessments?.length) return "0";
    const total = assessments.reduce(
      (sum, assessment) => sum + getNormalizedScore(assessment),
      0
    );
    return (total / assessments.length).toFixed(1);
  };

  const getLatestAssessment = () => {
    if (!assessments?.length) return null;
    return assessments[0];
  };

  const getTotalQuestions = () => {
    if (!assessments?.length) return 0;
    return assessments.reduce(
      (sum, assessment) => sum + assessment.questions.length,
      0
    );
  };

  const latest = getLatestAssessment();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getAverageScore()}%</div>
          <p className="text-xs text-muted-foreground">
            Normalized across quizzes and AI interviews
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Questions Practiced
          </CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getTotalQuestions()}</div>
          <p className="text-xs text-muted-foreground">Total questions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatScoreValue(latest)}</div>
          <p className="text-xs text-muted-foreground">
            {latest ? latest.category : "Most recent session"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
