/*
  Warnings:

  - A unique constraint covering the columns `[user_event_id]` on the table `certificates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_event_id` to the `certificates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "user_event_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "certificates_user_event_id_key" ON "certificates"("user_event_id");

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_event_id_fkey" FOREIGN KEY ("user_event_id") REFERENCES "user_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
