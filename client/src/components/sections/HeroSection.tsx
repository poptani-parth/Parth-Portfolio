import React from "react";
import { motion } from "motion/react";
import { ProfileDTO } from "../../types";
import {
    Asterisk,
    Linkedin,
    Github,
} from "lucide-react";

interface ExtendedProfileDTO extends ProfileDTO {
    yearsOfExperience?: number;
    showExperienceInProfile?: boolean;
}

interface HeroSectionProps {
    profile: ExtendedProfileDTO;
    projectCount?: number;
    onExploreProjects?: () => void;
    onContactClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    profile,
    projectCount = 0,
}) => {
    // Dynamic Experience Formatter (0.x -> Months, >= 1 -> Years)
    const renderExperienceMetric = () => {
        const rawVal = profile.yearsOfExperience;
        const num = typeof rawVal === "string" ? parseFloat(rawVal) : Number(rawVal ?? 0);

        if (isNaN(num) || num <= 0) {
            return null;
        }

        if (num < 1) {
            const months = Math.round(num * 12);
            return {
                number: months,
                unit: "+",
                label: months === 1 ? "Month Experience" : "Months Experience",
            };
        }

        const years = Number.isInteger(num) ? num : num.toFixed(1);
        return {
            number: years,
            unit: "+",
            label: num === 1 ? "Year Experience" : "Years Experience",
        };
    };

    const experienceData = renderExperienceMetric();
    const shouldShowExperience =
        profile.showExperienceInProfile !== false && experienceData !== null;

    return (
        <section
            id="hero"
            className="relative min-h-screen pt-32 pb-16 md:pt-48 md:pb-32 flex items-center bg-theme-bg overflow-hidden"
        >
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
                            <span className="text-[11px] font-bold tracking-widest uppercase text-theme-text-muted font-mono">
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
                            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] font-bold font-['Syne',sans-serif] text-theme-text tracking-tight">
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
                            {/* Stats Column: Projects & Optional Dynamic Experience Metric */}
                            <div className="md:col-span-4 lg:col-span-3 flex flex-wrap md:flex-col gap-6">
                                {/* 1. Successful Projects Metric */}
                                <div className="font-bold font-['Syne',sans-serif]">
                                    <span className="text-theme-text text-5xl md:text-6xl lg:text-7xl">
                                        {projectCount > 0 ? projectCount : "15"}
                                    </span>
                                    <span
                                        className="text-5xl md:text-6xl lg:text-7xl"
                                        style={{ color: "rgb(43, 127, 255)" }}
                                    >
                                        +
                                    </span>
                                    <div className="text-gray-500 text-xs sm:text-sm font-sans uppercase tracking-wider mt-1 font-medium">
                                        Successful Projects
                                    </div>
                                </div>

                                {/* 2. Dynamic Experience Metric (Rendered when toggled on) */}
                                {shouldShowExperience && (
                                    <div className="font-bold font-['Syne',sans-serif]">
                                        <span className="text-theme-text text-5xl md:text-6xl lg:text-7xl">
                                            {experienceData.number}
                                        </span>
                                        <span
                                            className="text-5xl md:text-6xl lg:text-7xl"
                                            style={{ color: "rgb(43, 127, 255)" }}
                                        >
                                            {experienceData.unit}
                                        </span>
                                        <div className="text-gray-500 text-xs sm:text-sm font-sans uppercase tracking-wider mt-1 font-medium">
                                            {experienceData.label}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bio Description Column */}
                            <div className="md:col-span-8 lg:col-span-9 md:pl-8 md:border-l border-theme-border-subtle">
                                <p className="text-lg md:text-xl text-theme-text-secondary leading-relaxed max-w-3xl font-light">
                                    {profile.heroSubtitle || profile.bio}
                                </p>
                            </div>
                        </motion.div>

                        {/* Buttons and Socials Row */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-8 border-t border-theme-border"
                        >
                            <a
                                href="#contact"
                                className="inline-flex items-center justify-center px-8 py-3 rounded-full border-2 border-slate-900 dark:border-white text-sm font-bold text-theme-text hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-[#090909] transition-colors w-full sm:w-auto cursor-pointer"
                            >
                                Hire Me Now
                            </a>

                            <div className="flex items-center gap-4">
                                {profile.githubUrl && (
                                    <a
                                        href={profile.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-80 transition-opacity"
                                        title="GitHub Profile"
                                    >
                                        <Github className="w-5 h-5" />
                                    </a>
                                )}
                                {profile.linkedinUrl && (
                                    <a
                                        href={profile.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-80 transition-opacity"
                                        title="LinkedIn Profile"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};