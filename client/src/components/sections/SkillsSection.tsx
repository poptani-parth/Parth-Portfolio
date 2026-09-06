import React from 'react';
import { motion } from 'motion/react';
import {
    Server,
    Database,
    Code2,
    Sparkles,
    Network,
    Asterisk,
    ArrowUpRight,
    ArrowRight,
    Terminal,
} from 'lucide-react';

import { SkillCategoryDTO, SkillDTO } from '../../types';
import { TechIcon } from '../ui/TechIcons';

interface SkillsSectionProps {
    categories: SkillCategoryDTO[];
    skills?: SkillDTO[];
    onSelectCategory?: (categoryName: string) => void;
}

/**
 * Normalize values before comparing backend data.
 *
 * Handles:
 * - "Languages"
 * - " languages "
 * - null / undefined
 * - numeric IDs
 */
const normalize = (value: unknown): string => {
    return String(value ?? '')
        .trim()
        .toLowerCase();
};

/**
 * Safely extract a category name from different possible
 * backend DTO structures.
 *
 * Supported examples:
 *
 * category: "Languages"
 *
 * category: {
 *   id: 1,
 *   name: "Languages"
 * }
 *
 * categoryName: "Languages"
 */
const getSkillCategoryName = (skill: SkillDTO): string => {
    const skillAny = skill as any;
    const category = skillAny.category;

    if (typeof category === 'string') {
        return category;
    }

    if (category && typeof category === 'object') {
        return (
            category.name ??
            category.categoryName ??
            category.title ??
            ''
        );
    }

    return (
        skillAny.categoryName ??
        skillAny.category_name ??
        ''
    );
};

/**
 * Safely extract category ID from the skill.
 *
 * Supports:
 * - categoryId
 * - category.id
 * - categoryID
 */
const getSkillCategoryId = (skill: SkillDTO): string => {
    const skillAny = skill as any;
    const category = skillAny.category;

    if (category && typeof category === 'object') {
        return String(
            category.id ??
                category.categoryId ??
                ''
        );
    }

    return String(
        skillAny.categoryId ??
            skillAny.categoryID ??
            ''
    );
};

