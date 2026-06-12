import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

const CATEGORIES = [
  { key: "content", label: "Content" },
  { key: "formatBrevity", label: "Format & brevity" },
  { key: "style", label: "Style" },
  { key: "sections", label: "Sections" },
  { key: "skills", label: "Skills" },
];

export default function AtsResults({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-6 pb-4">
      <Card className="overflow-hidden border-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="h-5 w-5 text-primary" />
            Overall ATS Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <span className="text-3xl font-bold text-primary">
                {result.overallScore}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              <Progress value={result.overallScore} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {result.totalIssues} issue{result.totalIssues !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {CATEGORIES.map(({ key, label }) => {
        const cat = result[key];
        if (!cat?.items?.length) return null;

        return (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between text-base">
                <span>{label}</span>
                <span className="font-mono text-muted-foreground">{cat.score}/100</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {cat.items.map((item, i) => {
                  const Icon =
                    item.status === "pass"
                      ? CheckCircle2
                      : item.status === "fail"
                        ? XCircle
                        : AlertCircle;
                  const color =
                    item.status === "pass"
                      ? "text-green-600 dark:text-green-400"
                      : item.status === "fail"
                        ? "text-destructive"
                        : "text-muted-foreground";

                  return (
                    <li key={i} className="flex gap-3 text-sm">
                      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${color}`} />
                      <span className="min-w-0 flex-1 break-words text-foreground">
                        <span className="font-medium">{item.name}</span>
                        {item.detail && (
                          <span className="text-muted-foreground"> — {item.detail}</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        );
      })}

      {result.contentDetails?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Detailed feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {result.contentDetails.map((d, i) => (
                <li
                  key={i}
                  className="overflow-hidden rounded-lg border bg-muted/30 p-3 text-sm"
                >
                  <span className="font-medium text-foreground">{d.category}</span>
                  <span className="text-muted-foreground"> — {d.score}/100</span>
                  <p className="mt-1 break-words text-muted-foreground">{d.feedback}</p>
                  {d.snippet && (
                    <p className="mt-2 break-words text-xs italic text-muted-foreground">
                      &quot;{d.snippet}&quot;
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
