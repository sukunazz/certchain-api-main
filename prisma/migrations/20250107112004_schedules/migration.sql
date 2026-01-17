/*
  Warnings:

  - You are about to drop the column `plan_id` on the `user_events` table. All the data in the column will be lost.
  - You are about to drop the `event_plan_features` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plans` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "event_plan_features" DROP CONSTRAINT "event_plan_features_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "plans" DROP CONSTRAINT "plans_event_id_fkey";

-- DropForeignKey
ALTER TABLE "user_events" DROP CONSTRAINT "user_events_plan_id_fkey";

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user_events" DROP COLUMN "plan_id";

-- DropTable
DROP TABLE "event_plan_features";

-- DropTable
DROP TABLE "plans";

-- DropEnum
DROP TYPE "PlanFeatureStatus";
