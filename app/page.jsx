import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Quote,
  ChevronRight,
  Rocket,
  Linkedin,
  Github,
  Globe,
  Users,
  Building2,
  TrendingUp,
  Zap,
  Target,
  BarChart2,
} from "lucide-react";
import HeroSection from "@/components/hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { features } from "@/data/features";
import { testimonial } from "@/data/testimonial";
import FeedbackSection from "@/components/feedback-section";
import { getPublicFeedback, getFeedbackStats } from "@/actions/feedback";
import { faqs } from "@/data/faqs";
import { howItWorks } from "@/data/howItWorks";

const stats = [
  { value: "50+", label: "Industries Covered" },
  { value: "1K+", label: "Interview Questions" },
  { value: "95%", label: "Success Rate" },
  { value: "24/7", label: "AI Support" },
];

const trustedBy = ["Google", "Microsoft", "Amazon", "Meta", "Netflix", "Stripe"];

// ── Helpers ──
async function fetchFeedbackData() {
  try {
    const [feedbackRows, feedbackStats] = await Promise.all([
      getPublicFeedback({ limit: 50 }),
      getFeedbackStats(),
    ]);
    return { feedbackRows, feedbackStats };
  } catch {
    return { feedbackRows: [], feedbackStats: { total: 0, avgRating: 0 } };
  }
}

const profilePlatforms = [
  {
    id: "linkedin",
    icon: Linkedin,
    name: "LinkedIn",
    tagline: "Optimize your professional presence",
    desc: "Enter your username — AI fetches your profile and rewrites your headline, about section, and keywords for maximum recruiter visibility.",
    color: "from-blue-600/20 to-blue-400/5",
    border: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/40",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    badge: "LinkedIn",
    badgeColor: "bg-blue-500/20 text-blue-300",
  },
  {
    id: "github",
    icon: Github,
    name: "GitHub",
    tagline: "Elevate your developer profile",
    desc: "Enter your GitHub username — we fetch your bio, profile README, and top repos, then AI crafts an optimized developer brand.",
    color: "from-zinc-600/20 to-zinc-400/5",
    border: "border-zinc-500/20",
    hoverBorder: "hover:border-zinc-500/40",
    iconColor: "text-zinc-300",
    iconBg: "bg-zinc-500/10",
    badge: "GitHub",
    badgeColor: "bg-zinc-500/20 text-zinc-300",
  },
  {
    id: "portfolio",
    icon: Globe,
    name: "Portfolio",
    tagline: "Showcase your projects powerfully",
    desc: "Paste your portfolio URL and project links — AI analyzes your live sites and rewrites your presentation for maximum impact.",
    color: "from-violet-600/20 to-violet-400/5",
    border: "border-violet-500/20",
    hoverBorder: "hover:border-violet-500/40",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
    badge: "Portfolio",
    badgeColor: "bg-violet-500/20 text-violet-300",
  },
];

const startupTiers = [
  { emoji: "🟣", label: "Micro", size: "1–10", desc: "Tight-knit teams, huge equity" },
  { emoji: "🔵", label: "Seed", size: "11–50", desc: "Fast-growing, defining culture" },
  { emoji: "🟢", label: "Series A", size: "51–200", desc: "Structured with startup energy" },
  { emoji: "🟡", label: "Series B", size: "201–500", desc: "Scaling rapidly" },
  { emoji: "🟠", label: "Late Stage", size: "500+", desc: "Pre-IPO opportunities" },
];

const startupHighlights = [
  { icon: Target, label: "AI Resume Matching", desc: "Paste your resume — AI finds startups that actually fit you" },
  { icon: Building2, label: "Real, Hiring Startups", desc: "Actively-hiring companies, not stale job boards" },
  { icon: Users, label: "Team Size Filters", desc: "Filter by culture stage — from micro to late-stage" },
  { icon: TrendingUp, label: "Smart Ranking", desc: "Ranked by match score, not just recency" },
];

