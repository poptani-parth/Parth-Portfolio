import React from "react";
import { motion } from "motion/react";
import { ProfileDTO } from "../../types";
import {
    Asterisk,
    Facebook,
    Instagram,
    Youtube,
    Linkedin,
    Github,
} from "lucide-react";

interface HeroSectionProps {
    profile: ProfileDTO;
}
interface HeroSectionProps {
  profile: ProfileDTO;
  projectCount?: number; 
  onExploreProjects: () => void;
  onContactClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ profile, projectCount = 0 }) => {
    return (
        <section
            id="hero"
            className="relative min-h-screen pt-32 pb-16 md:pt-48 md:pb-32 flex items-center bg-[#f4f4f5] dark:bg-[#090909] overflow-hidden"
        >
            {/* Optional faint noise overlay could go here in CSS, relying on background color for now */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Main content column */}
                    <div className="lg:col-span-12">
                        {/* Tagline */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <Asterisk className="w-5 h-5 text-blue-400" />
                            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500 dark:text-zinc-400">
                                CODE // CREATE // SOLVE
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mb-12"
                        >
                            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white tracking-tight">
                                {profile.heroTitle || `Hi, I'm ${profile.name}.`}
                            </h1>
                        </motion.div>

                        {/* Stats and Description Row */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 items-start"
                        >
                            <div className="md:col-span-3 lg:col-span-2">
                                <div className="font-bold  dark:text-white font-['Syne',sans-serif]">
                                    <span className="text-white text-6xl md:text-7xl">
                                        {projectCount > 0 ? projectCount : "15"}
                                    </span>
                                    <span className="text-blue-500 text-6xl md:text-7xl">
                                        +
                                    </span>
                                    <br />
                                    <span className="text-gray-500 text-0.5xl font-[Constantia]">
                                        Successful Projects
                                    </span>
                                </div>
                                {/* <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 mt-2">
                                    {profile.location}
                                </div> */}
                            </div>
                            <div className="md:col-span-9 lg:col-span-8 lg:pl-8 lg:border-l lg:border-slate-300 dark:border-zinc-700">
                                <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 leading-relaxed max-w-3xl font-medium">
                                    {profile.heroSubtitle || profile.bio}
                                </p>
                            </div>
                        </motion.div>

                        {/* Buttons and Socials Row */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-8 border-t border-slate-200 dark:border-zinc-800"
                        >
                            <a
                                href="#contact"
                                className="inline-flex items-center justify-center px-8 py-3 rounded-full border-2 border-slate-900 dark:border-white text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-[#090909] transition-colors w-full sm:w-auto"
                            >
                                Hire Me Now
                            </a>

                            <div className="flex items-center gap-4">
                                <a
                                    href={profile.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-80 transition-opacity"
                                >
                                    <Github className="w-5 h-5" />
                                </a>
                                <a
                                    href={profile.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-80 transition-opacity"
                                >
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
