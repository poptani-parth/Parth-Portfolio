import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Search,
  LayoutGrid,
  ListFilter,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Briefcase,
} from 'lucide-react';

import {
  motion,
  AnimatePresence,
} from 'motion/react';

import {
  SkillDTO,
  SkillCategoryDTO,
} from '../../types';

import { TechIcon } from '../ui/TechIcons';

/* ============================================================
 * EXTENDED DTO
 * ============================================================ */

export interface ExtendedSkillDTO
  extends SkillDTO {
  description?: string;
  tags?: string[];
  proficiencyPercent?: number;
  proficiencyLevel?: string;

  /*
   * Normalized by usePortfolioData.ts
   */
  yearsExperience?: number;
}

/* ============================================================
 * PROPS
 * ============================================================ */

interface TechStackSectionProps {
  skills: ExtendedSkillDTO[];
  categories: SkillCategoryDTO[];

  selectedCategoryFilter?: string;

  onFilterChange?: (
    category: string
  ) => void;
}

/* ============================================================
 * HELPERS
 * ============================================================ */

const normalize = (
  value: unknown
): string => {
  return String(value ?? '')
    .trim()
    .toLowerCase();
};

const getCategoryName = (
  skill: ExtendedSkillDTO
): string => {
  const raw = skill as any;

  /*
   * category: "Languages"
   */
  if (
    typeof raw.category ===
    'string'
  ) {
    return raw.category.trim();
  }

  /*
   * category: {
   *   id: 1,
   *   name: "Languages"
   * }
   */
  if (
    raw.category &&
    typeof raw.category ===
      'object'
  ) {
    return String(
      raw.category.name ??
        raw.category.categoryName ??
        raw.category.title ??
        ''
    ).trim();
  }

  /*
   * categoryName
   */
  if (
    raw.categoryName != null
  ) {
    return String(
      raw.categoryName
    ).trim();
  }

  /*
   * category_name
   */
  if (
    raw.category_name != null
  ) {
    return String(
      raw.category_name
    ).trim();
  }

  return '';
};

const getExperienceYears = (
  skill: ExtendedSkillDTO
): number => {
  const raw = skill as any;

  const value =
    raw.yearsExperience ??
    raw.yearsOfExperience ??
    raw.experienceYears ??
    raw.experience ??
    0;

  const number = Number(value);

  return Number.isFinite(number)
    ? Math.max(0, number)
    : 0;
};

const getProficiency = (
  skill: ExtendedSkillDTO
): number => {
  const raw = skill as any;

  const value =
    raw.proficiencyPercent ??
    raw.knowledgePercentage ??
    raw.proficiency ??
    raw.percentage ??
    0;

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, number)
  );
};

const getOverview = (
  skill: ExtendedSkillDTO
): string => {
  const raw = skill as any;

  return String(
    raw.description ??
      raw.overview ??
      ''
  ).trim();
};

const getExperienceDisplay = (
  skill: ExtendedSkillDTO
): string => {
  const years =
    getExperienceYears(skill);

  if (years <= 0) {
    return 'Experience not set';
  }

  /*
   * Display backend value exactly.
   *
   * No hard-coded fake experience.
   */
  if (
    Number.isInteger(years)
  ) {
    return `${years}+ Yrs`;
  }

  return `${years}+ Yrs`;
};

/* ============================================================
 * COMPONENT
 * ============================================================ */

export const TechStackSection: React.FC<
  TechStackSectionProps