export const SkillsSection: React.FC<SkillsSectionProps> = ({
    categories = [],
    skills = [],
    onSelectCategory,
}) => {
    /**
     * Debug information.
     *
     * Keep these while testing the API integration.
     * Remove them later if desired.
     */
    console.log('SkillsSection - categories:', categories);
    console.log('SkillsSection - skills:', skills);

    const getCategoryTheme = (name: string) => {
        const lower = normalize(name);

        if (lower.includes('framework') || lower.includes('api')) {
            return {
                icon: <Server className="w-6 h-6" />,
                badge: 'Backend Architecture',
                accentBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
                accentText: 'text-emerald-600 dark:text-emerald-400',
                accentBorder: 'hover:border-emerald-500/40',
                accentGlow:
                    'group-hover:shadow-[0_0_24px_rgba(16,185,129,0.12)]',
                colorBar: 'bg-emerald-500',
            };
        }

        if (
            lower.includes('database') ||
            lower.includes('storage')
        ) {
            return {
                icon: <Database className="w-6 h-6" />,
                badge: 'Persistence & Caching',
                accentBg: 'bg-blue-500/10 dark:bg-blue-500/15',
                accentText: 'text-blue-600 dark:text-blue-400',
                accentBorder: 'hover:border-blue-500/40',
                accentGlow:
                    'group-hover:shadow-[0_0_24px_rgba(59,130,246,0.12)]',
                colorBar: 'bg-blue-500',
            };
        }

        if (
            lower.includes('ai') ||
            lower.includes('assistant')
        ) {
            return {
                icon: <Sparkles className="w-6 h-6" />,
                badge: 'AI-Assisted Engineering',
                accentBg: 'bg-purple-500/10 dark:bg-purple-500/15',
                accentText: 'text-purple-600 dark:text-purple-400',
                accentBorder: 'hover:border-purple-500/40',
                accentGlow:
                    'group-hover:shadow-[0_0_24px_rgba(168,85,247,0.12)]',
                colorBar: 'bg-purple-500',
            };
        }

        if (lower.includes('language')) {
            return {
                icon: <Code2 className="w-6 h-6" />,
                badge: 'Core Programming',
                accentBg: 'bg-amber-500/10 dark:bg-amber-500/15',
                accentText: 'text-amber-600 dark:text-amber-400',
                accentBorder: 'hover:border-amber-500/40',
                accentGlow:
                    'group-hover:shadow-[0_0_24px_rgba(245,158,11,0.12)]',
                colorBar: 'bg-amber-500',
            };
        }

        if (
            lower.includes('tool') ||
            lower.includes('platform') ||
            lower.includes('devops')
        ) {
            return {
                icon: <Terminal className="w-6 h-6" />,
                badge: 'Productivity & Tooling',
                accentBg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
                accentText: 'text-cyan-600 dark:text-cyan-400',
                accentBorder: 'hover:border-cyan-500/40',
                accentGlow:
                    'group-hover:shadow-[0_0_24px_rgba(6,182,212,0.12)]',
                colorBar: 'bg-cyan-500',
            };
        }

        return {
            icon: <Network className="w-6 h-6" />,
            badge: 'Systems & Methodologies',
            accentBg: 'bg-rose-500/10 dark:bg-rose-500/15',
            accentText: 'text-rose-600 dark:text-rose-400',
            accentBorder: 'hover:border-rose-500/40',
            accentGlow:
                'group-hover:shadow-[0_0_24px_rgba(244,63,94,0.12)]',
            colorBar: 'bg-rose-500',
        };
    };

    const handleCategoryClick = (categoryName: string) => {
        if (onSelectCategory) {
            onSelectCategory(categoryName);
            return;
        }

        const techSection =
            document.getElementById('tech-stack');

        if (techSection) {
            techSection.scrollIntoView({
                behavior: 'smooth',
            });
        }
    };

    /**
     * Match skills to categories using multiple backend formats.
     *
     * Supported:
     *
     * 1. skill.category = "Languages"
     *
     * 2. skill.categoryName = "Languages"
     *
     * 3. skill.category = {
     *      id: 1,
     *      name: "Languages"
     *    }
     *
     * 4. skill.categoryId = 1
     */
    const getSkillsForCategory = (
        category: SkillCategoryDTO
    ): SkillDTO[] => {
        const categoryName = normalize(category.name);
        const categoryId = String(category.id ?? '');

        return skills.filter((skill) => {
            const skillCategoryName = normalize(
                getSkillCategoryName(skill)
            );

            const skillCategoryId =
                getSkillCategoryId(skill);

            const nameMatches =
                Boolean(categoryName) &&
                Boolean(skillCategoryName) &&
                skillCategoryName === categoryName;

            const idMatches =
                Boolean(categoryId) &&
                Boolean(skillCategoryId) &&
                skillCategoryId === categoryId;

            return nameMatches || idMatches;
        });
    };

    return (
        <section
            id="skills"
            className="py-24 bg-theme-bg relative overflow-hidden"
        >
            {/* Subtle architectural grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header Section */}
                <div className="mb-16">
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                            margin: '-50px',
                        }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <Asterisk className="w-5 h-5 text-blue-400" />

                        <span className="text-[11px] font-bold tracking-widest uppercase text-theme-text-muted">
                            CHECK OUT MY EXPERTISE
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                            margin: '-50px',
                        }}
                        transition={{
                            delay: 0.1,
                        }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold font-['Syne',sans-serif] text-theme-text mb-6"
                    >
                        What I Do?
                    </motion.h2>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                            }}
                            viewport={{
                                once: true,
                                margin: '-50px',
                            }}
                            transition={{
                                delay: 0.2,
                            }}
                            className="text-lg md:text-xl font-medium text-theme-text-secondary max-w-2xl"
                        >
                            Core development areas I focus on —
                            from robust backend services and
                            structured database layers to modern AI
                            tools and architecture.
                        </motion.p>

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                            }}
                            viewport={{
                                once: true,
                                margin: '-50px',
                            }}
                            transition={{
                                delay: 0.3,
                            }}
                            className="flex items-center gap-4 sm:gap-6 shrink-0"
                        >
                            <a
                                href="#tech-stack"
                                className="px-6 py-3 bg-blue-400 hover:bg-blue-500 text-slate-950 font-bold rounded-full transition-all hover:scale-105 shadow-sm"
                            >
                                Explore All Stack
                            </a>

                            <a
                                href="#contact"
                                className="inline-flex items-center gap-2 font-bold text-theme-text hover:text-blue-400 transition-colors"
                            >
                                Let's Talk

                                <ArrowUpRight className="w-5 h-5" />
                            </a>
                        </motion.div>
                    </div>
                </div>

                {/* Empty State */}
                {categories.length === 0 && (
                    <div className="py-16 text-center border border-theme-border rounded-2xl bg-theme-card">
                        <Code2 className="w-10 h-10 mx-auto mb-4 text-theme-text-muted" />

                        <h3 className="text-lg font-semibold text-theme-text mb-2">
                            No skill categories available
                        </h3>

                        <p className="text-sm text-theme-text-muted">
                            Skill data could not be loaded from the
                            backend.
                        </p>
                    </div>
                )}

                {/* Categories Grid */}
                {categories.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((cat, index) => {
                            const theme =
                                getCategoryTheme(cat.name);

                            const categorySkills =
                                getSkillsForCategory(cat);

                            return (
                                <motion.div
                                    key={cat.id ?? index}
                                    initial={{
                                        opacity: 0,
                                        y: 24,
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    viewport={{
                                        once: true,
                                        margin: '-50px',
                                    }}
                                    transition={{
                                        delay: 0.08 * index,
                                        duration: 0.4,
                                    }}
                                    className={`group relative p-7 rounded-2xl border border-slate-200/90 bg-theme-card dark:bg-[#121214] hover:bg-white dark:hover:bg-[#16161a] transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl flex flex-col justify-between ${theme.accentBorder} ${theme.accentGlow}`}
                                >
                                    {/* Top Accent Line */}
                                    <div
                                        className={`absolute top-0 left-8 right-8 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${theme.colorBar}`}
                                    />

                                    <div>
                                        {/* Icon & Category Badge */}
                                        <div className="flex items-center justify-between gap-3 mb-5">
                                            <div
                                                className={`p-3 rounded-xl ${theme.accentBg} ${theme.accentText} transition-transform group-hover:scale-110 duration-200`}
                                            >
                                                {theme.icon}
                                            </div>

                                            <span className="text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full border border-theme-border text-theme-text-muted bg-theme-bg/60">
                                                {theme.badge}
                                            </span>
                                        </div>

                                        {/* Category Title */}
                                        <h3 className="text-2xl font-bold font-['Syne',sans-serif] text-theme-text mb-3 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                                            {cat.name}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-sm text-theme-text-secondary leading-relaxed mb-6">
                                            {cat.description ||
                                                `Specialized engineering in ${cat.name} with production-tested workflows, performance optimization, and reliable delivery.`}
                                        </p>
                                    </div>

                                    {/* Bottom Skills Section */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/60 mt-auto">

                                        {/* Header */}
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-theme-text-muted mb-3 flex items-center justify-between">
                                            <span>
                                                Key Technologies
                                            </span>

                                            <span>
                                                {categorySkills.length > 0
                                                    ? `${categorySkills.length} Tools`
                                                    : 'Featured'}
                                            </span>
                                        </div>

                                        {/* Skill Chips */}
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {categorySkills.length > 0 ? (
                                                categorySkills
                                                    .slice(0, 5)
                                                    .map((skill) => (
                                                        <span
                                                            key={skill.id}
                                                            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-theme-bg dark:bg-zinc-800/80 text-theme-text border border-slate-200/60 dark:border-zinc-700/50 hover:border-blue-400 dark:hover:border-blue-400 transition-colors"
                                                        >
                                                            <TechIcon
                                                                name={
                                                                    skill.name
                                                                }
                                                                size={13}
                                                                className="w-3.5 h-3.5"
                                                            />

                                                            <span>
                                                                {
                                                                    skill.name
                                                                }
                                                            </span>
                                                        </span>
                                                    ))
                                            ) : (
                                                <span className="text-xs text-theme-text-muted italic">
                                                    No technologies found
                                                </span>
                                            )}

                                            {categorySkills.length > 5 && (
                                                <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50">
                                                    +
                                                    {categorySkills.length -
                                                        5}{' '}
                                                    more
                                                </span>
                                            )}
                                        </div>

                                        {/* Action */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleCategoryClick(
                                                    cat.name
                                                )
                                            }
                                            className="w-full flex items-center justify-between text-xs font-bold text-theme-text group-hover:text-blue-500 dark:group-hover:text-blue-400 pt-2 transition-colors cursor-pointer"
                                        >
                                            <span>
                                                View all {cat.name}{' '}
                                                tools
                                            </span>

                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};