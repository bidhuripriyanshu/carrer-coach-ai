"use client";

import { useState } from "react";
import { History, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteJobSearch } from "@/actions/startup-jobs";
import { toast } from "sonner";

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function SearchHistoryPanel({ history, onReload }) {
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  if (!history || history.length === 0) return null;

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteJobSearch(id);
      toast.success("Search removed");
      // Trigger page refresh to update list
      window.location.reload();
    } catch {
      toast.error("Failed to delete search");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader
        className="cursor-pointer select-none py-3"
        onClick={() => setOpen((o) => !o)}
      >
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Recent searches
            <Badge variant="secondary" className="text-xs">
              {history.length}
            </Badge>
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-1.5">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onReload(item.id)}
              className="group flex items-center justify-between gap-2 rounded-md px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.targetRole}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.techStack?.slice(0, 3).join(", ")}
                  {item.location ? ` · ${item.location}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">
                  {item.resultCount} results · {timeAgo(item.createdAt)}
                </span>
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
