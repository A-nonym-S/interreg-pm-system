/*
  Warnings:

  - You are about to drop the column `detailedDescription` on the `ProjectTask` table. All the data in the column will be lost.
  - You are about to drop the column `repetition` on the `ProjectTask` table. All the data in the column will be lost.
  - You are about to drop the column `sequenceNumber` on the `ProjectTask` table. All the data in the column will be lost.
  - You are about to drop the `SubTask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskPeriodicity` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[taskNumber]` on the table `ProjectTask` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `ProjectTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recurrence` to the `ProjectTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskNumber` to the `ProjectTask` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `priority` on the `ProjectTask` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('VYSOKA', 'STREDNA', 'NIZKA');

-- CreateEnum
CREATE TYPE "TaskRecurrence" AS ENUM ('PRIEBEZNE', 'DVAKRAT_MESACNE', 'KVARTALNE', 'JEDNORAZOVO', 'PODLA_POTREBY', 'PERIODICKY', 'POCAS_STAVBY', 'PO_UKONCENI');

-- CreateEnum
CREATE TYPE "SubtaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');

-- DropForeignKey
ALTER TABLE "SubTask" DROP CONSTRAINT "SubTask_projectTaskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskPeriodicity" DROP CONSTRAINT "TaskPeriodicity_projectTaskId_fkey";

-- DropIndex
DROP INDEX "ProjectTask_sequenceNumber_key";

-- AlterTable
ALTER TABLE "ProjectTask" DROP COLUMN "detailedDescription",
DROP COLUMN "repetition",
DROP COLUMN "sequenceNumber",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "recurrence" "TaskRecurrence" NOT NULL,
ADD COLUMN     "taskNumber" TEXT NOT NULL,
DROP COLUMN "priority",
ADD COLUMN     "priority" "TaskPriority" NOT NULL;

-- DropTable
DROP TABLE "SubTask";

-- DropTable
DROP TABLE "TaskPeriodicity";

-- CreateTable
CREATE TABLE "ProjectSubtask" (
    "id" TEXT NOT NULL,
    "projectTaskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "SubtaskStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSubtask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectSubtask_projectTaskId_dueDate_idx" ON "ProjectSubtask"("projectTaskId", "dueDate");

-- CreateIndex
CREATE INDEX "ProjectSubtask_status_idx" ON "ProjectSubtask"("status");

-- CreateIndex
CREATE INDEX "ProjectSubtask_dueDate_idx" ON "ProjectSubtask"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTask_taskNumber_key" ON "ProjectTask"("taskNumber");

-- CreateIndex
CREATE INDEX "ProjectTask_taskNumber_idx" ON "ProjectTask"("taskNumber");

-- CreateIndex
CREATE INDEX "ProjectTask_taskType_idx" ON "ProjectTask"("taskType");

-- CreateIndex
CREATE INDEX "ProjectTask_recurrence_idx" ON "ProjectTask"("recurrence");

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProjectTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSubtask" ADD CONSTRAINT "ProjectSubtask_projectTaskId_fkey" FOREIGN KEY ("projectTaskId") REFERENCES "ProjectTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
