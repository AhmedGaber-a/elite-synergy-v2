-- Year scoping for community posts. Existing posts keep NULL.
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "academicYear" INTEGER;
CREATE INDEX IF NOT EXISTS "Post_community_academicYear_idx" ON "Post"("community", "academicYear");
