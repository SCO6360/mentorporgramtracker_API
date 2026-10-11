import "../src/env";
import { faker } from "@faker-js/faker";
import { prisma } from "../src/db";
import type { Prisma } from "../src/generated/prisma/client";

// Fixed seed so every run produces the same people, IDs, and pairings.
faker.seed(2026);

const ADMIN_COUNT = 2;
const MENTOR_COUNT = 28;
const MENTEE_COUNT = 70;
const SPRING_MENTEE_COUNT = 30;
const CANCELLED_RATE = 0.1;

const PROGRAMS = [
  {
    name: "Spring 2026 Cohort",
    description: "Sixteen-week mentorship program for early-career engineers.",
    startDate: new Date("2026-02-02"),
    endDate: new Date("2026-05-29"),
  },
  {
    name: "Fall 2026 Cohort",
    description: "Sixteen-week mentorship program for career changers.",
    startDate: new Date("2026-09-07"),
    endDate: new Date("2026-12-18"),
  },
] as const;

function makeUsers(
  count: number,
  role: "ADMIN" | "MENTOR" | "MENTEE",
  emails: Set<string>,
): Prisma.UserCreateManyInput[] {
  return Array.from({ length: count }, () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    // example.com is reserved for documentation, so these never reach a real inbox.
    let email = faker.internet
      .email({ firstName, lastName, provider: "example.com" })
      .toLowerCase();
    while (emails.has(email)) {
      email = email.replace("@", faker.string.numeric(1) + "@");
    }
    emails.add(email);

    return {
      id: faker.string.uuid(),
      email,
      firstName,
      lastName,
      role,
      jobTitle: role === "MENTEE" ? null : faker.person.jobTitle(),
      company: role === "MENTEE" ? null : faker.company.name(),
      bio: faker.person.bio(),
    };
  });
}

// Spread mentees evenly across a shuffled list of mentors.
function pairMentees(
  programId: string,
  mentees: Prisma.UserCreateManyInput[],
  mentors: Prisma.UserCreateManyInput[],
  completed: { endedAt: Date } | null,
  startedAt: Date,
): Prisma.MentorshipCreateManyInput[] {
  const shuffled = faker.helpers.shuffle(mentors);
  return mentees.map((mentee, i) => {
    const mentor = shuffled[i % shuffled.length];
    if (!mentor?.id || !mentee.id) throw new Error("Seed users need IDs");

    const base = {
      id: faker.string.uuid(),
      programId,
      mentorId: mentor.id,
      menteeId: mentee.id,
      startedAt,
    };
    if (!completed) return { ...base, status: "ACTIVE" };
    if (faker.datatype.boolean(CANCELLED_RATE)) {
      return {
        ...base,
        status: "CANCELLED",
        endedAt: faker.date.between({ from: startedAt, to: completed.endedAt }),
      };
    }
    return { ...base, status: "COMPLETED", endedAt: completed.endedAt };
  });
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed: NODE_ENV is production");
  }

  const emails = new Set<string>();
  const admins = makeUsers(ADMIN_COUNT, "ADMIN", emails);
  const mentors = makeUsers(MENTOR_COUNT, "MENTOR", emails);
  const mentees = makeUsers(MENTEE_COUNT, "MENTEE", emails);

  const [spring, fall] = PROGRAMS.map((p) => ({
    id: faker.string.uuid(),
    ...p,
  }));
  if (!spring || !fall) throw new Error("Expected two programs");

  const mentorships = [
    ...pairMentees(
      spring.id,
      mentees.slice(0, SPRING_MENTEE_COUNT),
      mentors.slice(0, MENTOR_COUNT / 2),
      { endedAt: spring.endDate },
      spring.startDate,
    ),
    ...pairMentees(
      fall.id,
      mentees.slice(SPRING_MENTEE_COUNT),
      mentors,
      null,
      fall.startDate,
    ),
  ];

  // Replace all existing data in one transaction so a failed run leaves nothing half-written.
  await prisma.$transaction([
    prisma.mentorship.deleteMany(),
    prisma.program.deleteMany(),
    prisma.user.deleteMany(),
    prisma.user.createMany({ data: [...admins, ...mentors, ...mentees] }),
    prisma.program.createMany({ data: [spring, fall] }),
    prisma.mentorship.createMany({ data: mentorships }),
  ]);

  console.log(
    `Seeded ${admins.length + mentors.length + mentees.length} users ` +
      `(${admins.length} admins, ${mentors.length} mentors, ${mentees.length} mentees), ` +
      `${PROGRAMS.length} programs, ${mentorships.length} mentorships`,
  );
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
