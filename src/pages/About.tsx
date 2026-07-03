import { motion } from 'motion/react';
import { Terminal, Cpu, Database, Award, Github, Mail, Globe, Shield } from 'lucide-react';

export default function About() {
  const skills = [
    { category: 'Frontend', items: ['React 19', 'TypeScript', 'Tailwind CSS v4', 'Vite', 'Next.js', 'Redux Toolkit'], icon: Cpu },
    { category: 'Backend & Cloud', items: ['Node.js', 'Express', 'Firebase Firestore', 'Google Cloud Run', 'PostgreSQL', 'RESTful APIs'], icon: Database },
    { category: 'Developer Tools', items: ['Git / GitHub', 'Docker', 'Linux CLI', 'Vercel / Netlify', 'CI/CD Pipelines'], icon: Terminal },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl">
        {/* Profile Intro Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900 p-8 md:p-12 shadow-2xl mb-12">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-[64px]"></div>

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Developer Avatar Mockup */}
            <div className="relative h-28 w-28 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 font-display text-4xl font-extrabold text-white">
                R
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/10">
                  <Shield className="h-3 w-3" />
                  <span>Lead Architect</span>
                </span>
              </div>
              <h1 className="font-display text-3xl font-extrabold text-white mt-3 tracking-tight">Razwon</h1>
              <p className="mt-2 text-slate-400 text-sm leading-relaxed max-w-xl">
                Hi, I'm Razwon. I design, program, and maintain clean, high-performance web applications using robust modular frameworks, serverless infrastructure, and cloud databases.
              </p>

              {/* Social links */}
              <div className="mt-5 flex gap-4 text-slate-500">
                <a href="https://ioi.razwon.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
                <a href="mailto:termremo@gmail.com" className="hover:text-white transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Sections */}
        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900 p-6 sm:p-8 shadow-xl">
            <h2 className="font-display text-lg font-bold text-white mb-3">Core Philosophy</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              I believe in clean typography, responsive density, and zero-compromise page performance. Every interactive element should serve a purpose, avoiding bloated widgets and redundant libraries.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900 p-6 sm:p-8 shadow-xl">
            <h2 className="font-display text-lg font-bold text-white mb-3">Cloud Integrations</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This blog platform is directly integrated with Firebase Firestore using cloud credentials, demonstrating scalable real-time state delivery with lightning-fast query resolution.
            </p>
          </div>
        </div>

        {/* Skills Stack Matrix */}
        <div className="space-y-6">
          <h2 className="font-display text-xl font-bold text-white tracking-tight border-b border-slate-900 pb-3">Expertise Stack</h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            {skills.map((skill, index) => (
              <div key={index} className="rounded-3xl border border-slate-800/80 bg-slate-900 p-6 sm:p-8 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <skill.icon className="h-5 w-5 text-indigo-400" />
                    <h3 className="font-display text-sm font-bold text-white">{skill.category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skill.items.map((item, i) => (
                      <span key={i} className="rounded bg-slate-950 border border-slate-800 px-2 py-1 text-xs text-slate-400 font-mono">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
