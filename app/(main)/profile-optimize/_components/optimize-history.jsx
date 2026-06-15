"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Eye, Trash2, History } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { deleteProfileOptimization } from "@/actions/profile-optimize";
import { getPlatform } from "@/data/optimization-platforms";

export default function OptimizeHistory({ history, selectedId, onSelect, loadingId }) {
  const router = useRouter();

  const handleDelete = async (id) => {
    try {
      await deleteProfileOptimization(id);
      toast.success("Optimization removed");
      if (selectedId === id) onSelect(null);
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  if (!history?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Optimization History
          </CardTitle>
          <CardDescription>Past optimizations will appear here.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Optimization History
        </CardTitle>
        <CardDescription>{history.length} saved report(s)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.map((item) => {
          const platform = getPlatform(item.platform);
          return (
            <div
              key={item.id}
              className={`rounded-lg border p-3 ${
                selectedId === item.id ? "border-primary bg-primary/5" : ""
              }`}
            >
              <div className="flex justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {item.profileLabel || platform?.name || item.platform}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.createdAt), "PPp")}
                  </p>
                </div>
                <Badge className="shrink-0 font-mono">
                  {Math.round(item.overallScore)}
                </Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  disabled={loadingId === item.id}
                  onClick={() => onSelect(item.id)}
                >
                  <Eye className="h-3.5 w-3.5" />
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
                      <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This optimization report will be permanently removed.
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
