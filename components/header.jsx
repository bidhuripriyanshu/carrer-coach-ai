
import React from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon,
  BarChart2,
  Sparkles,
  Rocket,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { checkUser } from "@/lib/checkUser";

const navTools = [
  {
    href: "/resume",
    icon: FileText,
    label: "Build Resume",
    desc: "ATS-optimized in minutes",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    href: "/ai-cover-letter",
    icon: PenBox,
    label: "Cover Letter",
    desc: "AI-crafted for every role",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    href: "/interview",
    icon: GraduationCap,
    label: "Interview Prep",
    desc: "Role-specific mock sessions",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    href: "/ats-score",
    icon: BarChart2,
    label: "ATS Score",
    desc: "Rank before you apply",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    href: "/profile-optimize",
    icon: Sparkles,
    label: "Profile Optimize",
    desc: "LinkedIn, GitHub & Portfolio",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    href: "/startup-jobs",
    icon: Rocket,
    label: "Startup Jobs",
    desc: "Find actively-hiring startups",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
];

export default async function Header() {
  await checkUser();
  return (
    <header className="fixed top-0 w-full z-50">
      {/* Glass bar */}
      <div className="border-b border-white/8 bg-black/60 backdrop-blur-xl supports-[backdrop-filter]:bg-black/40">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Career Coach AI"
              width={200}
              height={60}
              className="h-11 py-1 w-auto object-contain"
            />
          </Link>

          {/* Center nav pills (desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            <SignedIn>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 outline-none">
                    <Zap className="h-3.5 w-3.5 text-violet-400" />
                    Tools
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  sideOffset={8}
                  className="w-72 p-2 bg-black/90 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 px-2 pb-2">
                    AI-Powered Tools
                  </p>
                  {navTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <DropdownMenuItem key={tool.href} asChild>
                        <Link
                          href={tool.href}
                          className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                        >
                          <div className={`w-8 h-8 rounded-lg ${tool.bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-4 w-4 ${tool.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white group-hover:text-white">
                              {tool.label}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{tool.desc}</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <SignedIn>
              {/* Mobile tools dropdown */}
              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-gray-300 border border-white/10 bg-white/5">
                      <StarsIcon className="h-4 w-4 text-violet-400" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 p-2 bg-black/90 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl"
                  >
                    <Link href="/dashboard">
                      <DropdownMenuItem className="flex items-center gap-2 rounded-xl cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator className="my-1 bg-white/8" />
                    {navTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <DropdownMenuItem key={tool.href} asChild>
                          <Link href={tool.href} className="flex items-center gap-2 rounded-xl cursor-pointer">
                            <Icon className={`h-4 w-4 ${tool.color}`} />
                            <span className="text-sm">{tool.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Dashboard link (desktop) */}
              <Link href="/dashboard" className="hidden lg:block">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/30 hover:scale-105 text-xs px-4"
                >
                  Dashboard
                </Button>
              </Link>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 ring-2 ring-violet-500/30 ring-offset-2 ring-offset-black",
                    userButtonPopoverCard: "shadow-xl bg-black border border-white/10",
                    userPreviewMainIdentifier: "font-semibold text-white",
                  },
                }}
                afterSignOutUrl="/"
              />
            </SignedIn>

            <SignedOut>
              <SignInButton>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white backdrop-blur-sm transition-all"
                >
                  Sign In
                </Button>
              </SignInButton>
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/20"
                >
                  Get Started
                </Button>
              </Link>
            </SignedOut>
          </div>
        </nav>
      </div>
    </header>
  );
}