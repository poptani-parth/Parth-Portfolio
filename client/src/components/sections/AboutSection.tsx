import React from 'react';
import { motion } from 'motion/react';
import { MediaDTO, ProfileDTO } from '../../types';
import { Asterisk } from 'lucide-react';

interface AboutSectionProps {
  profile: ProfileDTO;
  media: MediaDTO[];
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile, media }) => {
  const profileImage = profile.profileImageUrl || media.find((item) => item.usage === 'profile')?.url;

  return (
    <section id="about" className="py-24 bg-[#f4f4f5] dark:bg-[#090909]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="flex items-center gap-3 mb-6"
            >
              <Asterisk className="w-5 h-5 text-blue-400" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500 dark:text-zinc-400">
                LEARN ABOUT MY EXPERIENCE
              </span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white mb-6"
            >
              Hi, I'm {profile.name}!
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2 }}
              className="text-lg font-bold text-slate-800 dark:text-zinc-200 mb-6"
            >
                Backend systems built to handle real traffic, not just demos.
              
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.3 }}
              className="text-base text-slate-600 dark:text-zinc-400 mb-12 leading-relaxed"
            >
              {profile.bio}
            </motion.p>

            {profile.phone && (
              <p className="text-sm text-slate-600 dark:text-zinc-400">{profile.phone}</p>
            )}
          </div>

          {/* Right Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative flex justify-center items-center"
          >
            {/* The circular container that acts as a mask */}
            <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] rounded-full overflow-hidden bg-white dark:bg-zinc-800 flex justify-center items-end border border-slate-200 dark:border-zinc-700">
              
              {/* Blue Asterisk */}
              <div className="absolute inset-0 flex items-center justify-center scale-110 z-0">
                <svg viewBox="0 0 200 200" fill="currentColor" className="text-blue-400 w-full h-full opacity-90" style={{ transform: 'rotate(15deg)'}}>
                  <path d="M125 100l70-35-25-45-70 35 15-75H85l15 75-70-35-25 45 70 35-70 35 25 45 70-35-15 75h30l-15-75 70 35 25-45-70-35z" />
                </svg>
              </div>

              {/* Profile Image - transparent PNG assumed, masked at bottom edge */}
              {profileImage && <img 
                src={profileImage} 
                alt={profile.name} 
                // className="relative z-10 w-[85%] h-auto object-contain object-bottom drop-shadow-2xl translate-y-2"
                className="relative z-10 w-full h-full object-cover"
              />}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
