/*
  Warnings:

  - You are about to drop the column `online_link` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "online_link",
ADD COLUMN     "link" TEXT;
