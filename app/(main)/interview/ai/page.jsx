import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AiInterview from "./_components/ai-interview";

export default function AiInterviewPage() {
  return (
    <div className="container mx-auto space-y-4 py-6">
      <div className="flex flex-col space-y-2 mx-2">
        <Link href="/interview">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation
          </Button>
        </Link>

        <div>
          <h1 className="text-5xl font-bold gradient-title md:text-6xl">
            AI Mock Interview
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Live face-to-face AI interviews with camera, microphone, and anti-cheat
            proctoring. Technical or HR — personalized from your resume, scored out of 10.
          </p>
        </div>
      </div>

      <AiInterview />
    </div>
  );
}
