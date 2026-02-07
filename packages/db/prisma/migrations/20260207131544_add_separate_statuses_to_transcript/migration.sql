/*
  Warnings:

  - You are about to drop the column `status` on the `Transcript` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "TranscriptStatus" ADD VALUE 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "Transcript" DROP COLUMN "status",
ADD COLUMN     "summaryStatus" "TranscriptStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "transcriptionStatus" "TranscriptStatus" NOT NULL DEFAULT 'PENDING';
