import { useState, useEffect, useCallback, useMemo } from "react";

import {
  ProfileDTO,
  SkillDTO,
  SkillCategoryDTO,
  ProjectDTO,
  ExperienceDTO,
  EducationDTO,
  MediaAssetDTO,
} from "../types";

export interface QueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/* ============================================================
 * Generic Query Hook
 * ============================================================ */

const createQueryHook = <T>(endpoint: string, fallback: T | null = null) => {
  return (): QueryResult<T> => {
    const [data, setData] = useState<T | null>(fallback);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isError, setIsError] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(async () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`,
          );
        }

        const json = (await response.json()) as T;

        setData(json);
      } catch (err: unknown) {
        setIsError(true);

        setError(
          err instanceof Error ? err : new Error("Network query failure"),
        );
      } finally {
        setIsLoading(false);
      }
    }, [endpoint]);

    useEffect(() => {
      void execute();
    }, [execute]);

    return {
      data,
      isLoading,
      isError,
      error,
      refetch: execute,
    };
  };
};

/* ============================================================
 * PROFILE
 * ============================================================ */

export const useProfile = createQueryHook<ProfileDTO>("/api/profile");

/* ============================================================
 * SKILLS
 *
 * Backend can potentially return:
 *
 * category: "Languages"
 *
 * OR
 *
 * category: {
 *   id: 1,
 *   name: "Languages"
 * }
 *
 * OR:
 *
 * categoryName: "Languages"
 *
 * The frontend normalizes all of these.
 * ============================================================ */

export interface NormalizedSkillDTO extends SkillDTO {
  category: string;
  yearsExperience: number;
  proficiencyPercent: number;
  proficiencyLevel?: string;
  description?: string;
  tags?: string[];
}

const normalizeCategory = (skill: any): string => {
  if (!skill) {
    return "";
  }

  // category = "Languages"
  if (typeof skill.category === "string") {
    return skill.category.trim();
  }

  // category = { id: 1, name: "Languages" }
  if (skill.category && typeof skill.category === "object") {
    return String(
      skill.category.name ??
        skill.category.categoryName ??
        skill.category.title ??
        "",
    ).trim();
  }

  // categoryName
  if (skill.categoryName != null) {
    return String(skill.categoryName).trim();
  }

  // category_name
  if (skill.category_name != null) {
    return String(skill.category_name).trim();
  }

  return "";
};

const normalizeNumber = (value: unknown, fallback = 0): number => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const normalizeSkill = (rawSkill: any): NormalizedSkillDTO => {
  const category = normalizeCategory(rawSkill);

  const yearsExperience = normalizeNumber(
    rawSkill.yearsExperience ??
      rawSkill.yearsOfExperience ??
      rawSkill.experienceYears ??
      rawSkill.experience,
    0,
  );

  const proficiencyPercent = Math.min(
    100,
    Math.max(
      0,
      normalizeNumber(
        rawSkill.proficiencyPercent ??
          rawSkill.knowledgePercentage ??
          rawSkill.proficiency ??
          rawSkill.percentage,
        0,
      ),
    ),
  );

  const description = rawSkill.description ?? rawSkill.overview ?? "";

  const tags = Array.isArray(rawSkill.tags) ? rawSkill.tags : [];

  return {
    ...rawSkill,

    category,

    yearsExperience,

    proficiencyPercent,

    proficiencyLevel:
      rawSkill.proficiencyLevel ?? rawSkill.proficiency_level ?? undefined,

    description: String(description),

    tags,
  } as NormalizedSkillDTO;
};

export const useSkills = (): QueryResult<{
    skills: SkillDTO[];
    categories: SkillCategoryDTO[];
}> => {
    const [data, setData] = useState<{
        skills: SkillDTO[];
        categories: SkillCategoryDTO[];
    } | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isError, setIsError] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(async () => {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        try {
            const response = await fetch('/api/skills', {
                headers: {
                    Accept: 'application/json',
                },
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch skills: ${response.status} ${response.statusText}`
                );
            }

            const json = await response.json();

            /*
             * Backend response:
             *
             * [
             *   {
             *     category: "Languages",
             *     skills: [
             *       {
             *         id: "...",
             *         name: "Java",
             *         category: "Languages",
             *         description: "...",
             *         yearsExperience: 1,
             *         proficiencyPercent: 85,
             *         proficiencyLevel: "Advanced"
             *       }
             *     ]
             *   }
             * ]
             *
             * Normalize this grouped response into:
             *
             * skills: SkillDTO[]
             * categories: SkillCategoryDTO[]
             */

            if (!Array.isArray(json)) {
                throw new Error(
                    'Invalid skills API response: expected an array'
                );
            }

            const groups = json as Array<{
                category?: string;
                skills?: Array<SkillDTO & {
                    description?: string;
                    yearsExperience?: number;
                    proficiencyPercent?: number;
                    proficiencyLevel?: string;
                }>;
            }>;

            const categories: SkillCategoryDTO[] = groups
                .filter(
                    (group) =>
                        typeof group.category === 'string' &&
                        group.category.trim().length > 0
                )
                .map((group, index) => ({
                    id: `cat-${index + 1}`,
                    name: group.category!.trim(),
                    displayOrder: index + 1,
                }));

            const skills: SkillDTO[] = groups.flatMap((group) => {
                if (!Array.isArray(group.skills)) {
                    return [];
                }

                return group.skills.map((skill) => ({
                    ...skill,

                    /*
                     * Make sure category always exists.
                     * The backend already provides it, but using
                     * the group category makes the mapping robust.
                     */
                    category:
                        skill.category?.trim() ||
                        group.category?.trim() ||
                        '',

                    active: skill.active !== false,
                }));
            });

            const activeSkills = skills.filter(
                (skill) => skill.active !== false
            );

            console.log('Skills API raw response:', json);
            console.log('Skills normalized:', activeSkills);
            console.log('Skill categories normalized:', categories);

            setData({
                skills: activeSkills,
                categories,
            });
        } catch (err: unknown) {
            setIsError(true);

            setError(
                err instanceof Error
                    ? err
                    : new Error('Skills loading failure')
            );

            setData({
                skills: [],
                categories: [],
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        execute();
    }, [execute]);

    return {
        data,
        isLoading,
        isError,
        error,
        refetch: execute,
    };
};
/* ============================================================
 * EXPERIENCE
 * ============================================================ */

