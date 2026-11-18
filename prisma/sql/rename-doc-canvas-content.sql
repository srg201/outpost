-- One-off: align Doc/Canvas column names with the app code (keeps existing data).
ALTER TABLE "Doc" RENAME COLUMN "contentType" TO "content";
ALTER TABLE "Doc" RENAME COLUMN "yjsStateBytes" TO "yjsState";
ALTER TABLE "Canvas" RENAME COLUMN "contentType" TO "content";
