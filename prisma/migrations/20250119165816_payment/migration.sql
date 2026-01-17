/*
  Warnings:

  - You are about to drop the column `user_event_id` on the `payments` table. All the data in the column will be lost.
  - Added the required column `event_id` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_event_id_fkey";

-- DropIndex
DROP INDEX "payments_user_event_id_idx";

-- DropIndex
DROP INDEX "payments_user_event_id_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "user_event_id",
ADD COLUMN     "event_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_events" ADD COLUMN     "payment_id" TEXT;

-- CreateIndex
CREATE INDEX "payments_event_id_idx" ON "payments"("event_id");

-- AddForeignKey
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
