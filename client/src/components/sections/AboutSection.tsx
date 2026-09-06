import React from'react';
import { motion } from'motion/react';
import { MediaDTO, ProfileDTO } from'../../types';
import { Asterisk } from'lucide-react';

interface ExtendedProfileDTO extends ProfileDTO {
 yearsOfExperience?: number;
 showExperienceInProfile?: boolean;
}

interface AboutSectionProps {
 profile: ExtendedProfileDTO;
 media: MediaDTO[];
 projectCount?: number;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
 profile,
 media,
 projectCount = 0,
}) => {
 const profileImage =
 profile.profileImageUrl || media.find((item) => item.usage ==='profile')?.url;

 // Format experience into months if < 1, or years if >= 1
 const renderExperienceMetric = () => {
 const rawVal = profile.yearsOfExperience;
 const num = typeof rawVal ==='string' ? parseFloat(rawVal) : Number(rawVal ?? 0);

 if (isNaN(num) || num <= 0) {
 return { value:'1+', label:'YEAR OF EXPERIENCE' };
 }

 if (num < 1) {
 const months = Math.round(num * 12);
 return {
 value:`${months}+`,
 label: months === 1 ?'MONTH OF EXPERIENCE' :'MONTHS OF EXPERIENCE',
 };
 }

 const years = Number.isInteger(num) ? num : num.toFixed(1);
 return {
 value:`${years}+`,
 label: num === 1 ?'YEAR OF EXPERIENCE' :'YEARS OF EXPERIENCE',
 };
 };

 const experienceData = renderExperienceMetric();
 const effectiveProjectCount = projectCount > 0 ? projectCount : 15;

 return (
 <section id="about" className="py-24 bg-theme-bg">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
 {/* Left Content Column */}
 <div>
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin:'-50px' }}
 className="flex items-center gap-3 mb-6"
 >
 <Asterisk className="w-5 h-5 text-blue-400" />
 <span className="text-[11px] font-bold tracking-widest uppercase text-theme-text-muted font-mono">
 LEARN ABOUT MY EXPERIENCE
 </span>
 </motion.div>

 <motion.h2
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin:'-50px' }}
 transition={{ delay: 0.1 }}
 className="text-4xl md:text-5xl font-bold font-['Syne',sans-serif] text-theme-text mb-6"
 >
 Hi, I'm {profile.name}!
 </motion.h2>

 <motion.p
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin:'-50px' }}
 transition={{ delay: 0.2 }}
 className="text-lg font-bold text-theme-text mb-6"
 >
 Designing reliable distributed systems, resilient microservices with Spring Boot, and
 high-throughput pipelines.
 </motion.p>

 <motion.p
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin:'-50px' }}
 transition={{ delay: 0.3 }}
 className="text-base text-theme-text-secondary mb-10 leading-relaxed font-light"
 >
 {profile.bio}
 </motion.p>

 {/* 4-Stat Metric Grid (Weblium Reference) */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin:'-50px' }}
 transition={{ delay: 0.4 }}
 className="grid grid-cols-2 gap-x-8 gap-y-6 pt-6 mb-8 border-t border-theme-border"
 >
 {/* 1. Accuracy / Reliability */}
 <div>
 <div className="text-3xl md:text-4xl font-bold font-['Syne',sans-serif] text-theme-text">
 99.9%
 </div>
 <div className="text-[11px] font-mono uppercase tracking-wider text-theme-text-muted mt-1 font-semibold">
 API ACCURACY &amp; UPTIME
 </div>
 </div>

 {/* 2. Years / Months of Experience */}
 <div>
 <div className="text-3xl md:text-4xl font-bold font-['Syne',sans-serif] text-theme-text">
 {experienceData.value}
 </div>
 <div className="text-[11px] font-mono uppercase tracking-wider text-theme-text-muted mt-1 font-semibold">
 {experienceData.label}
 </div>
 </div>

 {/* 3. Completed Projects */}
 <div>
 <div className="text-3xl md:text-4xl font-bold font-['Syne',sans-serif] text-theme-text">
 {effectiveProjectCount}+
 </div>
 <div className="text-[11px] font-mono uppercase tracking-wider text-theme-text-muted mt-1 font-semibold">
 COMPLETED PROJECTS
 </div>
 </div>

 {/* 4. Code Commits / Hours */}
 <div>
 <div className="text-3xl md:text-4xl font-bold font-['Syne',sans-serif] text-theme-text">
 2K+
 </div>
 <div className="text-[11px] font-mono uppercase tracking-wider text-theme-text-muted mt-1 font-semibold">
 HOURS OF CODING
 </div>
 </div>
 </motion.div>
 </div>

 {/* Right Image Mask */}
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 whileInView={{ opacity: 1, scale: 1 }}
 viewport={{ once: true, margin:'-50px' }}
 transition={{ duration: 0.6, ease:'easeOut' }}
 className="relative flex justify-center items-center"
 >
 <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] rounded-full overflow-hidden bg-theme-card dark:bg-zinc-800 flex justify-center items-end border border-theme-border shadow-xl">
 {/* Blue Asterisk Shape[cite: 12] */}
 <div className="absolute inset-0 flex items-center justify-center scale-110 z-0">
 <svg
 viewBox="0 0 200 200"
 fill="currentColor"
 className="text-blue-400 w-full h-full opacity-90"
 style={{ transform:'rotate(15deg)' }}
 >
 <path d="M125 100l70-35-25-45-70 35 15-75H85l15 75-70-35-25 45 70 35-70 35 25 45 70-35-15 75h30l-15-75 70 35 25-45-70-35z" />
 </svg>
 </div>

 {/* Profile Image[cite: 12] */}
 {profileImage && (
 <img
 src={profileImage}
 alt={profile.name}
 className="relative z-10 w-full h-full object-cover"
 />
 )}
 </div>
 </motion.div>
 </div>
 </div>
 </section>
 );
};