export const useExperience = createQueryHook<ExperienceDTO[]>(
  "/api/experience",
  [],
);

/* ============================================================
 * EDUCATION
 * ============================================================ */

export const useEducation = createQueryHook<EducationDTO[]>(
  "/api/education",
  [],
);

/* ============================================================
 * PROJECTS
 * ============================================================ */

interface ProjectFilterOptions {
  category?: string;
  tech?: string;
}

export const useProjects = (
  options?: ProjectFilterOptions,
): QueryResult<ProjectDTO[]> => {
  const [rawProjects, setRawProjects] = useState<ProjectDTO[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isError, setIsError] = useState<boolean>(false);

  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load projects: ${response.status}`);
      }

      const json = await response.json();

      setRawProjects(
        Array.isArray(json)
          ? json.filter((project) => project.active !== false)
          : [],
      );
    } catch (err: unknown) {
      setIsError(true);

      setError(
        err instanceof Error ? err : new Error("Failed to load projects"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void execute();
  }, [execute]);

  const filteredData = useMemo(() => {
    let result = rawProjects;

    if (options?.category && options.category !== "All") {
      result = result.filter(
        (project) =>
          project.category?.toLowerCase() === options.category?.toLowerCase(),
      );
    }

    if (options?.tech) {
      result = result.filter((project) =>
        project.technologies?.some(
          (technology) =>
            technology.toLowerCase() === options.tech?.toLowerCase(),
        ),
      );
    }

    return result;
  }, [rawProjects, options?.category, options?.tech]);

  return {
    data: filteredData,
    isLoading,
    isError,
    error,
    refetch: execute,
  };
};

/* ============================================================
 * SINGLE PROJECT
 * ============================================================ */

export const useProject = (idOrSlug: string): QueryResult<ProjectDTO> => {
  const [data, setData] = useState<ProjectDTO | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isError, setIsError] = useState<boolean>(false);

  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    if (!idOrSlug) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(idOrSlug)}`,
        {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const listResponse = await fetch("/api/projects", {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (listResponse.ok) {
          const list = await listResponse.json();

          const match = Array.isArray(list)
            ? list.find(
                (project) =>
                  project.id === idOrSlug || project.slug === idOrSlug,
              )
            : null;

          if (match) {
            setData(match);
            return;
          }
        }

        throw new Error("Project spec not found");
      }

      const json = await response.json();

      setData(json);
    } catch (err: unknown) {
      setIsError(true);

      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load project details"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [idOrSlug]);

  useEffect(() => {
    void execute();
  }, [execute]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: execute,
  };
};

/* ============================================================
 * MEDIA
 * ============================================================ */

export const useMedia = createQueryHook<MediaAssetDTO[]>("/api/media", []);

/* ============================================================
 * CONTACT
 * ============================================================ */

export const useContactMutation = () => {
  const [isPending, setIsPending] = useState(false);

  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ message?: string }> => {
    setIsPending(true);
    setIsError(false);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      let json: {
        message?: string;
        error?: string;
      } | null = null;

      try {
        json = await response.json();
      } catch {
        json = null;
      }

      if (!response.ok) {
        const message =
          json?.message || json?.error || "Message dispatch failed";

        throw new Error(message);
      }

      return (
        json || {
          message: "Message sent successfully",
        }
      );
    } catch (err: unknown) {
      const normalizedError =
        err instanceof Error ? err : new Error("Message dispatch failed");

      setIsError(true);
      setError(normalizedError);

      throw normalizedError;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutateAsync,
    isPending,
    isError,
    error,
  };
};
