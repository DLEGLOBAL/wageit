import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap, Shield, Trophy, Brain, Users, Lock, TrendingUp, CheckCircle2,
  Star, Target, Sparkles, ArrowRight, DollarSign, Clock, Video,
  BadgeCheck, AlertTriangle, Scale, Flame, Crown, Gamepad2
} from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u) navigate(createPageUrl("Home"));
    }).catch(() => {});
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000" />
          <div className="absolute w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-6 text-xs px-4 py-1">
              <Sparkles className="w-3 h-3 mr-1" /> Powered by Roccstar.AI
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Challenge Anyone.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-purple-400">
                Win Big.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--text-muted)] mb-8 max-w-2xl mx-auto leading-relaxed">
              The world's most advanced peer-to-peer challenge platform. Create skill-based wagers, compete with AI-powered matchmaking, and earn your reputation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
                className="h-14 px-8 bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl text-lg font-bold"
              >
                Start Challenging <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => scrollToSection("how-it-works")}
                className="h-14 px-8 border-[var(--border)] text-white hover:bg-[var(--surface)] rounded-xl text-lg font-bold"
              >
                How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <p className="text-3xl font-black text-[var(--accent)] mb-1">24/7</p>
                <p className="text-xs text-[var(--text-muted)]">Live Challenges</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-[var(--accent)] mb-1">$1M+</p>
                <p className="text-xs text-[var(--text-muted)]">Total Wagered</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-[var(--accent)] mb-1">98%</p>
                <p className="text-xs text-[var(--text-muted)]">Fair Dispute Rate</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-[var(--border)] rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-[var(--accent)] rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-[var(--surface)]/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-4">
              Platform Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything You Need to Compete
            </h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
              Built with cutting-edge technology and AI to ensure fair, transparent, and exciting competitions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI-Powered Matchmaking",
                desc: "Smart algorithms find your perfect opponent based on skill level, history, and reputation",
                color: "purple"
              },
              {
                icon: Shield,
                title: "Secure Escrow System",
                desc: "Funds locked in secure escrow until challenge completion. Your money is always protected",
                color: "green"
              },
              {
                icon: Scale,
                title: "AI Dispute Resolution",
                desc: "Impartial AI assistant analyzes evidence and provides fair recommendations for disputes",
                color: "blue"
              },
              {
                icon: Sparkles,
                title: "Smart Suggestions",
                desc: "AI generates personalized wager ideas based on your interests and performance history",
                color: "yellow"
              },
              {
                icon: Video,
                title: "Proof Verification",
                desc: "AI-powered proof validation ensures submitted evidence meets challenge requirements",
                color: "red"
              },
              {
                icon: BadgeCheck,
                title: "Identity Verification",
                desc: "KYC verification system ensures all users are legitimate and over 18 years old",
                color: "cyan"
              },
              {
                icon: TrendingUp,
                title: "Live Leaderboards",
                desc: "Compete for top rankings. Track your performance against the best challengers",
                color: "orange"
              },
              {
                icon: DollarSign,
                title: "Instant Payouts",
                desc: "Win and get paid instantly via Stripe. Withdraw your earnings anytime",
                color: "green"
              },
              {
                icon: AlertTriangle,
                title: "Fraud Detection",
                desc: "AI monitors suspicious patterns and protects the community from bad actors",
                color: "red"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--accent)]/30 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/30 mb-4">
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              How WageIt Works
            </h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
              From challenge creation to payout in 4 easy steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: Target,
                title: "Create a Challenge",
                desc: "Set your terms, stake amount, and proof requirements. Choose skill-based, event outcome, or time challenge types"
              },
              {
                step: "02",
                icon: Users,
                title: "Find Your Opponent",
                desc: "Challenge a specific person or let AI matchmaking find the perfect competitor for you"
              },
              {
                step: "03",
                icon: Lock,
                title: "Fund Escrow",
                desc: "Both parties deposit funds into secure escrow. Challenge activates when fully funded"
              },
              {
                step: "04",
                icon: Trophy,
                title: "Compete & Win",
                desc: "Complete the challenge, submit proof, and the winner receives the full pot minus platform fee"
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 text-center">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-black text-xs font-black">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-4 mt-2">
                    <step.icon className="w-8 h-8 text-[var(--accent)]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge Types */}
      <section className="py-20 px-4 bg-[var(--surface)]/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">
              Challenge Categories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Every Type of Competition
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                type: "Skill-Based",
                examples: ["Gaming tournaments", "Chess matches", "Cooking competitions", "Fitness challenges", "Creative contests"],
                color: "from-purple-500/20 to-purple-600/20",
                border: "border-purple-500/30"
              },
              {
                icon: Trophy,
                type: "Event Outcome",
                examples: ["Sports predictions", "Award show winners", "Stock market movements", "Political outcomes", "Box office results"],
                color: "from-blue-500/20 to-blue-600/20",
                border: "border-blue-500/30"
              },
              {
                icon: Clock,
                type: "Time Challenge",
                examples: ["Run a 5K under time", "Complete a project by deadline", "Learning challenges", "Habit formation", "Speed competitions"],
                color: "from-orange-500/20 to-orange-600/20",
                border: "border-orange-500/30"
              }
            ].map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-gradient-to-br ${cat.color} border ${cat.border} rounded-2xl p-6`}
              >
                <cat.icon className="w-10 h-10 text-white mb-4" />
                <h3 className="text-xl font-bold mb-4">{cat.type}</h3>
                <ul className="space-y-2">
                  {cat.examples.map((ex, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-4">
              For Everyone
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Who's WageIt For?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Gamepad2,
                title: "Competitive Gamers",
                desc: "Put your skills on the line. Challenge rivals in your favorite games and prove your dominance",
                color: "purple"
              },
              {
                icon: TrendingUp,
                title: "Sports Enthusiasts",
                desc: "Predict outcomes, challenge friends on game results, and showcase your sports knowledge",
                color: "blue"
              },
              {
                icon: Target,
                title: "Fitness Fanatics",
                desc: "Set performance goals, challenge workout partners, and stay motivated with real stakes",
                color: "green"
              },
              {
                icon: Star,
                title: "Content Creators",
                desc: "Challenge other creators to creative contests, viral challenges, and growth competitions",
                color: "yellow"
              },
              {
                icon: Crown,
                title: "High Achievers",
                desc: "Anyone who loves competition and wants to put their skills to the test with real rewards",
                color: "orange"
              },
              {
                icon: Users,
                title: "Friend Groups",
                desc: "Settle friendly debates, create custom challenges, and add excitement to your social circle",
                color: "cyan"
              }
            ].map((persona, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex gap-4 hover:border-[var(--accent)]/30 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl bg-${persona.color}-500/10 flex items-center justify-center shrink-0`}>
                  <persona.icon className={`w-7 h-7 text-${persona.color}-400`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{persona.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{persona.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-20 px-4 bg-[var(--surface)]/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Shield className="w-16 h-16 text-[var(--accent)] mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Your Safety is Our Priority
            </h2>
            <p className="text-lg text-[var(--text-muted)] mb-12 max-w-2xl mx-auto">
              We've built WageIt with enterprise-grade security, AI-powered fraud detection, and comprehensive compliance to ensure every challenge is fair and transparent
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-12">
              {[
                { icon: Lock, text: "Bank-level encryption" },
                { icon: BadgeCheck, text: "ID verification required" },
                { icon: Shield, text: "Secure escrow system" },
                { icon: AlertTriangle, text: "AI fraud monitoring" },
                { icon: Scale, text: "Fair dispute system" },
                { icon: CheckCircle2, text: "18+ age verification" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                  <item.icon className="w-5 h-5 text-[var(--accent)]" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6">
              <p className="text-sm text-yellow-200 leading-relaxed">
                <strong>Legal Compliance:</strong> WageIt operates as a skill-based challenge platform in compliance with applicable regulations. Users must be 18+ and verify their identity. Geo-restrictions apply in certain jurisdictions. Always wager responsibly.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-br from-[var(--accent)]/10 via-purple-500/10 to-blue-500/10 border border-[var(--accent)]/30 rounded-3xl p-12">
              <Flame className="w-16 h-16 text-[var(--accent)] mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Ready to Compete?
              </h2>
              <p className="text-lg text-[var(--text-muted)] mb-8 max-w-2xl mx-auto">
                Join thousands of challengers already competing for real stakes. Create your first wager in minutes.
              </p>
              <Button
                onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
                className="h-16 px-12 bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl text-xl font-black"
              >
                Get Started Now <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              <p className="text-xs text-[var(--text-muted)] mt-4">
                Free to join • No credit card required
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-black" />
                </div>
                <span className="text-lg font-black">WageIt</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                The world's most advanced peer-to-peer challenge platform
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li><button onClick={() => scrollToSection("how-it-works")}>How It Works</button></li>
                <li>Challenge Types</li>
                <li>Leaderboard</li>
                <li>AI Features</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li><a href={createPageUrl("Terms")}>Terms of Service</a></li>
                <li>Privacy Policy</li>
                <li>Responsible Wagering</li>
                <li>Compliance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li>About Us</li>
                <li>Contact</li>
                <li>Support</li>
                <li>Careers</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--text-muted)]">
              © 2026 WageIt. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Powered by</span>
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Roccstar.AI
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}