> = ({
  skills = [],
  categories = [],
  selectedCategoryFilter,
  onFilterChange,
}) => {
  const [
    activeCategory,
    setActiveCategory,
  ] = useState<string>(
    selectedCategoryFilter ||
      'ALL'
  );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

  const [
    viewMode,
    setViewMode,
  ] = useState<
    'grid' | 'pills'
  >('pills');

  const [
    selectedSkill,
    setSelectedSkill,
  ] =
    useState<ExtendedSkillDTO | null>(
      null
    );

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    pageSize,
    setPageSize,
  ] = useState(18);

  /* ==========================================================
   * SYNC EXTERNAL FILTER
   * ========================================================== */

  useEffect(() => {
    if (
      selectedCategoryFilter
    ) {
      setActiveCategory(
        selectedCategoryFilter
      );

      setCurrentPage(1);
    }
  }, [
    selectedCategoryFilter,
  ]);

  /* ==========================================================
   * DEBUG
   * ========================================================== */

  useEffect(() => {
    console.log(
      '[TechStackSection] Skills:',
      skills
    );

    console.log(
      '[TechStackSection] Categories:',
      categories
    );
  }, [
    skills,
    categories,
  ]);

  /* ==========================================================
   * CATEGORY TABS
   * ========================================================== */

  const categoryTabs =
    useMemo(() => {
      const counts: Record<
        string,
        number
      > = {
        ALL: skills.length,
      };

      skills.forEach(
        (skill) => {
          const category =
            getCategoryName(skill);

          if (!category) {
            return;
          }

          const key =
            normalize(category);

          counts[key] =
            (counts[key] || 0) + 1;
        }
      );

      /*
       * Prefer backend-derived categories,
       * but safely fall back to categories
       * derived from skills.
       */
      const categoryNames =
        categories.length > 0
          ? categories
              .map(
                (category) =>
                  category.name
              )
              .filter(Boolean)
          : Array.from(
              new Set(
                skills
                  .map(
                    getCategoryName
                  )
                  .filter(Boolean)
              )
            );

      const uniqueNames =
        Array.from(
          new Set(
            categoryNames
          )
        );

      return [
        {
          id: 'ALL',
          name: 'All Technologies',
          count: skills.length,
        },

        ...uniqueNames.map(
          (name) => ({
            id: name,
            name,
            count:
              counts[
                normalize(name)
              ] || 0,
          })
        ),
      ];
    }, [
      skills,
      categories,
    ]);

  /* ==========================================================
   * FILTER
   * ========================================================== */

  const filteredSkills =
    useMemo(() => {
      const search =
        normalize(
          searchQuery
        );

      return skills.filter(
        (skill) => {
          const category =
            getCategoryName(
              skill
            );

          const matchesCategory =
            activeCategory ===
              'ALL' ||
            normalize(
              category
            ) ===
              normalize(
                activeCategory
              );

          if (!matchesCategory) {
            return false;
          }

          if (!search) {
            return true;
          }

          const name =
            normalize(
              skill.name
            );

          const overview =
            normalize(
              getOverview(
                skill
              )
            );

          const tags =
            Array.isArray(
              (skill as any)
                .tags
            )
              ? (
                  (skill as any)
                    .tags as string[]
                )
                  .map(normalize)
                  .join(' ')
              : '';

          return (
            name.includes(search) ||
            normalize(
              category
            ).includes(search) ||
            overview.includes(
              search
            ) ||
            tags.includes(search)
          );
        }
      );
    }, [
      skills,
      activeCategory,
      searchQuery,
    ]);

  /* ==========================================================
   * PAGINATION
   * ========================================================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeCategory,
    searchQuery,
    pageSize,
  ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredSkills.length /
          pageSize
      )
    );

  /*
   * Prevent invalid page after
   * filtering/deleting skills.
   */
  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const paginatedSkills =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        pageSize;

      return filteredSkills.slice(
        start,
        start + pageSize
      );
    }, [
      filteredSkills,
      currentPage,
      pageSize,
    ]);

  const startIndex =
    filteredSkills.length ===
    0
      ? 0
      : (currentPage - 1) *
          pageSize +
        1;

  const endIndex = Math.min(
    currentPage * pageSize,
    filteredSkills.length
  );

  /* ==========================================================
   * TAB HANDLER
   * ========================================================== */

  const handleTabClick = (
    category: string
  ) => {
    setActiveCategory(
      category
    );

    setCurrentPage(1);

    onFilterChange?.(
      category
    );
  };

  /* ==========================================================
   * MARQUEE
   *
   * Visual-only content.
   * It does NOT control actual skill data.
   * ========================================================== */

  const marqueeKeywords = [
    'Spring Boot',
    'Java',
    'PostgreSQL',
    'Claude AI',
    'Supabase',
    'Redis',
    'RESTful APIs',
    'Docker',
    'Maven',
    'JWT',
    'Postman',
  ];

  /* ==========================================================
   * RENDER
   * ========================================================== */

  return (
    <section
      id="skills"
      className="
        py-24
        bg-theme-card
        dark:bg-[#0c0c0e]
        relative
        overflow-hidden
      "
    >
      {/* ======================================================
          MARQUEE
      ====================================================== */}

      <div
        className="
          w-full
          overflow-hidden
          py-3
          border-y
          border-slate-200/70
          dark:border-zinc-800/70
          bg-theme-bg/60
          mb-16
          select-none
        "
      >
        <div className="flex whitespace-nowrap animate-marquee">
          {[
            ...marqueeKeywords,
            ...marqueeKeywords,
          ].map(
            (
              item,
              index
            ) => (
              <span
                key={`${item}-${index}`}
                className="
                  mx-6
                  text-xs
                  font-bold
                  tracking-wider
                  uppercase
                  text-theme-text-muted
                  flex
                  items-center
                  gap-2
                "
              >
                <TechIcon
                  name={item}
                  size={14}
                  className="w-3.5 h-3.5"
                />

                <span>
                  {item}
                </span>

                <span className="text-blue-400 ml-3">
                  •
                </span>
              </span>
            )
          )}
        </div>
      </div>

      {/* ======================================================
          MAIN CONTAINER
      ====================================================== */}

      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="
          mb-12
          text-center
          max-w-3xl
          mx-auto
        ">
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="
              inline-flex
              items-center
              gap-2
              px-3.5
              py-1.5
              rounded-full
              border
              border-blue-200
              dark:border-blue-900/60
              bg-blue-50/80
              dark:bg-blue-950/40
              text-blue-600
              dark:text-blue-400
              text-xs
              font-bold
              tracking-wide
              uppercase
              mb-4
            "
          >
            <Sparkles className="w-3.5 h-3.5" />

            <span>
              Interactive Tech Matrix
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
            }}
            transition={{
              delay: 0.1,
            }}
            className="
              text-4xl
              md:text-5xl
              lg:text-6xl
              font-bold
              font-['Syne',sans-serif]
              text-theme-text
              mb-4
            "
          >
            Skills & Tools
          </motion.h2>

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
            }}
            transition={{
              delay: 0.2,
            }}
            className="
              text-lg
              text-theme-text-secondary
              font-medium
            "
          >
            A comprehensive look at
            the languages, frameworks,
            databases, and developer
            tooling I utilize daily.
          </motion.p>
        </div>

        {/* ====================================================
            CONTROLS
        ==================================================== */}

        <div className="mb-10 space-y-4">
          <div
            className="
              flex
              flex-col
              sm:flex-row
              items-center
              justify-between
              gap-4
            "
          >
            {/* SEARCH */}

            <div
              className="
                relative
                w-full
                sm:w-80
              "
            >
              <Search
                className="
                  w-4
                  h-4
                  text-theme-text-muted
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                "
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="
                  Search tools, e.g. Java,
                  Spring, PostgreSQL...
                "
                className="
                  w-full
                  pl-10
                  pr-10
                  py-2.5
                  rounded-xl
                  border
                  border-theme-border
                  bg-theme-bg
                  text-theme-text
                  text-sm
                  placeholder-slate-400
                  dark:placeholder-zinc-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-400/40
                  focus:border-blue-400
                  transition-all
                "
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery('')
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-theme-text-muted
                  "
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* RESULT COUNT + VIEW */}

            <div
              className="
                flex
                items-center
                justify-between
                sm:justify-end
                w-full
                sm:w-auto
                gap-4
              "
            >
              <span
                className="
                  text-xs
                  font-semibold
                  text-theme-text-muted
                "
              >
                {filteredSkills.length >
                0 ? (
                  <>
                    Showing{' '}
                    <strong className="text-theme-text">
                      {startIndex}-
                      {endIndex}
                    </strong>{' '}
                    of{' '}
                    {
                      filteredSkills.length
                    }
                  </>
                ) : (
                  '0 results'
                )}
              </span>

              <div
                className="
                  flex
                  items-center
                  p-1
                  rounded-xl
                  bg-theme-bg
                  border
                  border-theme-border
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setViewMode(
                      'pills'
                    )
                  }
                  className={`
                    flex
                    items-center
                    gap-1.5
                    px-3
                    py-1.5
                    rounded-lg
                    text-xs
                    font-bold
                    transition-all
                    ${
                      viewMode ===
                      'pills'
                        ? 'bg-theme-card dark:bg-zinc-800 text-theme-text shadow-sm'
                        : 'text-theme-text-muted'
                    }
                  `}
                >
                  <ListFilter className="w-3.5 h-3.5" />

                  <span>
                    Compact Cloud
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setViewMode(
                      'grid'
                    )
                  }
                  className={`
                    flex
                    items-center
                    gap-1.5
                    px-3
                    py-1.5
                    rounded-lg
                    text-xs
                    font-bold
                    transition-all
                    ${
                      viewMode ===
                      'grid'
                        ? 'bg-theme-card dark:bg-zinc-800 text-theme-text shadow-sm'
                        : 'text-theme-text-muted'
                    }
                  `}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />

                  <span>
                    Detailed Grid
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ==================================================
              CATEGORY FILTERS
          ================================================== */}

          <div
            className="
              flex
              items-center
              gap-2
              overflow-x-auto
              pb-2
              scrollbar-none
            "
          >
            {categoryTabs.map(
              (tab) => {
                const isActive =
                  normalize(
                    activeCategory
                  ) ===
                  normalize(
                    tab.id
                  );

                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() =>
                      handleTabClick(
                        tab.id
                      )
                    }
                    className={`
                      shrink-0
                      flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      rounded-xl
                      text-xs
                      font-bold
                      transition-all
                      cursor-pointer
                      ${
                        isActive
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                          : 'bg-theme-bg text-theme-text-secondary border border-theme-border hover:bg-slate-200/60 dark:hover:bg-zinc-800'
                      }
                    `}
                  >
                    <span>
                      {tab.name}
                    </span>

                    <span
                      className={`
                        px-1.5
                        py-0.5
                        rounded-md
                        text-[10px]
                        font-bold
                        ${
                          isActive
                            ? 'bg-white/20 dark:bg-slate-900/20'
                            : 'bg-slate-200 dark:bg-zinc-800 text-theme-text-muted'
                        }
                      `}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {filteredSkills.length ===
          0 && (
          <div
            className="
              text-center
              py-16
              px-4
              border
              border-dashed
              border-theme-border
              rounded-2xl
              bg-theme-bg/50
            "
          >
            <Search
              className="
                w-8
                h-8
                text-theme-text-muted
                mx-auto
                mb-3
              "
            />

            <h4
              className="
                text-base
                font-bold
                text-theme-text
                mb-1
              "
            >
              No matching technologies
              found
            </h4>

            <p
              className="
                text-xs
                text-theme-text-muted
                mb-4
              "
            >
              Try searching with a
              different term or resetting
              the category filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory(
                  'ALL'
                );

                onFilterChange?.(
                  'ALL'
                );
              }}
              className="
                px-4
                py-2
                rounded-lg
                bg-blue-500
                text-white
                text-xs
                font-bold
                hover:bg-blue-600
                transition-colors
              "
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ====================================================
            COMPACT CLOUD
        ==================================================== */}

        {viewMode ===
          'pills' &&
          filteredSkills.length >
            0 && (
            <div className="py-4">
              <motion.div
                layout
                className="
                  flex
                  flex-wrap
                  justify-center
                  gap-3
                  py-4
                "
              >
                <AnimatePresence
                  mode="popLayout"
                >
                  {paginatedSkills.map(
                    (
                      skill,
                      index
                    ) => {
                      const experience =
                        getExperienceDisplay(
                          skill
                        );

                      return (
                        <motion.button
                          type="button"
                          key={
                            skill.id ??
                            `${skill.name}-${index}`
                          }
                          layout
                          initial={{
                            opacity: 0,
                            scale: 0.92,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.92,
                            y: -10,
                          }}
                          transition={{
                            duration:
                              0.2,
                            delay:
                              0.015 *
                              (index %
                                18),
                          }}
                          onClick={() =>
                            setSelectedSkill(
                              skill
                            )
                          }
                          className="
                            group
                            px-4
                            py-2.5
                            rounded-xl
                            border
                            border-theme-border
                            bg-theme-bg
                            hover:bg-white
                            dark:hover:bg-zinc-800
                            hover:border-blue-400/80
                            hover:shadow-md
                            transition-all
                            duration-200
                            flex
                            items-center
                            gap-2.5
                            cursor-pointer
                            hover:-translate-y-0.5
                          "
                        >
                          <div
                            className="
                              p-1
                              rounded-lg
                              bg-theme-card
                              dark:bg-zinc-800
                              border
                              border-slate-200/60
                              dark:border-zinc-700/60
                            "
                          >
                            <TechIcon
                              name={
                                skill.name
                              }
                              size={16}
                              className="w-4 h-4"
                            />
                          </div>

                          <span
                            className="
                              text-sm
                              font-bold
                              text-theme-text
                              group-hover:text-blue-500
                              dark:group-hover:text-blue-400
                              transition-colors
                            "
                          >
                            {
                              skill.name
                            }
                          </span>

                          <span
                            className="
                              text-[10px]
                              font-semibold
                              tracking-tight
                              text-theme-text-muted
                              px-2
                              py-0.5
                              rounded-full
                              bg-slate-200/70
                              dark:bg-zinc-800
                              border
                              border-slate-200/80
                              dark:border-zinc-700/60
                            "
                          >
                            {
                              experience
                            }
                          </span>
                        </motion.button>
                      );
                    }
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

        {/* ====================================================
            DETAILED GRID
        ==================================================== */}

        {viewMode ===
          'grid' &&
          filteredSkills.length >
            0 && (
            <div className="py-4">
              <motion.div
                layout
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                  gap-4
                "
              >
                <AnimatePresence
                  mode="popLayout"
                >
                  {paginatedSkills.map(
                    (
                      skill,
                      index
                    ) => {
                      const proficiency =
                        getProficiency(
                          skill
                        );

                      const experience =
                        getExperienceDisplay(
                          skill
                        );

                      const overview =
                        getOverview(
                          skill
                        );

                      const category =
                        getCategoryName(
                          skill
                        );

                      return (
                        <motion.button
                          type="button"
                          key={
                            skill.id ??
                            `${skill.name}-${index}`
                          }
                          layout
                          initial={{
                            opacity: 0,
                            scale: 0.95,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.95,
                          }}
                          transition={{
                            duration:
                              0.25,
                          }}
                          onClick={() =>
                            setSelectedSkill(
                              skill
                            )
                          }
                          className="
                            text-left
                            group
                            p-5
                            rounded-2xl
                            border
                            border-theme-border
                            bg-theme-bg
                            hover:bg-white
                            dark:hover:bg-zinc-900
                            hover:border-blue-400/60
                            hover:shadow-lg
                            transition-all
                            duration-300
                            cursor-pointer
                          "
                        >
                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-3
                              mb-4
                            "
                          >
                            <div
                              className="
                                p-2.5
                                rounded-xl
                                bg-theme-card
                                dark:bg-zinc-800
                                border
                                border-theme-border
                                text-blue-400
                              "
                            >
                              <TechIcon
                                name={
                                  skill.name
                                }
                                size={20}
                                className="w-5 h-5"
                              />
                            </div>

                            <span
                              className="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wider
                                text-theme-text-muted
                                px-2
                                py-1
                                rounded-full
                                bg-theme-card
                                border
                                border-theme-border
                              "
                            >
                              {
                                category
                              }
                            </span>
                          </div>

                          <h3
                            className="
                              text-lg
                              font-bold
                              text-theme-text
                              mb-2
                              group-hover:text-blue-400
                              transition-colors
                            "
                          >
                            {
                              skill.name
                            }
                          </h3>

                          {overview && (
                            <p
                              className="
                                text-xs
                                leading-relaxed
                                text-theme-text-secondary
                                line-clamp-3
                                mb-4
                              "
                            >
                              {
                                overview
                              }
                            </p>
                          )}

                          <div className="space-y-3">
                            {/* Proficiency */}

                            <div>
                              <div
                                className="
                                  flex
                                  justify-between
                                  items-center
                                  mb-1.5
                                "
                              >
                                <span
                                  className="
                                    text-[10px]
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    text-theme-text-muted
                                  "
                                >
                                  Proficiency
                                </span>

                                <span
                                  className="
                                    text-xs
                                    font-bold
                                    text-blue-400
                                  "
                                >
                                  {
                                    proficiency
                                  }
                                  %
                                </span>
                              </div>

                              <div
                                className="
                                  h-1.5
                                  rounded-full
                                  bg-slate-200
                                  dark:bg-zinc-800
                                  overflow-hidden
                                "
                              >
                                <div
                                  className="
                                    h-full
                                    rounded-full
                                    bg-blue-500
                                    transition-all
                                  "
                                  style={{
                                    width: `${proficiency}%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Experience */}

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                text-xs
                                text-theme-text-muted
                              "
                            >
                              <Clock className="w-3.5 h-3.5" />

                              <span>
                                {
                                  experience
                                }
                              </span>
                            </div>
                          </div>
                        </motion.button>
                      );
                    }
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

        {/* ====================================================
            PAGINATION
        ==================================================== */}

        {filteredSkills.length >
          pageSize && (
          <div
            className="
              mt-8
              flex
              flex-col
              sm:flex-row
              items-center
              justify-between
              gap-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                text-theme-text-muted
              "
            >
              <span>
                Page
              </span>

              <strong className="text-theme-text">
                {currentPage}
              </strong>

              <span>
                of
              </span>

              <strong className="text-theme-text">
                {totalPages}
              </strong>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <button
                type="button"
                disabled={
                  currentPage <= 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
                className="
                  inline-flex
                  items-center
                  gap-1
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-theme-border
                  bg-theme-bg
                  text-xs
                  font-semibold
                  text-theme-text
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                <ChevronLeft className="w-4 h-4" />

                Previous
              </button>

              <button
                type="button"
                disabled={
                  currentPage >=
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
                className="
                  inline-flex
                  items-center
                  gap-1
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-theme-border
                  bg-theme-bg
                  text-xs
                  font-semibold
                  text-theme-text
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                Next

                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          SKILL DETAIL MODAL
      ====================================================== */}

      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              p-4
              bg-black/70
              backdrop-blur-sm
            "
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setSelectedSkill(
                null
              )
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
              className="
                w-full
                max-w-xl
                rounded-2xl
                border
                border-theme-border
                bg-theme-card
                dark:bg-[#121214]
                shadow-2xl
                overflow-hidden
              "
            >
              {/* Modal Header */}

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                  p-6
                  border-b
                  border-theme-border
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-4
                  "
                >
                  <div
                    className="
                      p-3
                      rounded-xl
                      bg-blue-500/10
                      text-blue-400
                      border
                      border-blue-500/20
                    "
                  >
                    <TechIcon
                      name={
                        selectedSkill.name
                      }
                      size={28}
                      className="w-7 h-7"
                    />
                  </div>

                  <div>
                    <h3
                      className="
                        text-xl
                        font-bold
                        text-theme-text
                      "
                    >
                      {
                        selectedSkill.name
                      }
                    </h3>

                    <p
                      className="
                        text-xs
                        text-theme-text-muted
                        mt-1
                      "
                    >
                      {
                        getCategoryName(
                          selectedSkill
                        ) ||
                        'General'
                      }
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedSkill(
                      null
                    )
                  }
                  className="
                    p-2
                    rounded-lg
                    text-theme-text-muted
                    hover:text-theme-text
                    hover:bg-theme-bg
                  "
                  aria-label="Close skill details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}

              <div className="p-6 space-y-6">
                {/* Overview */}

                {getOverview(
                  selectedSkill
                ) && (
                  <div>
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        mb-2
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                        text-theme-text-muted
                      "
                    >
                      <Briefcase className="w-3.5 h-3.5" />

                      Overview
                    </div>

                    <p
                      className="
                        text-sm
                        leading-relaxed
                        text-theme-text-secondary
                      "
                    >
                      {
                        getOverview(
                          selectedSkill
                        )
                      }
                    </p>
                  </div>
                )}

                {/* Stats */}

                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-3
                  "
                >
                  <div
                    className="
                      p-4
                      rounded-xl
                      bg-theme-bg
                      border
                      border-theme-border
                    "
                  >
                    <div
                      className="
                        text-[10px]
                        uppercase
                        tracking-wider
                        text-theme-text-muted
                        mb-1
                      "
                    >
                      Experience
                    </div>

                    <div
                      className="
                        text-lg
                        font-bold
                        text-theme-text
                      "
                    >
                      {
                        getExperienceDisplay(
                          selectedSkill
                        )
                      }
                    </div>
                  </div>

                  <div
                    className="
                      p-4
                      rounded-xl
                      bg-theme-bg
                      border
                      border-theme-border
                    "
                  >
                    <div
                      className="
                        text-[10px]
                        uppercase
                        tracking-wider
                        text-theme-text-muted
                        mb-1
                      "
                    >
                      Proficiency
                    </div>

                    <div
                      className="
                        text-lg
                        font-bold
                        text-blue-400
                      "
                    >
                      {
                        getProficiency(
                          selectedSkill
                        )
                      }
                      %
                    </div>
                  </div>
                </div>

                {/* Proficiency Bar */}

                <div>
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      mb-2
                    "
                  >
                    <span
                      className="
                        text-xs
                        font-semibold
                        text-theme-text-muted
                      "
                    >
                      Knowledge Level
                    </span>

                    <span
                      className="
                        text-xs
                        font-bold
                        text-blue-400
                      "
                    >
                      {
                        getProficiency(
                          selectedSkill
                        )
                      }
                      %
                    </span>
                  </div>

                  <div
                    className="
                      h-2
                      rounded-full
                      overflow-hidden
                      bg-slate-200
                      dark:bg-zinc-800
                    "
                  >
                    <div
                      className="
                        h-full
                        rounded-full
                        bg-blue-500
                      "
                      style={{
                        width: `${
                          getProficiency(
                            selectedSkill
                          )
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Tags */}

                {Array.isArray(
                  (
                    selectedSkill as any
                  ).tags
                ) &&
                  (
                    selectedSkill as any
                  ).tags.length >
                    0 && (
                    <div>
                      <div
                        className="
                          text-[10px]
                          uppercase
                          tracking-wider
                          font-bold
                          text-theme-text-muted
                          mb-2
                        "
                      >
                        Tags
                      </div>

                      <div className="
                        flex
                        flex-wrap
                        gap-2
                      ">
                        {(
                          (
                            selectedSkill as any
                          ).tags as string[]
                        ).map(
                          (
                            tag,
                            index
                          ) => (
                            <span
                              key={`${tag}-${index}`}
                              className="
                                px-2.5
                                py-1
                                rounded-lg
                                bg-theme-bg
                                border
                                border-theme-border
                                text-xs
                                text-theme-text-secondary
                              "
                            >
                              {
                                tag
                              }
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};