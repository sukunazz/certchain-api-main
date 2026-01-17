-- CreateEnum
CREATE TYPE "OrganizerType" AS ENUM ('INSTITUTE', 'ORGANIZATION', 'INDIVIDUAL', 'COLLEGE', 'SCHOOL', 'OTHER');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('ONLINE', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ENDED');

-- CreateEnum
CREATE TYPE "EventFeatures" AS ENUM ('SPEAKERS', 'TEAM', 'SCHEDULE', 'PLANS');

-- CreateEnum
CREATE TYPE "PlanFeatureStatus" AS ENUM ('INCLUDED', 'EXCLUDED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('ACTIVE', 'BANNED', 'LEFT');

-- CreateEnum
CREATE TYPE "WebhookType" AS ENUM ('DISCORD', 'SLACK', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organizer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "type" "OrganizerType" NOT NULL DEFAULT 'OTHER',
    "subdomain" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organizer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizerId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_member_invitations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,

    CONSTRAINT "team_member_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizer_domains" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,

    CONSTRAINT "organizer_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "type" "EventType" NOT NULL DEFAULT 'IN_PERSON',
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "features" "EventFeatures"[] DEFAULT ARRAY[]::"EventFeatures"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "handle" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "details" TEXT,
    "banner" TEXT,
    "online_link" TEXT,
    "password" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "pincode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSchedule" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "speakerId" TEXT,

    CONSTRAINT "EventSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_plan_features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "PlanFeatureStatus" NOT NULL,
    "plan_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_plan_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "eventId" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'ACTIVE',
    "qr_code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participant_bans" (
    "id" TEXT NOT NULL,
    "user_event_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "banned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "banned_by_id" TEXT NOT NULL,

    CONSTRAINT "participant_bans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_webhooks" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "type" "WebhookType" NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_settings" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "show_speakers" BOOLEAN NOT NULL DEFAULT false,
    "show_team" BOOLEAN NOT NULL DEFAULT false,
    "show_schedule" BOOLEAN NOT NULL DEFAULT false,
    "show_plans" BOOLEAN NOT NULL DEFAULT false,
    "registration_enabled" BOOLEAN NOT NULL DEFAULT false,
    "registration_end_date" TIMESTAMP(3),
    "max_registrations" INTEGER,
    "certificate_enabled" BOOLEAN NOT NULL DEFAULT false,
    "certificate_template" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_speakers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "bio" TEXT,
    "photo" TEXT,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userEventId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organizer_email_key" ON "Organizer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organizer_subdomain_key" ON "Organizer"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_email_key" ON "TeamMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "team_member_invitations_email_key" ON "team_member_invitations"("email");

-- CreateIndex
CREATE INDEX "team_member_invitations_organizer_id_email_idx" ON "team_member_invitations"("organizer_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "organizer_domains_domain_key" ON "organizer_domains"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "events_handle_key" ON "events"("handle");

-- CreateIndex
CREATE INDEX "EventSchedule_eventId_idx" ON "EventSchedule"("eventId");

-- CreateIndex
CREATE INDEX "plans_eventId_idx" ON "plans"("eventId");

-- CreateIndex
CREATE INDEX "UserEvent_userId_idx" ON "UserEvent"("userId");

-- CreateIndex
CREATE INDEX "UserEvent_eventId_idx" ON "UserEvent"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "participant_bans_user_event_id_key" ON "participant_bans"("user_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_settings_event_id_key" ON "event_settings"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_userEventId_key" ON "Payment"("userEventId");

-- CreateIndex
CREATE INDEX "Payment_userEventId_idx" ON "Payment"("userEventId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_eventId_userId_key" ON "Certificate"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member_invitations" ADD CONSTRAINT "team_member_invitations_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "Organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizer_domains" ADD CONSTRAINT "organizer_domains_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "Organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "Organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSchedule" ADD CONSTRAINT "EventSchedule_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSchedule" ADD CONSTRAINT "EventSchedule_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "event_speakers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_plan_features" ADD CONSTRAINT "event_plan_features_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEvent" ADD CONSTRAINT "UserEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEvent" ADD CONSTRAINT "UserEvent_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEvent" ADD CONSTRAINT "UserEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_bans" ADD CONSTRAINT "participant_bans_user_event_id_fkey" FOREIGN KEY ("user_event_id") REFERENCES "UserEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_bans" ADD CONSTRAINT "participant_bans_banned_by_id_fkey" FOREIGN KEY ("banned_by_id") REFERENCES "TeamMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_webhooks" ADD CONSTRAINT "event_webhooks_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_settings" ADD CONSTRAINT "event_settings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_team_members" ADD CONSTRAINT "event_team_members_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userEventId_fkey" FOREIGN KEY ("userEventId") REFERENCES "UserEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
