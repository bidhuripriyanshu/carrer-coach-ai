-- CreateTable
CREATE TABLE "AtsAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT,
    "fileType" TEXT,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "totalIssues" INTEGER NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AtsAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AtsAnalysis_userId_idx" ON "AtsAnalysis"("userId");

-- CreateIndex
CREATE INDEX "AtsAnalysis_userId_createdAt_idx" ON "AtsAnalysis"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "AtsAnalysis" ADD CONSTRAINT "AtsAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
