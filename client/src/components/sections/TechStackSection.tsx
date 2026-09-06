import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  LayoutGrid,
  ListFilter,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Briefcase
} from 'lucide-react';
import { SkillDTO, SkillCategoryDTO } from '../../types';
import { TechIcon } from '../ui/TechIcons';

interface TechStackSectionProps {
  skills: SkillDTO[];
  categories: SkillCategoryDTO[];
  selectedCategoryFilter?: string;
  onFilterChange?: (category: string) => void;
}

export const TechStackSection: React.FC<TechStackSectionProps> = ({
  skills,
  categories,
  selectedCategoryFilter,
  onFilterChange
}) => {

  const [activeCategory, setActiveCategory] = useState<string>(selectedCategoryFilter || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'pills'>('pills');
  const [selectedSkill, setSelectedSkill] = useState<SkillDTO | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(18);

  // Sync external filter if provided
  useEffect(() => {
    if (selectedCategoryFilter) {
      setActiveCategory(selectedCategoryFilter);
      setCurrentPage(1);
    }
  }, [selectedCategoryFilter]);

  // Helper to get realistic experience label
  const getExperienceDisplay = (skill: SkillDTO): string => {
    if (skill.yearsExperience && skill.yearsExperience > 0) {
      return `${skill.yearsExperience}+ Yrs`;
    }
    const name = skill.name.toLowerCase();
    if (
      name.includes('java') ||
      name.includes('spring') ||
      name.includes('oop') ||
      name.includes('sql') ||
      name.includes('dsa') ||
      name.includes('crud') ||
      name.includes('mvc')
    ) {
      return '4+ Yrs';
    }
    if (
      name.includes('mysql') ||
      name.includes('supabase') ||
      name.includes('mongo') ||
      name.includes('redis') ||
      name.includes('jwt') ||
      name.includes('rest') ||
      name.includes('git') ||
      name.includes('postman') ||
      name.includes('maven') ||
      name.includes('sdlc') ||
      name.includes('agile') ||
      name.includes('rbac') ||
      name.includes('css') ||
      name.includes('html')
    ) {
      return '3+ Yrs';
    }
    if (
      name.includes('claude') ||
      name.includes('chatgpt') ||
      name.includes('copilot') ||
      name.includes('ai') ||
      name.includes('python') ||
      name.includes('jsp') ||
      name.includes('php')
    ) {
      return '2+ Yrs';
    }
    return '3+ Yrs';
  };

  // Extract unique category names from skills
  const categoryTabs = useMemo(() => {
    const counts: Record<string, number> = { ALL: skills.length };
    
    skills.forEach((skill) => {
      const cat = skill.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const categoryList = categories.length > 0
      ? categories.map((c) => c.name)
      : Array.from(new Set(skills.map((s) => s.category).filter(Boolean) as string[]));

    return [
      { id: 'ALL', name: 'All Technologies', count: skills.length },
      ...categoryList.map((catName) => ({
        id: catName,
        name: catName,
        count: counts[catName] || 0
      }))
    ];
  }, [skills, categories]);

  // Filter skills based on tab and search
  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesCategory =
        activeCategory === 'ALL' ||
        (skill.category && skill.category.toLowerCase() === activeCategory.toLowerCase());

      const matchesSearch =
        searchQuery.trim() === '' ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        skill.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [skills, activeCategory, searchQuery]);

  // Reset pagination when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, pageSize]);

  // Calculate paginated slice
  const totalPages = Math.ceil(filteredSkills.length / pageSize) || 1;
  const paginatedSkills = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSkills.slice(start, start + pageSize);
  }, [filteredSkills, currentPage, pageSize]);

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredSkills.length);

  const handleTabClick = (catId: string) => {
    setActiveCategory(catId);
    setCurrentPage(1);
    if (onFilterChange) {
      onFilterChange(catId);
    }
  };

  // Marquee items
  const marqueeKeywords = [
    'Spring Boot 3',
    'Java 21',
    'PostgreSQL',
    'Claude AI',
    'Supabase',
    'Redis Cache',
    'Kafka Streams',
    'RESTful APIs',
    'Docker',
    'IntelliJ IDEA',
    'DSA & OOP',
    'Maven Builds',
    'JWT Auth',
    'Postman'
  ];

  return (
    <section id="skills" className="py-24 bg-white dark:bg-[#0c0c0e] relative overflow-hidden">
      
      {/* Top Flowing Marquee Banner */}
      <div className="w-full overflow-hidden py-3 border-y border-slate-200/70 dark:border-zinc-800/70 bg-slate-50/60 dark:bg-zinc-900/40 mb-16 select-none">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueeKeywords, ...marqueeKeywords].map((item, idx) => (
            <span
              key={idx}
              className="mx-6 text-xs font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500 flex items-center gap-2"
            >
              <TechIcon name={item} size={14} className="w-3.5 h-3.5" />
              <span>{item}</span>
              <span className="text-blue-400 ml-3">•</span>
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide uppercase mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Tech Matrix</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white mb-4"
          >
            Skills & Tools
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-zinc-400 font-medium"
          >
            A comprehensive look at the languages, frameworks, databases, and developer tooling I utilize daily.
          </motion.p>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="mb-10 space-y-4">
          
          {/* Top Bar: Search + View Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, e.g. Spring, PostgreSQL, Claude..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/70 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Mode Toggle & Results Count */}
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                {filteredSkills.length > 0 ? (
                  <>
                    Showing <strong className="text-slate-900 dark:text-white">{startIndex}-{endIndex}</strong> of {filteredSkills.length}
                  </>
                ) : (
                  '0 results'
                )}
              </span>

              {/* View Mode Buttons */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <button
                  onClick={() => setViewMode('pills')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'pills'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Compact Cloud View"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span className="inline">Compact Cloud</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Detailed Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="inline">Detailed Grid</span>
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Pills (Horizontal Scroll on Mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryTabs.map((tab) => {
              const isActive = activeCategory.toLowerCase() === tab.id.toLowerCase();
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md scale-102'
                      : 'bg-slate-100 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-zinc-800 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{tab.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Empty Search State */}
        {filteredSkills.length === 0 && (
          <div className="text-center py-16 px-4 border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/20">
            <Search className="w-8 h-8 text-slate-400 dark:text-zinc-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800 dark:text-zinc-200 mb-1">
              No matching technologies found
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
              Try searching with a different term or resetting the category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('ALL');
              }}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* VIEW MODE 1 (DEFAULT): Compact Interactive Stack Cloud */}
        {viewMode === 'pills' && filteredSkills.length > 0 && (
          <div className="py-4">
            <motion.div
              layout
              className="flex flex-wrap justify-center gap-3 py-4"
            >
              <AnimatePresence mode="popLayout">
                {paginatedSkills.map((skill, index) => {
                  const expLabel = getExperienceDisplay(skill);
                  return (
                    <motion.div
                      key={skill.id}
                      layout
                      initial={{ opacity: 0, scale: 0.92, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -10 }}
                      transition={{ duration: 0.2, delay: 0.015 * (index % 18) }}
                      onClick={() => setSelectedSkill(skill)}
                      className="group px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70 hover:bg-white dark:hover:bg-zinc-800 hover:border-blue-400/80 dark:hover:border-blue-400/80 hover:shadow-md transition-all duration-200 flex items-center gap-2.5 cursor-pointer hover:-translate-y-0.5"
                    >
                      <div className="p-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 group-hover:scale-105 transition-transform">
                        <TechIcon name={skill.name} size={16} className="w-4 h-4" />
                      </div>
                      
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        {skill.name}
                      </span>

                      {/* Display realistic experience tag rather than generic PRO */}
                      <span className="text-[10px] font-semibold tracking-tight text-slate-500 dark:text-zinc-400 px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-300 dark:group-hover:border-blue-900/60 transition-colors">
                        {expLabel}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* VIEW MODE 2: Detailed Interactive Grid */}
        {viewMode === 'grid' && filteredSkills.length > 0 && (
          <div className="py-4">
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {paginatedSkills.map((skill, index) => {
                  const expLabel = getExperienceDisplay(skill);
                  return (
                    <motion.div
                      key={skill.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: 0.02 * (index % 12) }}
                      onClick={() => setSelectedSkill(skill)}
                      className="group relative p-5 rounded-2xl border border-slate-200/90 dark:border-zinc-800/80 bg-slate-50/40 dark:bg-[#121214] hover:bg-white dark:hover:bg-[#18181c] hover:border-blue-400/60 dark:hover:border-blue-400/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Row: Tech Icon + Category + Experience */}
                        <div className="flex items-start justify-between gap-3 mb-3.5">
                          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/90 border border-slate-200/60 dark:border-zinc-700/60 shadow-xs group-hover:scale-110 transition-transform">
                            <TechIcon name={skill.name} size={22} className="w-5 h-5" />
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              {expLabel}
                            </span>
                            {skill.category && (
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                                {skill.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Skill Name */}
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                          {skill.name}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                          {skill.description || `Core expertise and production implementation using ${skill.name}.`}
                        </p>
                      </div>

                      {/* Bottom: Tags + Experience Meter */}
                      <div>
                        {skill.tags && skill.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {skill.tags.slice(0, 3).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Progress Bar */}
                        <div className="w-full pt-2 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
                            {expLabel} Experience
                          </span>
                          <div className="w-20 bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-400 h-full rounded-full"
                              style={{ width: `${skill.proficiencyPercent || 90}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredSkills.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Page Size Selector */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
              <span>Show per page:</span>
              {[12, 18, 24, 36].map((size) => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pageSize === size
                      ? 'bg-blue-400 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isCurrent = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                            : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Page Status indicator */}
            <div className="text-xs font-medium text-slate-400 dark:text-zinc-500">
              Page {currentPage} of {totalPages}
            </div>

          </div>
        )}

      </div>

      {/* Skill Inspection Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedSkill(null)}
                className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm">
                  <TechIcon name={selectedSkill.name} size={32} className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      {selectedSkill.category || 'Technology'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {getExperienceDisplay(selectedSkill)} Experience
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white">
                    {selectedSkill.name}
                  </h3>
                </div>
              </div>

              {/* Modal Content */}
              <div className="space-y-4 mb-8">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                    Overview & Use Case
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {selectedSkill.description ||
                      `Production implementation and architecture with ${selectedSkill.name}, optimizing for reliability, throughput, and clean maintainable code.`}
                  </p>
                </div>

                {selectedSkill.tags && selectedSkill.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                      Key Competencies & Patterns
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkill.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/60 dark:border-zinc-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Experience
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {getExperienceDisplay(selectedSkill)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      Proficiency Level
                    </div>
                    <div className="text-base font-bold text-blue-500 dark:text-blue-400">
                      {selectedSkill.proficiencyLevel || 'Expert'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <a
                  href="#projects"
                  onClick={() => setSelectedSkill(null)}
                  className="px-5 py-2.5 rounded-xl bg-blue-400 hover:bg-blue-500 text-slate-950 font-bold text-xs transition-colors"
                >
                  View Related Projects
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};