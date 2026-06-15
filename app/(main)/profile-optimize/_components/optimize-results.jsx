import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function OptimizeResults({ result, platformName }) {
  if (!result) return null;

  return (
    <div className="space-y-6">
      <Card className="border-2 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {platformName} Optimization Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end gap-4">
            <span className="text-5xl font-bold text-primary">
              {Math.round(result.overallScore)}
            </span>
            <span className="text-muted-foreground mb-2">/100</span>
          </div>
          <Progress value={result.overallScore} className="h-3" />
          {result.summary && (
            <p className="text-sm text-muted-foreground">{result.summary}</p>
          )}
        </CardContent>
      </Card>

      {result.sections?.map((section, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between text-base">
              <span>{section.name}</span>
              <Badge variant="outline">{section.score}/100</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {section.current && (
              <div>
                <p className="font-medium text-muted-foreground">Current</p>
                <p className="mt-1">{section.current}</p>
              </div>
            )}
            {section.suggested && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                <p className="font-medium text-primary">Suggested</p>
                <p className="mt-1 whitespace-pre-wrap">{section.suggested}</p>
              </div>
            )}
            {section.tips?.length > 0 && (
              <ul className="space-y-1.5">
                {section.tips.map((tip, j) => (
                  <li key={j} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}

      {result.keywords?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recommended keywords</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {result.keywords.map((kw) => (
              <Badge key={kw} variant="secondary">
                {kw}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {result.actionItems?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Priority action items</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              {result.actionItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
