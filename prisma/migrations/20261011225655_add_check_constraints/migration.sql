-- Rules Prisma's schema language cannot express, enforced by the database.

-- A user cannot mentor themselves.
ALTER TABLE "mentorships" ADD CONSTRAINT "mentorships_mentor_not_mentee_check" CHECK ("mentor_id" <> "mentee_id");

-- A program cannot end before it starts.
ALTER TABLE "programs" ADD CONSTRAINT "programs_dates_check" CHECK ("end_date" >= "start_date");
