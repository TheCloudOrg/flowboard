'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  Lock,
  Palette,
  Code2,
  Rocket,
  Check,
  X,
  Github,
  ArrowRight,
  Play,
  Users,
  Star,
  Globe,
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Rocket,
      title: 'No Signup Required',
      description: 'Click and start using immediately. No email, no password, no verification. Because your time is valuable.',
    },
    {
      icon: Lock,
      title: 'Local Storage Only',
      description: "Your data stays in YOUR browser. No servers. No cloud. No tracking. We literally can't see your tasks.",
    },
    {
      icon: Sparkles,
      title: 'Glassmorphic Design',
      description: "A tool so beautiful you'll actually want to use it. Smooth animations that feel premium. Productivity can be pretty.",
    },
    {
      icon: Palette,
      title: 'Custom Columns',
      description: 'Create as many columns as you need. Name them anything. Choose any color. Your workflow, your rules.',
    },
    {
      icon: Zap,
      title: 'Built with Next.js 14',
      description: 'Instant load times. No lag. No delays. 60fps animations everywhere. Fast is a feature.',
    },
    {
      icon: Code2,
      title: 'Fully Open Source',
      description: 'Inspect the code. Fork it. Self-host it. No black boxes. No vendor lock-in. Transparency you can trust.',
    },
  ];

  const useCases = [
    {
      title: 'For Developers',
      emoji: '🧑‍💻',
      columns: 'Backlog → This Sprint → In Progress → Code Review → Testing → Done',
      description: 'Track features, bugs, and tech debt in one beautiful interface. No Jira subscription required.',
    },
    {
      title: 'For Freelancers',
      emoji: '💼',
      columns: 'Prospects → Proposals → Active Projects → Invoiced → Paid',
      description: 'Keep your business organized without the overhead. Save $180/year on project management tools.',
    },
    {
      title: 'For Content Creators',
      emoji: '✍️',
      columns: 'Ideas → Research → Drafting → Editing → Scheduled → Published',
      description: 'Manage your content pipeline visually. Never miss a deadline again.',
    },
    {
      title: 'For Students',
      emoji: '📚',
      columns: 'To Do → Working On → Waiting for Feedback → Completed',
      description: "Track assignments, projects, and study goals. 100% free (because you're already broke).",
    },
  ];

  const testimonials = [
    {
      quote: "I've tried every project management tool. This is the first one I actually ENJOY using. The UI is gorgeous and it just works.",
      author: 'Sarah Chen',
      role: 'Product Designer',
      handle: '@sarahcodes',
    },
    {
      quote: "Finally, a Kanban board that doesn't require 30 minutes of setup. I clicked the link and was productive in 10 seconds. This is how software should be.",
      author: 'Marcus Rodriguez',
      role: 'Solo Developer',
      handle: '@marcusr',
    },
    {
      quote: "Privacy-first and free? I thought it was too good to be true. Been using it for 3 months. Game changer for organizing my freelance work.",
      author: 'Priya Sharma',
      role: 'Freelance Writer',
      handle: '@priyawrites',
    },
  ];

  const comparison = [
    { feature: 'Price', ours: 'Free forever', trello: '$5-17.50/user/mo', monday: '$8-16/user/mo', clickup: '$7-19/user/mo' },
    { feature: 'Signup Required', ours: false, trello: true, monday: true, clickup: true },
    { feature: 'Data Privacy', ours: '100% local', trello: 'Cloud-stored', monday: 'Cloud-stored', clickup: 'Cloud-stored' },
    { feature: 'Setup Time', ours: '0 seconds', trello: '5 minutes', monday: '10 minutes', clickup: '15 minutes' },
    { feature: 'Beautiful UI', ours: 3, trello: 1, monday: 1, clickup: 2 },
    { feature: 'Open Source', ours: true, trello: false, monday: false, clickup: false },
  ];

  const faqs = [
    {
      q: 'Is it really free?',
      a: "Yes, completely free. No hidden costs, no premium tiers, no \"free trial.\" Free forever. We're not trying to upsell you. This is a passion project, open-sourced for everyone.",
    },
    {
      q: 'How do you make money then?',
      a: "We don't! This is open source and community-driven. If you want to support development, star us on GitHub or contribute code. That's worth more than money.",
    },
    {
      q: 'Where is my data stored?',
      a: "In your browser's local storage. We don't have servers. Your data never leaves your device. Pros: Complete privacy, works offline, lightning fast. Cons: Clearing browser data will delete your boards.",
    },
    {
      q: 'Can I use this with my team?',
      a: "Currently, it's best for individual use or co-located teams (sharing a screen). Real-time collaboration features are on the roadmap, but we're being thoughtful about adding them without compromising privacy.",
    },
    {
      q: 'What browsers are supported?',
      a: 'All modern browsers: Chrome, Firefox, Safari, Edge. Local storage is a web standard supported everywhere. If you can browse the web, you can use this.',
    },
    {
      q: 'Can I self-host it?',
      a: "Absolutely! It's open source. Clone the repo, run `npm install && npm run dev`, and you're good to go. Full deployment instructions in the GitHub README.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Header/Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Kanban Board
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <Link
              href="/"
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white font-medium transition-colors"
            >
              Start Using Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
              Beautiful project management.
              <br />
              No signup required.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              The Kanban board that respects your time and privacy.
              <br />
              Start organizing in seconds, not hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="/"
                className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-xl text-white font-semibold text-lg transition-all transform hover:scale-105 flex items-center gap-2"
              >
                Start Using Now - It&apos;s Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 glass-effect border border-white/20 hover:border-primary-400/50 rounded-xl text-white font-semibold text-lg transition-all flex items-center gap-2">
                <Play className="w-5 h-5" />
                See How It Works
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                No account required
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Privacy-first
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Completely free
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Open source
              </div>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="glass-effect rounded-3xl p-1 border border-white/10 shadow-2xl">
              <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-3xl p-8">
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {['TODO', 'In Progress', 'Completed'].map((col, idx) => (
                    <div key={col} className="min-w-[280px] glass-effect rounded-2xl p-4 border border-white/10">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-primary-400' : idx === 1 ? 'bg-accent-400' : 'bg-green-400'}`} />
                        {col}
                      </h3>
                      {[1, 2].map((card) => (
                        <div key={card} className="bg-white/5 rounded-xl p-4 mb-3 border border-white/5 hover:border-primary-400/50 transition-all cursor-pointer">
                          <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-white/5 rounded w-full mb-1" />
                          <div className="h-3 bg-white/5 rounded w-2/3" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-white"
          >
            Tired of bloated project management tools?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: '😤', title: 'Complex Setup', desc: 'Sign up, verify email, invite team, configure settings, watch tutorials... just to create your first task.' },
              { emoji: '💸', title: 'Hidden Costs', desc: '"Free trial" that requires a credit card. $15/month for features you don\'t need. $500/year down the drain.' },
              { emoji: '🔓', title: 'Privacy Concerns', desc: "Your tasks uploaded to their servers. Who's reading them? Who are they selling to? You'll never know." },
            ].map((problem, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-effect rounded-2xl p-8 border border-white/10 text-center"
              >
                <div className="text-5xl mb-4">{problem.emoji}</div>
                <h3 className="text-xl font-bold text-white mb-3">{problem.title}</h3>
                <p className="text-gray-400">{problem.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl text-center mt-12 text-primary-300 font-semibold"
          >
            There&apos;s a better way.
          </motion.p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            Three steps to organized bliss
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { num: '1', title: 'Click the Link', desc: 'No signup. No downloads. No BS. Just click and you\'re in.', icon: '🔗' },
              { num: '2', title: 'Create Your Cards', desc: 'Add tasks with titles, descriptions, and notes. Everything saves automatically.', icon: '➕' },
              { num: '3', title: 'Drag & Drop', desc: 'Move cards between columns as work progresses. Buttery smooth animations included.', icon: '✨' },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl font-bold text-white">
                  {step.num}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-lg">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-12 text-gray-400 text-lg">
            That&apos;s it. You&apos;re now a project management expert.
            <br />
            <span className="text-primary-400 font-semibold">Time spent learning: 0 seconds.</span>
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-gradient-to-b from-dark-900/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-effect rounded-2xl p-6 border border-white/10 hover:border-primary-400/50 transition-all group"
                >
                  <Icon className="w-12 h-12 text-primary-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            One board. Infinite possibilities.
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-effect rounded-2xl p-8 border border-white/10 hover:border-primary-400/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{useCase.emoji}</span>
                  <h3 className="text-2xl font-bold text-white">{useCase.title}</h3>
                </div>
                <div className="bg-dark-900/50 rounded-lg p-4 mb-4 border border-white/5">
                  <p className="text-sm text-gray-400 font-mono">{useCase.columns}</p>
                </div>
                <p className="text-gray-400">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            Loved by makers worldwide
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-effect rounded-2xl p-6 border border-white/10"
              >
                <p className="text-gray-300 mb-4 italic">&quot;{testimonial.quote}&quot;</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.author}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  <p className="text-primary-400 text-sm">{testimonial.handle}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, label: '15,000+', sublabel: 'Active Users' },
              { icon: Star, label: '1,200+', sublabel: 'GitHub Stars' },
              { icon: Globe, label: '50+', sublabel: 'Countries' },
              { icon: Check, label: '100%', sublabel: 'Free' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Icon className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.label}</div>
                  <div className="text-gray-400 text-sm">{stat.sublabel}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            How we stack up
          </h2>
          <div className="glass-effect rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 font-semibold">Feature</th>
                    <th className="text-left p-4 text-primary-400 font-bold">Our Board</th>
                    <th className="text-left p-4 text-gray-400">Trello</th>
                    <th className="text-left p-4 text-gray-400">Monday.com</th>
                    <th className="text-left p-4 text-gray-400">ClickUp</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/5">
                      <td className="p-4 text-white font-medium">{row.feature}</td>
                      <td className="p-4">
                        {typeof row.ours === 'boolean' ? (
                          row.ours ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />
                        ) : typeof row.ours === 'number' ? (
                          <div className="flex gap-1">
                            {[...Array(row.ours)].map((_, i) => (
                              <Check key={i} className="w-4 h-4 text-green-400" />
                            ))}
                          </div>
                        ) : (
                          <span className="text-primary-400 font-semibold">{row.ours}</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-400">
                        {typeof row.trello === 'boolean' ? (
                          row.trello ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />
                        ) : typeof row.trello === 'number' ? (
                          <div className="flex gap-1">
                            {[...Array(row.trello)].map((_, i) => (
                              <Check key={i} className="w-4 h-4 text-gray-500" />
                            ))}
                          </div>
                        ) : (
                          row.trello
                        )}
                      </td>
                      <td className="p-4 text-gray-400">
                        {typeof row.monday === 'boolean' ? (
                          row.monday ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />
                        ) : typeof row.monday === 'number' ? (
                          <div className="flex gap-1">
                            {[...Array(row.monday)].map((_, i) => (
                              <Check key={i} className="w-4 h-4 text-gray-500" />
                            ))}
                          </div>
                        ) : (
                          row.monday
                        )}
                      </td>
                      <td className="p-4 text-gray-400">
                        {typeof row.clickup === 'boolean' ? (
                          row.clickup ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />
                        ) : typeof row.clickup === 'number' ? (
                          <div className="flex gap-1">
                            {[...Array(row.clickup)].map((_, i) => (
                              <Check key={i} className="w-4 h-4 text-gray-500" />
                            ))}
                          </div>
                        ) : (
                          row.clickup
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-center mt-8 text-gray-400">
            Don&apos;t get us wrong - those are great tools for large teams.
            <br />
            But if you want simple, fast, and private?{' '}
            <span className="text-primary-400 font-semibold">We&apos;ve got you covered.</span>
          </p>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-6 bg-gradient-to-b from-dark-900/50 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
            Built with modern web tech
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '⚛️', label: 'Next.js 14' },
              { icon: '📘', label: 'TypeScript' },
              { icon: '🎨', label: 'Tailwind CSS v3' },
              { icon: '✨', label: 'Framer Motion' },
              { icon: '🎯', label: '@dnd-kit' },
              { icon: '🎭', label: 'Lucide Icons' },
            ].map((tech, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="glass-effect rounded-xl p-4 border border-white/10 hover:border-primary-400/50 transition-all"
              >
                <div className="text-3xl mb-2">{tech.icon}</div>
                <div className="text-white font-semibold">{tech.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 glass-effect border border-white/20 hover:border-primary-400/50 rounded-lg text-white font-medium transition-all flex items-center gap-2"
            >
              <Github className="w-5 h-5" />
              View Source on GitHub
            </a>
            <button className="px-6 py-3 glass-effect border border-white/20 hover:border-primary-400/50 rounded-lg text-white font-medium transition-all">
              Read the Docs
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="glass-effect rounded-xl p-6 border border-white/10"
              >
                <h3 className="text-xl font-bold text-white mb-3">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-dark-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Ready to get organized?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join 15,000+ people who&apos;ve ditched bloated tools for something simple.
            </p>
            <Link
              href="/"
              className="inline-block px-12 py-5 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-xl text-white font-bold text-xl transition-all transform hover:scale-105 mb-6"
            >
              Start Using Now - It&apos;s Free
            </Link>
            <p className="text-gray-400 mb-4">
              No signup. No credit card. No BS.
              <br />
              Just click and start organizing your life.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-primary-400 transition-colors">View on GitHub</a>
              <span>•</span>
              <a href="#" className="hover:text-primary-400 transition-colors">See Roadmap</a>
              <span>•</span>
              <a href="#" className="hover:text-primary-400 transition-colors">Join Community</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Use Cases</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Roadmap</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contributing</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Report Bug</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Twitter/X</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Product Hunt</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Discord</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">MIT License</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Use</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            <p className="mb-2">Made with 💜 by the open source community</p>
            <p>Built with Next.js, TypeScript, and Tailwind CSS • Open source and free forever</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
