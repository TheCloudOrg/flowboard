'use client';

import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  Sparkles,
  Zap,
  Lock,
  Code2,
  Users,
  ArrowRight,
  CheckCircle,
  Copy,
  Brain,
  Rocket,
  Terminal,
  Layers,
  MessageSquare,
  X,
  Github,
} from 'lucide-react';

// Floating orb component for background effects
function FloatingOrb({ delay = 0, duration = 20, left = '10%', top = '20%' }: any) {
  return (
    <motion.div
      className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
      style={{
        left,
        top,
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
      }}
      animate={{
        x: [0, 100, 0],
        y: [0, -100, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

// 3D Card component with tilt effect
function Card3D({ children, className = '' }: any) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

// Animated section wrapper
function AnimatedSection({ children, className = '' }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleProgress = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const opacityProgress = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const springScale = useSpring(scaleProgress, { stiffness: 100, damping: 30 });

  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const samplePrompt = `Create a user authentication system with the following requirements:

1. Implement email/password authentication
2. Add OAuth support for Google and GitHub
3. Include password reset functionality
4. Set up JWT token management
5. Create user profile management
6. Add two-factor authentication (2FA)

Tech Stack: Next.js, TypeScript, Clerk Auth, Supabase

Expected Deliverables:
- Auth pages (sign-in, sign-up)
- Protected routes middleware
- User profile component
- Session management
- Security best practices implemented`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(samplePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const features = [
    {
      icon: Brain,
      title: 'AI Prompt Generation',
      description:
        'Transform any task into a detailed, AI-ready prompt optimized for Claude Code, Cursor, and GitHub Copilot.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Sparkles,
      title: 'Beautiful Glassmorphic UI',
      description:
        'A stunning interface with smooth 60fps animations that developers actually enjoy using every day.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description:
        'Organization workspaces with real-time updates. Built for teams that ship fast.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with Next.js 14, TypeScript, and Supabase. Instant load times, zero lag.',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Lock,
      title: 'Secure & Reliable',
      description:
        'Clerk authentication with OAuth. Supabase backend with Row-Level Security. Your data is safe.',
      gradient: 'from-red-500 to-pink-500',
    },
    {
      icon: Code2,
      title: 'Developer-First',
      description:
        'Keyboard shortcuts, dark mode, GitHub integration. Built by developers, for developers.',
      gradient: 'from-indigo-500 to-purple-500',
    },
  ];

  const useCases = [
    {
      icon: Terminal,
      title: 'Solo Developers',
      description:
        'Track features, generate AI prompts, and build faster with your AI coding assistant.',
      columns: 'Backlog → In Progress → Review → Done',
    },
    {
      icon: Rocket,
      title: 'Startup Teams',
      description:
        'Collaborate on roadmaps, convert specs into AI-ready tasks, and ship features at speed.',
      columns: 'Ideas → Planning → Building → Launched',
    },
    {
      icon: Layers,
      title: 'Dev Teams',
      description:
        'Agile workflows with AI. Share AI-generated specs and maintain consistent prompt quality.',
      columns: 'Sprint Planning → Development → QA → Production',
    },
    {
      icon: MessageSquare,
      title: 'Students',
      description:
        'Organize coding projects, generate learning prompts, and understand implementation paths.',
      columns: 'To Learn → Practicing → Building → Completed',
    },
  ];

  const comparisonData = [
    { feature: 'AI Prompt Generation', ours: true, trello: false, linear: false, asana: false },
    { feature: 'Beautiful Modern UI', ours: true, trello: false, linear: true, asana: false },
    { feature: 'Team Collaboration', ours: true, trello: true, linear: true, asana: true },
    { feature: 'Kanban Boards', ours: true, trello: true, linear: true, asana: true },
    { feature: 'Developer-First', ours: true, trello: false, linear: true, asana: false },
    { feature: 'Starting Price', ours: 'Free', trello: '$5/mo', linear: '$8/mo', asana: '$11/mo' },
  ];

  const techStack = [
    { icon: '⚛️', label: 'Next.js 14', color: 'from-blue-400 to-cyan-400' },
    { icon: '📘', label: 'TypeScript', color: 'from-blue-500 to-indigo-500' },
    { icon: '🎨', label: 'Tailwind CSS', color: 'from-cyan-400 to-blue-500' },
    { icon: '🗄️', label: 'Supabase', color: 'from-green-400 to-emerald-500' },
    { icon: '🔐', label: 'Clerk Auth', color: 'from-purple-400 to-pink-400' },
    { icon: '🤖', label: 'OpenAI API', color: 'from-green-500 to-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden relative">
      {/* Floating orbs for depth */}
      <FloatingOrb left="5%" top="10%" duration={25} />
      <FloatingOrb left="80%" top="30%" duration={30} delay={5} />
      <FloatingOrb left="50%" top="60%" duration={20} delay={10} />
      <FloatingOrb left="20%" top="80%" duration={35} delay={15} />

      {/* Grid overlay */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-20 pointer-events-none" />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/50 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Flow Board
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com"
              target="_blank"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href="/sign-in"
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-medium transition-all transform hover:scale-105"
            >
              Start Free
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            style={{ scale: springScale, opacity: opacityProgress }}
            className="text-center relative z-10"
          >
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-purple-500/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Built for the AI coding era</span>
            </motion.div>

            {/* Main headline with 3D effect */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
              style={{
                textShadow: '0 0 80px rgba(139, 92, 246, 0.5)',
              }}
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Turn project ideas
                <br />
                into AI-ready prompts
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              The project management tool for developers using AI assistants.
              <br />
              <span className="text-purple-400 font-semibold">
                Organize work, then transform any task into detailed prompts for Claude Code.
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Link
                href="/sign-up"
                className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-purple-500/50"
              >
                Start Building with AI
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#demo"
                className="px-8 py-4 glass-effect border border-white/10 hover:border-purple-400/50 rounded-xl font-semibold text-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                See AI in Action
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-8 text-sm text-gray-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                OAuth with GitHub & Google
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Team collaboration ready
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Open source
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Free to start
              </div>
            </motion.div>
          </motion.div>

          {/* Hero visual - Animated demo */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-20 relative"
          >
            <div className="relative max-w-5xl mx-auto">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl rounded-3xl" />

              {/* Main demo card */}
              <Card3D className="relative glass-effect rounded-3xl p-1 border border-white/10 shadow-2xl">
                <div className="bg-gradient-to-br from-slate-900/90 to-purple-900/90 rounded-3xl p-8 backdrop-blur-xl">
                  {/* Mock browser chrome */}
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 text-center text-sm text-gray-400">Flow Board</div>
                  </div>

                  {/* Kanban board mock */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Backlog', 'In Progress', 'Done'].map((col, idx) => (
                      <motion.div
                        key={col}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + idx * 0.1 }}
                        className="glass-effect rounded-2xl p-4 border border-white/5"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              idx === 0
                                ? 'bg-purple-400'
                                : idx === 1
                                  ? 'bg-blue-400'
                                  : 'bg-green-400'
                            }`}
                          />
                          <span className="font-semibold text-sm">{col}</span>
                        </div>

                        {/* Mock cards */}
                        {[1, 2].map((card) => (
                          <motion.div
                            key={card}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="bg-white/5 rounded-xl p-4 mb-3 border border-white/5 hover:border-purple-400/30 transition-all cursor-pointer group relative"
                          >
                            <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-white/5 rounded w-full mb-1" />
                            <div className="h-3 bg-white/5 rounded w-2/3" />

                            {/* AI sparkle on hover */}
                            {idx === 0 && card === 1 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ opacity: 1, scale: 1 }}
                                className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Sparkles className="w-4 h-4" />
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card3D>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <AnimatedSection className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Managing AI-assisted projects is different
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Traditional project management tools weren&apos;t built for the AI coding era
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                emoji: '😤',
                title: 'Vague Requirements',
                desc: 'Your AI needs clear context and detailed specifications, not scattered notes across different tools.',
              },
              {
                emoji: '🤖',
                title: 'Prompt Friction',
                desc: 'Constantly switching between PM tools and AI assistants breaks your flow and slows you down.',
              },
              {
                emoji: '📊',
                title: 'Team Misalignment',
                desc: 'When using AI to build, everyone needs to see what the AI is creating and why.',
              },
            ].map((problem, idx) => (
              <Card3D key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="glass-effect rounded-3xl p-8 border border-white/10 text-center h-full backdrop-blur-xl hover:border-purple-400/30 transition-all"
                >
                  <div className="text-6xl mb-6">{problem.emoji}</div>
                  <h3 className="text-2xl font-bold mb-4">{problem.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{problem.desc}</p>
                </motion.div>
              </Card3D>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              There&apos;s a better way →
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* AI Demo Section */}
      <AnimatedSection id="demo" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                From Kanban card to AI prompt
              </span>
              <br />
              <span className="text-white">in one click</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Stop context-switching. Your project manager and AI copilot in one place.
            </p>
          </div>

          {/* Interactive demo */}
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Input card */}
            <Card3D>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-effect rounded-3xl p-8 border border-white/10 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Your Task Card</h3>
                  <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                    Backlog
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Title</label>
                    <div className="glass-effect rounded-lg p-3 border border-white/5">
                      <p className="text-white">Add user authentication</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Description</label>
                    <div className="glass-effect rounded-lg p-3 border border-white/5">
                      <p className="text-gray-300 text-sm">
                        Need OAuth support for Google and GitHub. Include password reset and 2FA.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Tech Stack</label>
                    <div className="glass-effect rounded-lg p-3 border border-white/5">
                      <p className="text-gray-300 text-sm">Next.js, TypeScript, Clerk, Supabase</p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate AI Prompt
                </motion.button>
              </motion.div>
            </Card3D>

            {/* Output prompt */}
            <Card3D>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="glass-effect rounded-3xl p-8 border border-green-500/20 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Brain className="w-5 h-5 text-green-400" />
                    AI-Generated Prompt
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyPrompt}
                    className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm flex items-center gap-2 hover:bg-green-500/30 transition-colors"
                  >
                    {copiedPrompt ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="glass-effect rounded-lg p-4 border border-white/5 font-mono text-sm text-gray-300 max-h-96 overflow-y-auto space-y-2">
                  <pre className="whitespace-pre-wrap leading-relaxed">{samplePrompt}</pre>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Ready to paste into Claude Code, Cursor, or GitHub Copilot</span>
                </div>
              </motion.div>
            </Card3D>
          </div>
        </div>
      </AnimatedSection>

      {/* Features Grid */}
      <AnimatedSection className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Everything you need to build with AI
            </h2>
            <p className="text-xl text-gray-400">Powerful features for modern development teams</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card3D key={idx}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-effect rounded-3xl p-8 border border-white/10 hover:border-purple-400/30 transition-all h-full backdrop-blur-xl group"
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </motion.div>
                </Card3D>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* Use Cases */}
      <AnimatedSection className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Built for teams
              </span>
              <br />
              <span className="text-white">building with AI</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, idx) => {
              const Icon = useCase.icon;
              return (
                <Card3D key={idx}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-effect rounded-3xl p-8 border border-white/10 hover:border-cyan-400/30 transition-all backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold">{useCase.title}</h3>
                    </div>

                    <p className="text-gray-400 mb-4 leading-relaxed">{useCase.description}</p>

                    <div className="glass-effect rounded-lg p-4 border border-white/5">
                      <p className="text-sm text-gray-400 font-mono">{useCase.columns}</p>
                    </div>
                  </motion.div>
                </Card3D>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* Comparison Table */}
      <AnimatedSection className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              How we stack up
            </h2>
            <p className="text-xl text-gray-400">See why developers choose Flow Board</p>
          </div>

          <Card3D>
            <div className="glass-effect rounded-3xl border border-white/10 overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-6 text-gray-400 font-semibold">Feature</th>
                      <th className="text-left p-6 font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Flow Board
                      </th>
                      <th className="text-left p-6 text-gray-400">Trello</th>
                      <th className="text-left p-6 text-gray-400">Linear</th>
                      <th className="text-left p-6 text-gray-400">Asana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-6 text-white font-medium">{row.feature}</td>
                        <td className="p-6">
                          {typeof row.ours === 'boolean' ? (
                            row.ours ? (
                              <CheckCircle className="w-6 h-6 text-green-400" />
                            ) : (
                              <X className="w-6 h-6 text-red-400" />
                            )
                          ) : (
                            <span className="text-green-400 font-semibold">{row.ours}</span>
                          )}
                        </td>
                        <td className="p-6 text-gray-400">
                          {typeof row.trello === 'boolean' ? (
                            row.trello ? (
                              <CheckCircle className="w-6 h-6 text-gray-600" />
                            ) : (
                              <X className="w-6 h-6 text-gray-700" />
                            )
                          ) : (
                            row.trello
                          )}
                        </td>
                        <td className="p-6 text-gray-400">
                          {typeof row.linear === 'boolean' ? (
                            row.linear ? (
                              <CheckCircle className="w-6 h-6 text-gray-600" />
                            ) : (
                              <X className="w-6 h-6 text-gray-700" />
                            )
                          ) : (
                            row.linear
                          )}
                        </td>
                        <td className="p-6 text-gray-400">
                          {typeof row.asana === 'boolean' ? (
                            row.asana ? (
                              <CheckCircle className="w-6 h-6 text-gray-600" />
                            ) : (
                              <X className="w-6 h-6 text-gray-700" />
                            )
                          ) : (
                            row.asana
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card3D>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8 text-gray-400"
          >
            Those are great tools for large enterprises.
            <br />
            But if you&apos;re building with AI?{' '}
            <span className="text-purple-400 font-semibold">We&apos;ve got you covered.</span>
          </motion.p>
        </div>
      </AnimatedSection>

      {/* Tech Stack */}
      <AnimatedSection className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Built with modern tech
          </h2>
          <p className="text-xl text-gray-400 mb-12">The stack developers love</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {techStack.map((tech, idx) => (
              <Card3D key={idx}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-effect rounded-2xl p-6 border border-white/10 hover:border-purple-400/30 transition-all backdrop-blur-xl group"
                >
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {tech.icon}
                  </div>
                  <div
                    className={`font-semibold bg-gradient-to-r ${tech.color} bg-clip-text text-transparent`}
                  >
                    {tech.label}
                  </div>
                </motion.div>
              </Card3D>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://github.com"
              target="_blank"
              className="px-6 py-3 glass-effect border border-white/20 hover:border-purple-400/50 rounded-xl font-medium transition-all flex items-center gap-2 group"
            >
              <Github className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              View Source
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-3 glass-effect border border-white/20 hover:border-cyan-400/50 rounded-xl font-medium transition-all flex items-center gap-2"
            >
              <Code2 className="w-5 h-5" />
              Read the Docs
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Pricing Section */}
      <AnimatedSection id="pricing" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Start free. Upgrade as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <Card3D>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-effect rounded-2xl p-8 border border-white/10 backdrop-blur-xl h-full flex flex-col"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                  <p className="text-gray-400">Perfect for trying out</p>
                </div>

                <div className="mb-8">
                  <div className="text-5xl font-bold text-white mb-2">$0</div>
                  <div className="text-gray-400">Forever free</div>
                </div>

                <Link
                  href="/sign-up"
                  className="w-full py-3 px-6 glass-effect border border-white/20 hover:border-purple-400/50 rounded-xl font-semibold text-center transition-all mb-8"
                >
                  Get Started
                </Link>

                <ul className="space-y-3 flex-1">
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Up to 3 users</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>2 boards per organization</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>50 cards per board</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>10 AI prompts/month</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Beautiful glassmorphic UI</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Dark/light mode</span>
                  </li>
                </ul>
              </motion.div>
            </Card3D>

            {/* Pro Tier - Popular */}
            <Card3D>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass-effect rounded-2xl p-8 border-2 border-purple-500/50 backdrop-blur-xl h-full flex flex-col relative"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <p className="text-gray-400">For small teams & power users</p>
                </div>

                <div className="mb-8">
                  <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    $8
                  </div>
                  <div className="text-gray-400">per user/month, billed annually</div>
                  <div className="text-sm text-gray-500 mt-1">or $10/month billed monthly</div>
                </div>

                <Link
                  href="/sign-up"
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold text-center transition-all mb-8 shadow-lg shadow-purple-500/50"
                >
                  Start Pro Trial
                </Link>

                <ul className="space-y-3 flex-1">
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Up to 10 users</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Unlimited</strong> boards & cards
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>100 AI prompts/month</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Real-time collaboration</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>File attachments</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>API access & webhooks</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Slack & GitHub integration</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>5 GB storage</span>
                  </li>
                </ul>
              </motion.div>
            </Card3D>

            {/* Business Tier */}
            <Card3D>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="glass-effect rounded-2xl p-8 border border-white/10 backdrop-blur-xl h-full flex flex-col"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Business</h3>
                  <p className="text-gray-400">For growing teams</p>
                </div>

                <div className="mb-8">
                  <div className="text-5xl font-bold text-white mb-2">$16</div>
                  <div className="text-gray-400">per user/month, billed annually</div>
                  <div className="text-sm text-gray-500 mt-1">or $20/month billed monthly</div>
                </div>

                <Link
                  href="/sign-up"
                  className="w-full py-3 px-6 glass-effect border border-white/20 hover:border-cyan-400/50 rounded-xl font-semibold text-center transition-all mb-8"
                >
                  Contact Sales
                </Link>

                <ul className="space-y-3 flex-1">
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Up to 50 users</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Everything in Pro</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>500 AI prompts/month</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Advanced analytics & reporting</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Unlimited automation rules</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Choice of AI models (GPT-4o/Claude)</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>50 GB storage</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </motion.div>
            </Card3D>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400">
              Need more than 50 users?{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                Contact us for Enterprise pricing
              </a>
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Final CTA */}
      <AnimatedSection className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Ready to build smarter
                <br />
                with AI?
              </span>
            </h2>
            <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
              Join developers already using Flow Board to supercharge
              <br />
              their AI-assisted development workflow
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="/sign-up"
                className="px-12 py-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50"
              >
                Start Free with GitHub
              </Link>
              <Link
                href="/sign-up"
                className="px-12 py-5 glass-effect border border-white/20 hover:border-cyan-400/50 rounded-xl font-bold text-xl transition-all"
              >
                Sign up with Google
              </Link>
            </div>

            <p className="text-gray-500 text-sm">
              No credit card required • Free to start • Upgrade anytime
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Roadmap
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    MIT License
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 Flow Board. Built with 💜 by developers, for developers.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
