/*
  Warnings:

  - You are about to drop the column `released` on the `enrollments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "enrollments" DROP COLUMN "released",
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
