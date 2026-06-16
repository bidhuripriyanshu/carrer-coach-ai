/**
 * GET /api/seed-feedback
 * One-time seeder — call this once from your browser after deploy.
 * Protected by a secret key to prevent accidental re-seeding.
 */

import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

const SEED_SECRET = process.env.SEED_SECRET ?? "seed-me-now";

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
      "The mock interview feature is insanely good. The AI asked questions I actually got in my Flipkart round. Finally cracked a PM role at a Series B startup.",
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
      "Startup Job Finder matched me with companies I never found on LinkedIn. Landed at a 30-person seed-stage startup, exactly the culture I wanted.",
  },
  {
    name: "Sneha D.",
    role: "Data Scientist",
    rating: 5,
    category: "general",
    message:
      "Switched careers from academia to tech with this platform. The AI coach understood my background and gave paths I had not considered. Life-changing.",
  },
  {
    name: "Arjun B.",
    role: "SDE-2 at a Y-Combinator startup",
    rating: 5,
    category: "resume",
    message:
      "The cover letter AI is context-aware. Wrote a letter that matched the job description perfectly and felt genuine, not templated at all.",
  },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.feedback.count();
  if (existing > 0) {
    return NextResponse.json({
      message: `Already seeded — ${existing} rows exist.`,
      count: existing,
    });
  }

  const created = [];
  for (const seed of seeds) {
    const row = await db.feedback.create({
      data: { ...seed, approved: true },
    });
    created.push(row.name);
  }

  return NextResponse.json({
    message: "Seeded successfully!",
    created,
  });
}
