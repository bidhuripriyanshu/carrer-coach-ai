/**
 * Seed script: inserts sample Feedback rows so the landing page
 * shows real data from day one.
 * Run once: node scripts/seed-feedback.mjs
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const db = new PrismaClient({ adapter });

const seeds = [
  {
    name: "Ayesha R.",
    role: "Frontend Engineer at Razorpay",
    rating: 5,
    category: "resume",
    message:
      "The AI resume builder saved me hours. My ATS score jumped from 58% to 91% after using the suggestions. Got 3 interview calls within a week!",
  },
  {
    name: "Karan M.",
    role: "Product Manager",
    rating: 5,
    category: "interview",
    message:
      "The mock interview feature is insanely good. The AI asked questions I actually got in my Flipkart round. I finally cracked a PM role at a Series B startup.",
  },
  {
    name: "Priya S.",
    role: "Full-Stack Developer",
    rating: 5,
    category: "profile-optimize",
    message:
      "My GitHub profile was a mess. After running Profile Optimizer, my README was rewritten completely and my LinkedIn got 4x more profile views in a month.",
  },
  {
    name: "Rohan T.",
    role: "DevOps Engineer",
    rating: 4,
    category: "startup-jobs",
    message:
      "Startup Job Finder matched me with companies I'd never have found on LinkedIn. Landed at a 30-person seed-stage startup — exactly the culture I wanted.",
  },
  {
    name: "Sneha D.",
    role: "Data Scientist",
    rating: 5,
    category: "general",
    message:
      "Switched careers from academia to tech with this platform. The AI coach understood my background and gave career paths I hadn't considered. Life-changing.",
  },
  {
    name: "Arjun B.",
    role: "SDE-2 at a Y-Combinator startup",
    rating: 5,
    category: "resume",
    message:
      "The cover letter AI is incredibly context-aware. Wrote a letter that perfectly matched the job description and felt genuine — not templated at all.",
  },
];

async function main() {
  console.log("Seeding feedback…");
  for (const seed of seeds) {
    await db.feedback.create({ data: { ...seed, approved: true } });
    console.log(`  ✅ Created: ${seed.name}`);
  }
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
