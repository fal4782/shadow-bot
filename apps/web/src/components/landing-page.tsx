"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { Video, FileText, Sparkles, ArrowRight, Play, Mic } from "lucide-react";
import { RiGithubFill, RiSearchLine } from "react-icons/ri";

import Link from "next/link";
import { useRef, useState } from "react";
import { GoHeartFill } from "react-icons/go";

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [navScrolled, setNavScrolled] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const springConfig = { stiffness: 50, damping: 20, mass: 0.5 };
  const heroY = useSpring(
    useTransform(scrollYProgress, [0, 0.3], [0, -120]),
    springConfig,
  );
  const heroOpacity = useSpring(
    useTransform(scrollYProgress, [0, 0.25], [1, 0]),
    springConfig,
  );
  const heroScale = useSpring(
    useTransform(scrollYProgress, [0, 0.25], [1, 0.95]),
    springConfig,
  );

  // Track scroll to add background to navbar
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setNavScrolled(latest > 0.02);
  });

  const features = [
    {
      icon: Video,
      title: "Auto-Record Meetings",
      description:
        "Shadow Bot silently joins your meetings, captures every word and visual, so you never have to take notes again.",
      accent: "from-blue-500/10 to-violet-500/10",
    },
    {
      icon: FileText,
      title: "Instant Transcriptions",
      description:
        "Get accurate, time-stamped transcripts seconds after your meeting ends. Search, copy, and share with ease.",
      accent: "from-emerald-500/10 to-teal-500/10",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Summaries",
      description:
        "Our AI distills key insights, action items, and decisions from hours of conversation into digestible briefs.",
      accent: "from-amber-500/10 to-orange-500/10",
    },
    {
      icon: RiSearchLine,
      title: "Intelligent Search",
      description:
        "Ask natural language questions about any meeting. Get instant answers grounded in your actual conversation data.",
      accent: "from-rose-500/10 to-pink-500/10",
    },
  ];

  const stats = [
    { value: "100%", label: "Open Source" },
    { value: "<2s", label: "Transcript Speed" },
    { value: "∞", label: "Meetings Recorded" },
  ];

  return (
    <div
      ref={containerRef}
      className="bg-secondary-100 text-text-900 font-sans selection:bg-accent-500/20 overflow-x-hidden"
    >
      {/* ─── Premium Floating Navbar ─── */}
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div
          className={`mx-auto max-w-6xl transition-all duration-500 ease-out ${
            navScrolled ? "mt-4 mx-4 sm:mx-6 lg:mx-auto" : "mt-0 mx-0"
          }`}
        >
          <div
            className={`flex items-center justify-between transition-all duration-500 ease-out ${
              navScrolled
                ? "bg-white/75 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] px-6 py-3"
                : "bg-transparent px-6 sm:px-12 lg:px-16 py-6"
            }`}
          >
            {/* Brand — Serif Wordmark */}
            <Link href="/" className="flex items-center gap-1.5 group">
              <span
                className="text-[22px] tracking-tight text-text-900 group-hover:opacity-70 transition-opacity"
                style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
              >
                Shadow
              </span>
              <span className="text-[22px] font-semibold tracking-tight text-text-400">
                Bot
              </span>
            </Link>

            {/* Center Nav Links */}
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              <a
                href="#features"
                className="px-4 py-2 text-[13px] font-medium text-text-500 hover:text-text-900 rounded-full hover:bg-text-100/60 transition-all duration-200"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="px-4 py-2 text-[13px] font-medium text-text-500 hover:text-text-900 rounded-full hover:bg-text-100/60 transition-all duration-200"
              >
                How it works
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 text-[13px] font-medium text-text-500 hover:text-text-900 rounded-full hover:bg-text-100/60 transition-all duration-200 flex items-center gap-1.5"
              >
                <RiGithubFill className="w-3.5 h-3.5" />
                GitHub
              </a>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex text-[13px] font-medium text-text-600 hover:text-text-900 transition-colors px-4 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="bg-text-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:bg-text-800 active:scale-[0.97] transition-all shadow-sm hover:shadow-md"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero Section ─── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-24 relative">
        {/* Ambient Gradient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.25, 0.35, 0.25],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-[55%] bg-linear-to-br from-accent-200/30 via-blue-200/25 to-violet-200/20 rounded-full blur-[140px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-[5%] left-[15%] w-[45%] h-[35%] bg-linear-to-tr from-violet-200/20 to-blue-200/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
            className="absolute top-[30%] right-[5%] w-[30%] h-[25%] bg-linear-to-bl from-orange-200/15 to-amber-200/10 rounded-full blur-[100px]"
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="text-center max-w-5xl space-y-10 relative z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: 0.2,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/70 backdrop-blur-md rounded-full border border-text-200/50 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[13px] font-medium text-text-600">
                Open Source & Free Forever
              </span>
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: 0.4,
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-[clamp(2.5rem,6vw,5rem)] tracking-tight text-text-900 leading-[1.08]"
            style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
          >
            Your meetings,
            <br />
            <span className="relative">
              <span className="text-accent-600">remembered</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 1.2,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute -bottom-2 left-0 right-0 h-[3px] bg-accent-400/30 rounded-full origin-left"
              />
            </span>{" "}
            perfectly
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 25, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: 0.6,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-lg md:text-xl text-text-500 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            An AI companion that silently joins your meetings, records every
            moment, and turns conversations into transcripts, summaries, and
            searchable insights.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 25, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: 0.8,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              href="/login"
              className="group bg-text-900 text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-text-800 active:scale-[0.97] transition-all shadow-lg shadow-text-900/10 flex items-center gap-2.5"
            >
              Start Recording Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-base text-text-700 bg-white/80 backdrop-blur-sm border border-text-200/70 hover:border-text-300 hover:shadow-lg hover:shadow-text-900/5 transition-all duration-200"
            >
              <RiGithubFill className="w-5 h-5" />
              View on GitHub
            </a>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-10 sm:gap-16 pt-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="text-2xl sm:text-3xl text-text-900 tracking-tight"
                  style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-text-400 font-medium uppercase tracking-widest mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── How It Works (Visual Process) ─── */}
      <section id="how-it-works" className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-2xl mx-auto mb-20"
          >
            <p className="text-sm font-semibold text-accent-600 uppercase tracking-widest mb-4">
              How it works
            </p>
            <h2
              className="text-4xl md:text-5xl text-text-900 tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
            >
              Three steps to perfect recall
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Play,
                title: "Paste your meeting link",
                description:
                  "Just drop your Google Meet link and hit join. Shadow Bot handles the rest.",
                color: "text-blue-500",
                bg: "bg-blue-50",
              },
              {
                step: "02",
                icon: Mic,
                title: "We record & transcribe",
                description:
                  "AI captures audio, generates transcripts, and creates structured summaries in real-time.",
                color: "text-violet-500",
                bg: "bg-violet-50",
              },
              {
                step: "03",
                icon: Sparkles,
                title: "Chat with your meetings",
                description:
                  "Ask questions, get action items, search across all your meetings with natural language.",
                color: "text-amber-500",
                bg: "bg-amber-50",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: index * 0.15,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative"
              >
                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[calc(100%+1rem)] w-[calc(100%-2rem)] h-px bg-text-200/60 -translate-x-1/2" />
                )}

                <div className="text-center space-y-5">
                  <div
                    className={`w-20 h-20 rounded-3xl ${item.bg} ${item.color} flex items-center justify-center mx-auto shadow-sm border border-white`}
                  >
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-text-300 uppercase tracking-[0.2em]">
                      Step {item.step}
                    </span>
                    <h3 className="text-xl font-bold text-text-900 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-500 leading-relaxed max-w-xs mx-auto">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="py-32 px-6 relative">
        {/* Subtle bg glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] max-w-3xl h-[50%] bg-linear-to-br from-accent-100/15 via-transparent to-violet-100/10 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-2xl mx-auto mb-20"
          >
            <p className="text-sm font-semibold text-accent-600 uppercase tracking-widest mb-4">
              Features
            </p>
            <h2
              className="text-4xl md:text-5xl text-text-900 tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
            >
              Everything you need to capture meetings
            </h2>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative"
              >
                {/* Hover glow */}
                <div
                  className={`absolute -inset-px bg-linear-to-br ${feature.accent} rounded-[28px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-text-200/50 hover:border-text-300/60 hover:shadow-xl hover:shadow-text-900/5 transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-secondary-200 flex items-center justify-center mb-6 group-hover:bg-accent-50 group-hover:text-accent-600 text-text-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text-900 mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-text-500 leading-relaxed text-[15px]">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] max-w-2xl h-[60%] bg-linear-to-br from-accent-100/20 via-blue-100/10 to-violet-100/15 rounded-full blur-[140px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2
            className="text-4xl md:text-5xl text-text-900 tracking-tight leading-tight mb-6"
            style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
          >
            Ready to let your meetings work for you?
          </h2>
          <p className="text-lg text-text-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Join thousands of teams who never miss an action item, decision, or
            key insight.
          </p>
          <Link
            href="/login"
            className="group inline-flex items-center gap-2.5 bg-text-900 text-white px-10 py-4 rounded-full font-semibold text-base hover:bg-text-800 active:scale-[0.97] transition-all shadow-lg shadow-text-900/10"
          >
            Get Started — It&apos;s Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-12 px-6 border-t border-text-200/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-1.5">
            <span
              className="text-lg tracking-tight text-text-800"
              style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
            >
              Shadow
            </span>
            <span className="text-lg font-semibold tracking-tight text-text-400">
              Bot
            </span>
          </div>
          <p className="text-sm text-text-400 flex items-center gap-1.5">
            Made with <GoHeartFill className="w-3.5 h-3.5 text-red-400" /> for
            better meetings
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-text-400 hover:text-text-700 transition-colors flex items-center gap-1.5"
          >
            <RiGithubFill className="w-4 h-4" />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
