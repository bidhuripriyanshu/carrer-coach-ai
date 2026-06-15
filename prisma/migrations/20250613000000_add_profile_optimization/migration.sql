-- CreateTable
CREATE TABLE "ProfileOptimization" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "profileLabel" TEXT,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileOptimization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileOptimization_userId_idx" ON "ProfileOptimization"("userId");

-- CreateIndex
CREATE INDEX "ProfileOptimization_userId_platform_idx" ON "ProfileOptimization"("userId", "platform");

-- AddForeignKey
ALTER TABLE "ProfileOptimization" ADD CONSTRAINT "ProfileOptimization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
