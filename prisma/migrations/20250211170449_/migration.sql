/*
  Warnings:

  - A unique constraint covering the columns `[event_id]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "conversations_event_id_key" ON "conversations"("event_id");
