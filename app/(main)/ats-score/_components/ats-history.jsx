"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Eye, Trash2, History, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAtsAnalysis } from "@/actions/ats-score";

export default function AtsHistory({
  history,
  selectedId,
  onSelect,
  loadingId,
}) {
  const router = useRouter();

  const handleDelete = async (id) => {
    try {
      await deleteAtsAnalysis(id);
      toast.success("Analysis removed from history");
      if (selectedId === id) onSelect(null);
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to delete analysis");
    }
  };

  if (!history?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Analysis History
          </CardTitle>
          <CardDescription>
            Past ATS scans will appear here after you analyze a resume.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Analysis History
        </CardTitle>
        <CardDescription>
          {history.length} saved scan{history.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.map((item) => {
          const isSelected = selectedId === item.id;
          const isLoading = loadingId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-lg border p-3 transition-colors ${
                isSelected ? "border-primary bg-primary/5" : "bg-muted/20"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">
                    {item.fileName || "Resume scan"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.createdAt), "PPp")}
                  </p>
                </div>
                <Badge
                  variant={item.overallScore >= 70 ? "default" : "secondary"}
                  className="shrink-0 font-mono"
                >
                  {Math.round(item.overallScore)}
                </Badge>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {item.totalIssues} issue{item.totalIssues !== 1 ? "s" : ""}
                {item.fileType ? ` · ${item.fileType.toUpperCase()}` : ""}
              </p>

              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  disabled={isLoading}
                  onClick={() => onSelect(item.id)}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  View
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this analysis?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove the saved ATS score and feedback.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
