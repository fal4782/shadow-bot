-- AlterTable
ALTER TABLE "Transcript" ADD COLUMN     "detailedSummary" TEXT,
ADD COLUMN     "detailedSummaryStatus" "TranscriptStatus" NOT NULL DEFAULT 'PENDING';
