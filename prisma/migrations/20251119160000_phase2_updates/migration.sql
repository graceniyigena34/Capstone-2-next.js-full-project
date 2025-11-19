-- AlterTable
ALTER TABLE "Post" ADD COLUMN "coverImage" TEXT;
ALTER TABLE "Post" ADD COLUMN "readTime" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN "slug" TEXT;

-- Backfill slugs for any existing tags
UPDATE "Tag"
SET "slug" = lower(replace("name", ' ', '-'))
WHERE "slug" IS NULL;

-- Ensure slug uniqueness
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

