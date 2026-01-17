/*
  Warnings:

  - You are about to drop the column `details` on the `event_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `speaker_id` on the `event_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `certificate_enabled` on the `event_settings` table. All the data in the column will be lost.
  - You are about to drop the column `certificate_template` on the `event_settings` table. All the data in the column will be lost.
  - You are about to drop the column `show_plans` on the `event_settings` table. All the data in the column will be lost.
  - You are about to drop the column `show_schedule` on the `event_settings` table. All the data in the column will be lost.
  - You are about to drop the column `show_speakers` on the `event_settings` table. All the data in the column will be lost.
  - You are about to drop the column `show_team` on the `event_settings` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `event_speakers` table. All the data in the column will be lost.
  - You are about to drop the column `photo` on the `event_speakers` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_paid` on the `events` table. All the data in the column will be lost.
  - You are about to drop the `event_team_members` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `event_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `event_speakers` table without a default value. This is not possible if the table is not empty.
  - Made the column `designation` on table `event_speakers` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `amount` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "event_schedules" DROP CONSTRAINT "event_schedules_speaker_id_fkey";

-- DropForeignKey
ALTER TABLE "event_team_members" DROP CONSTRAINT "event_team_members_event_id_fkey";

-- DropIndex
DROP INDEX "event_schedules_event_id_idx";

-- AlterTable
ALTER TABLE "event_schedules" DROP COLUMN "details",
DROP COLUMN "speaker_id",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "event_settings" DROP COLUMN "certificate_enabled",
DROP COLUMN "certificate_template",
DROP COLUMN "show_plans",
DROP COLUMN "show_schedule",
DROP COLUMN "show_speakers",
DROP COLUMN "show_team";

-- AlterTable
ALTER TABLE "event_speakers" DROP COLUMN "bio",
DROP COLUMN "photo",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "organization" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "designation" SET NOT NULL;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "details",
DROP COLUMN "features",
DROP COLUMN "is_paid",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL;

-- DropTable
DROP TABLE "event_team_members";

-- DropEnum
DROP TYPE "EventFeatures";

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
