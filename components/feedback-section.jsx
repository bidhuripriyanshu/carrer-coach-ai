"use client";

import React, { useState, useTransition } from "react";
import {
  Star,
  MessageSquarePlus,
  X,
  TrendingUp,
  Users,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import FeedbackForm from "./feedback-form";

const CATEGORY_LABELS = {
  general: "General",
  resume: "Resume",
  interview: "Interview",
  "startup-jobs": "Startup Jobs",
  "profile-optimize": "Profile",
};

const CATEGORY_COLORS = {
  general: "text-gray-400 bg-gray-500/15 border-gray-500/20",
  resume: "text-blue-400 bg-blue-500/15 border-blue-500/20",
  interview: "text-yellow-400 bg-yellow-500/15 border-yellow-500/20",
  "startup-jobs": "text-pink-400 bg-pink-500/15 border-pink-500/20",
  "profile-optimize": "text-violet-400 bg-violet-500/15 border-violet-500/20",
};

function StarRow({ rating, size = "sm" }) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${
            s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"
          }`}
        />
      ))}
    </div>
  );
}

function FeedbackCard({ item }) {
  const initials = item.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const catClass =
    CATEGORY_COLORS[item.category] ?? "text-gray-400 bg-gray-500/15 border-gray-500/20";

  return (
    <div className="group relative rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-5 flex flex-col gap-4 hover:border-violet-500/20 hover:bg-violet-500/[0.03] transition-all duration-300">
      {/* Top accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600/60 to-indigo-600/60 border border-violet-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{item.name}</p>
          {item.role && (
            <p className="text-gray-500 text-xs truncate">{item.role}</p>
          )}
        </div>
        {/* Category badge */}
        <span
          className={`flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catClass}`}
        >
          {CATEGORY_LABELS[item.category] ?? item.category}
        </span>
      </div>

      {/* Stars */}
      <StarRow rating={item.rating} />

      {/* Message */}
      <p className="text-gray-300 text-sm leading-relaxed flex-1 line-clamp-4">
        &ldquo;{item.message}&rdquo;
      </p>

      {/* Date */}
      <p className="text-gray-600 text-xs">
        {new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>
  );
}

export default function FeedbackSection({ initialFeedback, stats }) {
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [page, setPage] = useState(0);
  const [, startTransition] = useTransition();

  const PER_PAGE = 6;
  const totalPages = Math.ceil(feedback.length / PER_PAGE);
  const visible = feedback.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  function handleSuccess() {
    setShowForm(false);
    // Reload the page to pick up new row via server revalidation
    startTransition(() => window.location.reload());
  }

  return (
    <section className="w-full py-20 md:py-32 relative overflow-hidden border-t border-white/5">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* ── Section header ─────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium mb-4">
              <MessageSquarePlus className="w-3 h-3" />
              User Feedback
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
              Real Reviews from{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                Real Users
              </span>
            </h2>
            <p className="text-gray-400">
              Live feedback submitted directly by our community — no filters, no fakes.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-4 flex-wrap">
            {/* Avg rating */}
            <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm min-w-[90px]">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-extrabold text-white">
                  {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}
                </span>
              </div>
              <span className="text-gray-500 text-xs">Avg Rating</span>
            </div>
            {/* Total */}
            <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm min-w-[90px]">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-violet-400" />
                <span className="text-2xl font-extrabold text-white">{stats.total}</span>
              </div>
              <span className="text-gray-500 text-xs">Reviews</span>
            </div>
            {/* 5-star pct */}
            {stats.total > 0 && (
              <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm min-w-[90px]">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-green-400" />
                  <span className="text-2xl font-extrabold text-white">
                    {stats.avgRating >= 4 ? "Top" : "Rated"}
                  </span>
                </div>
                <span className="text-gray-500 text-xs">Rated</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Review grid ─────────────────────────────────────── */}
        {feedback.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {visible.map((item) => (
                <FeedbackCard key={item.id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mb-10">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-gray-400 hover:text-white hover:border-violet-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === page
                        ? "bg-violet-500 scale-125"
                        : "bg-gray-700 hover:bg-gray-500"
                    }`}
                  />
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-gray-400 hover:text-white hover:border-violet-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <MessageSquarePlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No feedback yet — be the first to share your experience!</p>
          </div>
        )}

        {/* ── Write a review ──────────────────────────────────── */}
        <div className="max-w-2xl mx-auto">
          {!showForm ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-gray-400 text-sm">Used our platform? We&apos;d love to hear from you.</p>
              <button
                onClick={() => setShowForm(true)}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-white font-semibold text-sm transition-all duration-200 hover:scale-105"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Write a Review
              </button>
            </div>
          ) : (
            <div className="relative rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 to-indigo-950/40 backdrop-blur-xl p-6 md:p-8">
              {/* Top shine */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent rounded-t-2xl" />

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-bold text-xl">Leave a Review</h3>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Your feedback helps thousands of job seekers
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.05] flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <FeedbackForm onSuccess={handleSuccess} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
