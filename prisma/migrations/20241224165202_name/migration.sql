/*
  Warnings:

  - Added the required column `name` to the `organizers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organizers" ADD COLUMN     "name" TEXT NOT NULL;
