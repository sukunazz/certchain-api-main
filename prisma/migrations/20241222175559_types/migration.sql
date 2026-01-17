/*
  Warnings:

  - You are about to drop the column `createdAt` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Certificate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventSchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organizer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserEvent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `event_id` to the `plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `plans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_userId_fkey";

-- DropForeignKey
ALTER TABLE "EventSchedule" DROP CONSTRAINT "EventSchedule_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventSchedule" DROP CONSTRAINT "EventSchedule_speakerId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userEventId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "UserEvent" DROP CONSTRAINT "UserEvent_eventId_fkey";

-- DropForeignKey
ALTER TABLE "UserEvent" DROP CONSTRAINT "UserEvent_planId_fkey";

-- DropForeignKey
ALTER TABLE "UserEvent" DROP CONSTRAINT "UserEvent_userId_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_organizer_id_fkey";

-- DropForeignKey
ALTER TABLE "organizer_domains" DROP CONSTRAINT "organizer_domains_organizer_id_fkey";

-- DropForeignKey
ALTER TABLE "participant_bans" DROP CONSTRAINT "participant_bans_banned_by_id_fkey";

-- DropForeignKey
ALTER TABLE "participant_bans" DROP CONSTRAINT "participant_bans_user_event_id_fkey";

-- DropForeignKey
ALTER TABLE "plans" DROP CONSTRAINT "plans_eventId_fkey";

-- DropForeignKey
ALTER TABLE "team_member_invitations" DROP CONSTRAINT "team_member_invitations_organizer_id_fkey";

-- DropIndex
DROP INDEX "plans_eventId_idx";

-- AlterTable
ALTER TABLE "plans" DROP COLUMN "createdAt",
DROP COLUMN "eventId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "event_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Certificate";

-- DropTable
DROP TABLE "EventSchedule";

-- DropTable
DROP TABLE "Organizer";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "TeamMember";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserEvent";

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "type" "OrganizerType" NOT NULL DEFAULT 'OTHER',
    "subdomain" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizer_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_schedules" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "details" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "speaker_id" TEXT,

    CONSTRAINT "event_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT,
    "event_id" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'ACTIVE',
    "qr_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "user_event_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizers_email_key" ON "organizers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizers_subdomain_key" ON "organizers"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_email_key" ON "team_members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "event_schedules_event_id_idx" ON "event_schedules"("event_id");

-- CreateIndex
CREATE INDEX "user_events_user_id_idx" ON "user_events"("user_id");

-- CreateIndex
CREATE INDEX "user_events_event_id_idx" ON "user_events"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_user_event_id_key" ON "payments"("user_event_id");

-- CreateIndex
CREATE INDEX "payments_user_event_id_idx" ON "payments"("user_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_event_id_user_id_key" ON "certificates"("event_id", "user_id");

-- CreateIndex
CREATE INDEX "plans_event_id_idx" ON "plans"("event_id");

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member_invitations" ADD CONSTRAINT "team_member_invitations_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizer_domains" ADD CONSTRAINT "organizer_domains_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_schedules" ADD CONSTRAINT "event_schedules_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_schedules" ADD CONSTRAINT "event_schedules_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "event_speakers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_bans" ADD CONSTRAINT "participant_bans_user_event_id_fkey" FOREIGN KEY ("user_event_id") REFERENCES "user_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_bans" ADD CONSTRAINT "participant_bans_banned_by_id_fkey" FOREIGN KEY ("banned_by_id") REFERENCES "team_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_event_id_fkey" FOREIGN KEY ("user_event_id") REFERENCES "user_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
