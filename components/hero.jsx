"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Users, Star } from "lucide-react";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative w-full pt-32 md:pt-44 pb-20 overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8 text-center px-4">
        {/* Floating badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium backdrop-blur-sm animate-pulse-slow mx-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by Advanced AI Technology</span>
        </div>

        {/* Headline */}
        <div className="space-y-4 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-400">
              Your AI Career Coach
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
              for Professional Success
            </span>
          </h1>
          <p className="mx-auto max-w-[640px] text-gray-400 md:text-xl leading-relaxed">
            Advance your career with personalized AI guidance, interview prep,
            ATS-optimized resumes, and real-time industry insights.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="group px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="">
            <Button
              size="lg"
              variant="outline"
              className="px-8 border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white transition-all duration-300 hover:scale-105"
            >
              Watch Demo
            </Button>
          </Link>
        </div>

        {/* Social Proof Pills */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-sm">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="font-semibold text-white">4.9/5</span>
            <span>rating</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-sm">
            <Users className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-semibold text-white">10K+</span>
            <span>users</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-sm">
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            <span className="font-semibold text-white">95%</span>
            <span>success rate</span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="hero-image-wrapper mt-12 md:mt-16 max-w-5xl mx-auto">
          {/* Glow frame */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-violet-600/20 to-transparent pointer-events-none z-10" />
          <div ref={imageRef} className="hero-image">
            <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 ring-1 ring-violet-500/20">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 pointer-events-none" />
              <Image
                src="/banner.jpeg"
                width={1280}
                height={720}
                alt="Dashboard Preview"
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;