export default async function LandingPage() {
  const { feedbackRows, feedbackStats } = await fetchFeedbackData();

  return (
    <>
      {/* Background */}
      <div className="grid-background" />

      {/* Hero */}
      <HeroSection />

      {/* Trusted By */}
      <section className="w-full py-10 border-y border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs text-gray-600 uppercase tracking-widest font-medium mb-7">
            Trusted by professionals from
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
            {trustedBy.map((company) => (
              <span
                key={company}
                className="text-gray-600 font-semibold text-lg hover:text-gray-300 transition-colors duration-300 cursor-default"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────────── */}
      <section className="w-full py-20 md:py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Everything You Need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                Accelerate Growth
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Powerful AI tools designed to help you land your dream role faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-6 flex flex-col items-start hover:border-violet-500/40 hover:bg-violet-500/5 transition-all duration-300 cursor-default"
              >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5 group-hover:bg-violet-500/20 transition-colors">
                  <span className="[&>svg]:w-5 [&>svg]:h-5 [&>svg]:text-violet-400">
                    {feature.icon}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">{feature.description}</p>
                <div className="flex items-center gap-1 mt-4 text-violet-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ─────────────────────────────────────── */}
      <section className="w-full py-16 md:py-24 border-y border-white/5 bg-gradient-to-r from-violet-950/30 via-indigo-950/20 to-violet-950/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center justify-center space-y-2 group">
                <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 group-hover:to-violet-400 transition-all duration-500">
                  {stat.value}
                </div>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="w-full py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
              <CheckCircle2 className="w-3 h-3" />
              Process
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Get Started in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                4 Simple Steps
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              From onboarding to offer letter — we guide you every step of the way.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent hidden lg:block" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center space-y-4 relative">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center backdrop-blur-sm">
                      <span className="[&>svg]:w-7 [&>svg]:h-7 [&>svg]:text-violet-400">{item.icon}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-violet-600 border-2 border-background flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-semibold text-white text-lg">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Profile Optimize Section ──────────────────────────── */}
      <section className="w-full py-20 md:py-32 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-600/8 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Section header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium mb-4">
                <Sparkles className="w-3 h-3" />
                Profile Optimization
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
                Make Recruiters{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
                  Find You First
                </span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                AI-powered optimization for LinkedIn, GitHub & Portfolio. Enter your username or URL —
                we fetch your data and rewrite everything for maximum visibility.
              </p>
            </div>
            <Link href="/profile-optimize" className="flex-shrink-0">
              <Button className="group gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/20 hover:scale-105 transition-all duration-300">
                Optimize My Profiles
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Platform cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {profilePlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Link key={platform.id} href={`/profile-optimize/${platform.id}`}>
                  <div
                    className={`group relative h-full rounded-2xl border ${platform.border} bg-gradient-to-br ${platform.color} backdrop-blur-sm p-6 flex flex-col gap-4 ${platform.hoverBorder} transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden`}
                  >
                    {/* Top shine */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <div className="flex items-start justify-between">
                      <div className={`w-11 h-11 rounded-xl ${platform.iconBg} border ${platform.border} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${platform.iconColor}`} />
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${platform.badgeColor}`}>
                        {platform.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-white font-bold text-xl mb-1">{platform.name}</h3>
                      <p className={`text-sm font-medium mb-3 ${platform.iconColor}`}>{platform.tagline}</p>
                      <p className="text-gray-400 text-sm leading-relaxed">{platform.desc}</p>
                    </div>

                    <div className={`flex items-center gap-1.5 mt-auto text-xs font-semibold ${platform.iconColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      Optimize Now
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {[
              "Auto-fetches your data",
              "AI rewrites for ATS",
              "Keyword optimization",
              "Score & suggestions",
              "LinkedIn · GitHub · Portfolio",
            ].map((chip) => (
              <span
                key={chip}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/8 bg-white/[0.03] text-gray-400 text-xs"
              >
                <CheckCircle2 className="w-3 h-3 text-violet-400 flex-shrink-0" />
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Startup Jobs Section ──────────────────────────────── */}
      <section className="w-full py-20 md:py-32 relative overflow-hidden border-t border-white/5">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-950/10 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-pink-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 text-xs font-medium mb-4">
                <Rocket className="w-3 h-3" />
                Startup Jobs
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
                Find Startups That{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400">
                  Actually Match You
                </span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Paste your resume and ideal role. Our AI matches you with{" "}
                <span className="text-white font-medium">real, actively-hiring startups</span> —
                filtered by team size so you target exactly the stage and culture you want.
              </p>
            </div>
            <Link href="/startup-jobs" className="flex-shrink-0">
              <Button className="group gap-2 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 text-white border-0 shadow-lg shadow-pink-500/20 hover:scale-105 transition-all duration-300">
                Find Startup Jobs
                <Rocket className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left: Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {startupHighlights.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="group relative rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-5 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all duration-300"
                  >
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
                      <Icon className="h-4.5 w-4.5 text-pink-400 h-5 w-5" />
                    </div>
                    <h4 className="text-white font-semibold text-sm mb-1.5">{item.label}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Right: Startup tier cards */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-sm p-6 space-y-1">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="w-4 h-4 text-yellow-400" />
                <p className="text-white font-semibold text-sm">Filter by Team Size</p>
              </div>
              {startupTiers.map((tier) => (
                <div
                  key={tier.label}
                  className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-white/5 transition-colors cursor-default"
                >
                  <span className="text-xl flex-shrink-0">{tier.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-semibold">{tier.label}</span>
                      <span className="text-gray-500 text-xs">·</span>
                      <span className="text-gray-400 text-xs">{tier.size} people</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{tier.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              ))}

              <div className="pt-4 mt-2 border-t border-white/5">
                <Link href="/startup-jobs">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-white/10 bg-white/[0.03] hover:bg-white/8 text-gray-300 hover:text-white transition-all"
                  >
                    Browse All Startup Jobs
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-medium mb-4">
              <Quote className="w-3 h-3" />
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Loved by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Thousands of Professionals
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonial.map((t, index) => (
              <div
                key={index}
                className="group relative rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-6 hover:border-yellow-500/20 hover:bg-yellow-500/[0.03] transition-all duration-300"
              >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-gray-300 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 flex-shrink-0">
                    <Image
                      width={40}
                      height={40}
                      src={t.image}
                      alt={t.author}
                      className="rounded-full object-cover border-2 border-violet-500/30 w-10 h-10"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.author}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                    <p className="text-xs text-violet-400 font-medium">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── User Feedback (real-time from DB) ─────────────────── */}
      <FeedbackSection
        initialFeedback={feedbackRows}
        stats={feedbackStats}
      />

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="w-full py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-500/30 bg-gray-500/10 text-gray-400 text-xs font-medium mb-4">
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Frequently Asked{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-500">
                Questions
              </span>
            </h2>
            <p className="text-gray-400">Everything you need to know about our platform.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-white/8 rounded-xl bg-white/[0.03] backdrop-blur-sm px-6 data-[state=open]:border-violet-500/30 data-[state=open]:bg-violet-500/5 transition-all duration-300"
                >
                  <AccordionTrigger className="text-left text-white hover:text-violet-300 hover:no-underline font-medium py-5 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400 leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="w-full py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-fuchsia-600/20 rounded-3xl blur-2xl" />
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/60 via-indigo-950/60 to-violet-950/60 backdrop-blur-xl p-12 md:p-20 text-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 text-violet-300 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Start Free Today
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                Ready to Land Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
                  Dream Role?
                </span>
              </h2>
              <p className="mx-auto max-w-xl text-gray-400 md:text-lg">
                Join thousands of professionals advancing their careers with AI-powered guidance —
                no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link href="/dashboard" passHref>
                  <Button
                    size="lg"
                    className="group px-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-xl shadow-violet-500/30 transition-all duration-300 hover:shadow-violet-500/50 hover:scale-105 text-base"
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/startup-jobs">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group px-8 border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white transition-all duration-300"
                  >
                    <Rocket className="mr-2 h-4 w-4 text-pink-400" />
                    Browse Startup Jobs
                  </Button>
                </Link>
              </div>
              <p className="text-gray-500 text-sm">
                Free plan available · No credit card needed · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
