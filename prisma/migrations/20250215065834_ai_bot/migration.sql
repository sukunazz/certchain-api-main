-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "is_ai" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "team_members" ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "role" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;
