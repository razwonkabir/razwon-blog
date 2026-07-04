import { motion } from 'motion/react';
import { Terminal, Cpu, Shield, Globe, Mail, MapPin, GraduationCap, Code2, Network, Sparkles, BookOpen } from 'lucide-react';
import siteLogo from '../assets/images/site_logo_1783046576955.png';

export default function About() {
  const infoDetails = [
    { label: 'Lives in', value: 'Dhaka, Bangladesh', icon: MapPin, color: 'text-rose-500' },
    { label: 'Studies at', value: 'NotreDame College, HSC 2028', icon: GraduationCap, color: 'text-amber-500' },
    { label: 'Studied at', value: 'Rajuk College, SSC 2026', icon: GraduationCap, color: 'text-indigo-500' },
  ];

  const expertises = [
    {
      title: 'Senior Front End Web Developer',
      icon: Code2,
      skills: ['HTML', 'CSS', 'React 19', 'TypeScript', 'Tailwind CSS', 'Vite', 'Next.js'],
      color: 'from-blue-500 via-sky-500 to-indigo-500',
    },
    {
      title: 'Competitive Programming and Backend',
      icon: Cpu,
      skills: ['C++', 'Python', 'Data Structures', 'Algorithms', 'Node.js', 'Express', 'Firebase'],
      color: 'from-amber-500 via-orange-500 to-red-500',
    },
    {
      title: 'Developing and Networking',
      icon: Network,
      skills: ['Malware', 'VPN', 'PPTP', 'AI Training and Jailbreaking', 'Ethical Stalking and Hacking'],
      color: 'from-purple-500 via-fuchsia-500 to-pink-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
    >
      <div className="mx-auto max-w-4xl">
        {/* Profile Intro Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/85 bg-white dark:bg-slate-900 p-8 md:p-12 shadow-md dark:shadow-2xl mb-12 transition-colors duration-300">
          {/* Top animated gradient edge */}
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-indigo-500"></div>
          
          {/* Background decorative elements */}
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-[64px]"></div>
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-purple-500/10 blur-[64px]"></div>

          <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-10">
            {/* Developer Avatar using site_logo */}
            <div className="relative h-32 w-32 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1.5 shadow-xl">
              <img 
                src={siteLogo} 
                alt="Razwon Kabir Famim Avatar" 
                className="h-full w-full rounded-full object-cover border-2 border-white dark:border-slate-950" 
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border border-white dark:border-slate-950"></span>
              </span>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-3.5 py-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-500/10 font-mono">
                  <Shield className="h-3 w-3" />
                  <span>Lead Architect</span>
                </span>
              </div>
              <h1 className="font-vibes text-5xl sm:text-6xl font-normal text-slate-900 dark:text-white mt-2 select-none">
                Razwon Kabir Famim
              </h1>
              <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                Hi, I am RK Famim, A Bangladeshi builder, algorithmic competitor, and student researcher tracking toward MIT CSAIL. My life revolves around intense mathematical training, C++ optimization, and hardware engineering. I believe in building tools from scratch to truly master them.
              </p>

              {/* Social links / Contact */}
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 dark:text-slate-500">
                <a href="https://ioi.razwon.xyz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold hover:text-indigo-600 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                  <Globe className="h-3.5 w-3.5 text-indigo-500" />
                  <span>ioi.razwon.xyz</span>
                </a>
                <a href="mailto:termremo@gmail.com" className="flex items-center gap-1.5 text-xs font-semibold hover:text-indigo-600 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                  <Mail className="h-3.5 w-3.5 text-rose-500" />
                  <span>termremo@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Core Philosophy & Ultimate Mission */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm dark:shadow-xl transition-colors duration-300">
            <div className="absolute top-0 left-0 h-full w-[3px] bg-indigo-500"></div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Core Philosophy</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              IOI &amp; ICPC Competitive Programming Mastery, Advanced Data Structures, and Systems Architecture.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm dark:shadow-xl transition-colors duration-300">
            <div className="absolute top-0 left-0 h-full w-[3px] bg-rose-500"></div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-rose-500" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">The Ultimate Mission</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              The architectural definition of Socio-Bio-Informatics and Remediology (SBIR)—utilizing high-performance computing, data science, and assistive cobotics to solve critical societal and biological imbalances.
            </p>
          </div>
        </div>

        {/* My Info Location & Academic Timeline */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md dark:shadow-xl mb-12 transition-colors duration-300">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
            <Terminal className="h-5 w-5 text-teal-500" />
            <span>Academic &amp; Profile Directory</span>
          </h2>
          
          <div className="grid gap-6 sm:grid-cols-3">
            {infoDetails.map((info, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/55 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/50 transition-all duration-300 hover:scale-[1.01]"
              >
                <div className={`p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm shrink-0`}>
                  <info.icon className={`h-5 w-5 ${info.color}`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 font-mono">
                    {info.label}
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {info.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expertise Stack Matrix */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-900 pb-4 transition-colors duration-300">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-500 animate-pulse" />
              <span>Expertise Stack</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Mastery Spectrum</span>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {expertises.map((exp, index) => (
              <div 
                key={index} 
                className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                {/* Visual colored pill accent inside */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${exp.color}`}></div>

                <div>
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                      <exp.icon className="h-4.5 w-4.5 text-indigo-500" />
                    </div>
                    <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                      {exp.title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {exp.skills.map((skill, i) => (
                      <span 
                        key={i} 
                        className="rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/40 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 font-mono font-medium transition-colors"
                      >
                        {skill}
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
