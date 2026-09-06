import { useState, useEffect, useCallback, useMemo } from'react';
import {
 ProfileDTO,
 SkillDTO,
 SkillCategoryDTO,
 ProjectDTO,
 ExperienceDTO,
 EducationDTO,
 MediaAssetDTO,
} from'../types';

export interface QueryResult<T> {
 data: T | null;
 isLoading: boolean;
 isError: boolean;
 error: Error | null;
 refetch: () => Promise<void>;
}

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
 const res = await fetch(endpoint, {
 headers: { Accept:'application/json' },
 cache:'default',
 });
 if (!res.ok) {
 throw new Error(`Failed to fetch from ${endpoint}: ${res.statusText}`);
 }
 const json = (await res.json()) as T;
 setData(json);
 } catch (err: unknown) {
 setIsError(true);
 setError(err instanceof Error ? err : new Error('Network query failure'));
 } finally {
 setIsLoading(false);
 }
 }, [endpoint]);

 useEffect(() => {
 execute();
 }, [execute]);

 return { data, isLoading, isError, error, refetch: execute };
 };
};

export const useProfile = createQueryHook<ProfileDTO>('/api/profile');

export const useSkills = (): QueryResult<{ skills: SkillDTO[]; categories: SkillCategoryDTO[] }> => {
 const [data, setData] = useState<{ skills: SkillDTO[]; categories: SkillCategoryDTO[] } | null>(null);
 const [isLoading, setIsLoading] = useState<boolean>(true);
 const [isError, setIsError] = useState<boolean>(false);
 const [error, setError] = useState<Error | null>(null);

 const execute = useCallback(async () => {
 setIsLoading(true);
 setIsError(false);
 setError(null);
 try {
 const skillsRes = await fetch('/api/skills', { headers: { Accept:'application/json' } });

 if (!skillsRes.ok) {
 throw new Error('Failed to fetch skills');
 }

 const skillsJson: SkillDTO[] = await skillsRes.json();

 const uniqueCategories = Array.from(
 new Set(skillsJson.map((s) => s.category).filter(Boolean))
 );

 const catsJson: SkillCategoryDTO[] = uniqueCategories.map((name, idx) => ({
 id:`cat-${idx + 1}`,
 name,
 displayOrder: idx + 1,
 }));

 setData({
 skills: Array.isArray(skillsJson) ? skillsJson.filter((s) => s.active !== false) : [],
 categories: catsJson,
 });
 } catch (err: unknown) {
 setIsError(true);
 setError(err instanceof Error ? err : new Error('Skills loading failure'));
 } finally {
 setIsLoading(false);
 }
 }, []);

 useEffect(() => {
 execute();
 }, [execute]);

 return { data, isLoading, isError, error, refetch: execute };
};

export const useExperience = createQueryHook<ExperienceDTO[]>('/api/experience', []);
export const useEducation = createQueryHook<EducationDTO[]>('/api/education', []);

interface ProjectFilterOptions {
 category?: string;
 tech?: string;
}

export const useProjects = (options?: ProjectFilterOptions): QueryResult<ProjectDTO[]> => {
 const [rawProjects, setRawProjects] = useState<ProjectDTO[]>([]);
 const [isLoading, setIsLoading] = useState<boolean>(true);
 const [isError, setIsError] = useState<boolean>(false);
 const [error, setError] = useState<Error | null>(null);

 const execute = useCallback(async () => {
 setIsLoading(true);
 setIsError(false);
 setError(null);
 try {
 const res = await fetch('/api/projects', { headers: { Accept:'application/json' } });
 if (!res.ok) throw new Error('Failed to load projects');
 const json: ProjectDTO[] = await res.json();
 setRawProjects(Array.isArray(json) ? json.filter((p) => p.active !== false) : []);
 } catch (err: unknown) {
 setIsError(true);
 setError(err instanceof Error ? err : new Error('Failed to load projects'));
 } finally {
 setIsLoading(false);
 }
 }, []);

 useEffect(() => {
 execute();
 }, [execute]);

 const filteredData = useMemo(() => {
 let result = rawProjects;
 if (options?.category && options.category !=='All') {
 result = result.filter(
 (p) => p.category?.toLowerCase() === options.category?.toLowerCase()
 );
 }
 if (options?.tech) {
 result = result.filter((p) =>
 p.technologies?.some(
 (t) => t.toLowerCase() === options.tech?.toLowerCase()
 )
 );
 }
 return result;
 }, [rawProjects, options?.category, options?.tech]);

 return { data: filteredData, isLoading, isError, error, refetch: execute };
};

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
 const res = await fetch(`/api/projects/${encodeURIComponent(idOrSlug)}`, {
 headers: { Accept:'application/json' },
 });
 if (!res.ok) {
 const listRes = await fetch('/api/projects', { headers: { Accept:'application/json' } });
 if (listRes.ok) {
 const list: ProjectDTO[] = await listRes.json();
 const match = list.find((p) => p.id === idOrSlug || (p as { slug?: string }).slug === idOrSlug);
 if (match) {
 setData(match);
 return;
 }
 }
 throw new Error('Project spec not found');
 }
 const json: ProjectDTO = await res.json();
 setData(json);
 } catch (err: unknown) {
 setIsError(true);
 setError(err instanceof Error ? err : new Error('Failed to load project details'));
 } finally {
 setIsLoading(false);
 }
 }, [idOrSlug]);

 useEffect(() => {
 execute();
 }, [execute]);

 return { data, isLoading, isError, error, refetch: execute };
};

export const useMedia = createQueryHook<MediaAssetDTO[]>('/api/media', []);

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
 const res = await fetch('/api/contact', {
 method:'POST',
 headers: {
'Content-Type':'application/json',
 Accept:'application/json',
 },
 body: JSON.stringify(payload),
 });

 let json: { message?: string; error?: string } | null = null;
 try {
 json = await res.json();
 } catch {
 // Non-JSON response
 }

 if (!res.ok) {
 const msg = json?.message || json?.error ||'Message dispatch failed';
 throw new Error(msg);
 }

 return json || { message:'Message sent successfully' };
 } catch (err: unknown) {
 setIsError(true);
 setError(err instanceof Error ? err : new Error('Message dispatch failed'));
 throw err;
 } finally {
 setIsPending(false);
 }
 };

 return { mutateAsync, isPending, isError, error };
};