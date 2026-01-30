import { NextResponse } from "next/server";
import { analyzeResume } from "@/actions/ats-score";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const data = await analyzeResume(formData);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err?.message || "Failed to analyze resume.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
