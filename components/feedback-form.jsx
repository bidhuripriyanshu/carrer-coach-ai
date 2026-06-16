"use client";

import React, { useState, useTransition } from "react";
import { submitFeedback } from "@/actions/feedback";
import {
  Star,
  Send,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react";

const CATEGORIES = [
  { value: "general", label: "General Experience" },
  { value: "resume", label: "Resume Builder" },
  { value: "interview", label: "Interview Prep" },
  { value: "startup-jobs", label: "Startup Jobs" },
  { value: "profile-optimize", label: "Profile Optimizer" },
];

export default function FeedbackForm({ onSuccess }) {
  const [isPending, startTransition] = useTransition();
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    role: "",
    rating: 0,
    category: "",
    message: "",
  });

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    startTransition(async () => {
      const res = await submitFeedback({ ...form, rating: Number(form.rating) });
      if (!res.success) {
        setErrors(res.errors ?? {});
        return;
      }
      setSubmitted(true);
      onSuccess?.();
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-white font-bold text-xl">Thank you! 🎉</h3>
        <p className="text-gray-400 text-sm max-w-xs">
          Your feedback has been submitted and will appear on the page shortly.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({ name: "", role: "", rating: 0, category: "", message: "" });
          }}
          className="text-violet-400 text-sm hover:text-violet-300 transition-colors mt-2"
        >
          Leave another review →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name + Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Your Name <span className="text-violet-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Jane Doe"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-gray-600 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"
          />
          {errors.name && <p className="text-red-400 text-xs">{errors.name[0]}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Role / Company <span className="text-gray-600">(optional)</span>
          </label>
          <input
            type="text"
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            placeholder="SWE at Google"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-gray-600 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Feature <span className="text-violet-400">*</span>
        </label>
        <div className="relative">
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all cursor-pointer"
          >
            <option value="" className="bg-zinc-900 text-gray-400">
              Select a feature…
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-zinc-900">
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
        {errors.category && <p className="text-red-400 text-xs">{errors.category[0]}</p>}
      </div>

      {/* Star Rating */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Rating <span className="text-violet-400">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => set("rating", star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= (hover || form.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-600"
                }`}
              />
            </button>
          ))}
          {form.rating > 0 && (
            <span className="text-xs text-gray-400 ml-1">
              {["", "Poor", "Fair", "Good", "Great", "Excellent!"][form.rating]}
            </span>
          )}
        </div>
        {errors.rating && <p className="text-red-400 text-xs">{errors.rating[0]}</p>}
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Your Feedback <span className="text-violet-400">*</span>
        </label>
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Tell us how we helped your career journey…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all resize-none"
        />
        <div className="flex justify-between items-center">
          {errors.message ? (
            <p className="text-red-400 text-xs">{errors.message[0]}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-600">{form.message.length}/1000</span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.01] transition-all duration-200"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Feedback
          </>
        )}
      </button>
    </form>
  );
}
