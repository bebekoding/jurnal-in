-- Migration: add Random Topics feature
-- Run this ONCE in Supabase SQL Editor after schema.sql

-- CreateTable Topic
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledFor" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Topic_scheduledFor_idx" ON "Topic"("scheduledFor");

-- Add topicId to Journal
ALTER TABLE "Journal" ADD COLUMN "topicId" TEXT;

CREATE INDEX "Journal_topicId_idx" ON "Journal"("topicId");

ALTER TABLE "Journal" ADD CONSTRAINT "Journal_topicId_fkey"
  FOREIGN KEY ("topicId") REFERENCES "Topic"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
