import {
 SiteProfile,
 SkillDTO,
 SkillCategoryDTO,
 ProjectDTO,
 ExperienceDTO,
 EducationDTO,
 MediaAssetDTO,
 ContactMessageDTO,
} from'../types';

export class AdminApiException extends Error {
 status: number;
 fieldErrors?: Record<string, string>;

 constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
 super(message);
 this.name ='AdminApiException';
 this.status = status;
 this.fieldErrors = fieldErrors;
 }
}

/**
 * Centralized API service bound to AdminAuthContext's fetchWithAuth.
 * Coordinates CSRF tokens, HttpOnly cookie delivery, and session recovery.
 */
export const createAdminApi = (
 fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>
) => {
 const handleResponse = async <T>(response: Response): Promise<T> => {
 if (response.status === 204) {
 return {} as T;
 }

 let json: any = null;
 try {
 json = await response.json();
 } catch {
 // Body is not JSON
 }

 if (!response.ok) {
 const errorMessage =
 json?.message || json?.error ||`Request failed with status ${response.status}`;
 throw new AdminApiException(errorMessage, response.status, json?.errors);
 }

 return json as T;
 };

 return {
 // --- PROFILE ---
 getProfile: async (): Promise<SiteProfile> => {
 const res = await fetchWithAuth('/api/admin/profile', { method:'GET' });
 return handleResponse<SiteProfile>(res);
 },

 updateProfile: async (payload: Partial<SiteProfile>): Promise<SiteProfile> => {
 const sanitized = {
 name: payload.name?.trim(),
 heroTitle: payload.heroTitle?.trim(),
 heroSubtitle: payload.heroSubtitle?.trim(),
 bio: payload.bio?.trim(),
 email: payload.email?.trim(),
 phone: payload.phone?.trim(),
 location: payload.location?.trim(),
 resumeUrl: payload.resumeUrl?.trim(),
 githubUrl: payload.githubUrl?.trim(),
 linkedinUrl: payload.linkedinUrl?.trim(),
 profileImageUrl: payload.profileImageUrl?.trim(),
 active: payload.active ?? true,
 };

 const res = await fetchWithAuth('/api/admin/profile', {
 method:'PUT',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify(sanitized),
 });
 return handleResponse<SiteProfile>(res);
 },

 // --- SKILLS & CATEGORIES ---
 getSkills: async (): Promise<SkillDTO[]> => {
 const res = await fetchWithAuth('/api/admin/skills', { method:'GET' });
 return handleResponse<SkillDTO[]>(res);
 },

 getSkillCategories: async (): Promise<SkillCategoryDTO[]> => {
 const res = await fetchWithAuth('/api/admin/skill-categories', { method:'GET' });
 return handleResponse<SkillCategoryDTO[]>(res);
 },

 createSkillCategory: async (payload: Partial<SkillCategoryDTO>): Promise<SkillCategoryDTO> => {
 const sanitized = {
 name: String(payload.name ||'').trim(),
 description: String(payload.description ||'').trim(),
 displayOrder: Number(payload.displayOrder || 1),
 };
 const res = await fetchWithAuth('/api/admin/skill-categories', {
 method:'POST',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify(sanitized),
 });
 return handleResponse<SkillCategoryDTO>(res);
 },

 updateSkillCategory: async (id: string, payload: Partial<SkillCategoryDTO>): Promise<SkillCategoryDTO> => {
 const sanitized = {
 name: String(payload.name ||'').trim(),
 description: String(payload.description ||'').trim(),
 displayOrder: Number(payload.displayOrder || 1),
 };
 const res = await fetchWithAuth(`/api/admin/skill-categories/${id}`, {
 method:'PUT',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify(sanitized),
 });
 return handleResponse<SkillCategoryDTO>(res);
 },

 deleteSkillCategory: async (id: string): Promise<void> => {
 const res = await fetchWithAuth(`/api/admin/skill-categories/${id}`, { method:'DELETE' });
 return handleResponse<void>(res);
 },

 createSkill: async (payload: Omit<SkillDTO,'id'>): Promise<SkillDTO> => {
 const sanitized = {
 name: String(payload.name ||'').trim(),
 category: String(payload.category ||'').trim(),
 displayOrder: Number(payload.displayOrder || 0),
 overview: String(payload.overview ||'').trim(),
 yearsOfExperience: Number(payload.yearsOfExperience || 0),
 knowledgePercentage: Number(payload.knowledgePercentage || 0),
 active: payload.active ?? true,
 };

 const res = await fetchWithAuth('/api/admin/skills', {
 method:'POST',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify(sanitized),
 });
 return handleResponse<SkillDTO>(res);
 },

 createBulkSkills: async (skills: Omit<SkillDTO,'id'>[]): Promise<SkillDTO[]> => {
 const sanitized = skills.map((s) => ({
 name: String(s.name ||'').trim(),
 category: String(s.category ||'').trim(),
 displayOrder: Number(s.displayOrder || 0),
 overview: String(s.overview ||'').trim(),
 yearsOfExperience: Number(s.yearsOfExperience || 0),
 knowledgePercentage: Number(s.knowledgePercentage || 0),
 active: s.active ?? true,
 }));

 const res = await fetchWithAuth('/api/admin/skills/bulk', {
 method:'POST',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify(sanitized),
 });
 return handleResponse<SkillDTO[]>(res);
 },

 updateSkill: async (id: string, payload: Partial<SkillDTO>): Promise<SkillDTO> => {
 const sanitized = {
 name: String(payload.name ||'').trim(),
 category: String(payload.category ||'').trim(),
 displayOrder: Number(payload.displayOrder || 0),
 overview: String(payload.overview ||'').trim(),
 yearsOfExperience: Number(payload.yearsOfExperience || 0),
 knowledgePercentage: Number(payload.knowledgePercentage || 0),
 active: payload.active ?? true,
 };

 const res = await fetchWithAuth(`/api/admin/skills/${id}`, {
 method:'PUT',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify(sanitized),
 });
 return handleResponse<SkillDTO>(res);
 },

 deleteSkill: async (id: string): Promise<void> => {
 const res = await fetchWithAuth(`/api/admin/skills/${id}`, { method:'DELETE' });
 return handleResponse<void>(res);
 },

 // --- PROJECTS ---
 getProjects: async (): Promise<ProjectDTO[]> => {
 const res = await fetchWithAuth('/api/admin/projects', { method:'GET' });
 return handleResponse<ProjectDTO[]>(res);
 },

 createProject: async (payload: Omit<ProjectDTO,'id'>): Promise<ProjectDTO> => {
 const res = await fetchWithAuth('/api/admin/projects', {
 method:'POST',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify(payload),
 });
 return handleResponse<ProjectDTO>(res);
 },

 updateProject: async (id: string, payload: Partial<ProjectDTO>): Promise<ProjectDTO> => {
 const res = await fetchWithAuth(`/api/admin/projects/${id}`, {
 method:'PUT',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify(payload),
 });
 return handleResponse<ProjectDTO>(res);
 },

 deleteProject: async (id: string): Promise<void> => {
 const res = await fetchWithAuth(`/api/admin/projects/${id}`, { method:'DELETE' });
 return handleResponse<void>(res);
 },

 // --- EDUCATION ---
 getEducation: async (): Promise<EducationDTO[]> => {
 const res = await fetchWithAuth('/api/admin/education', { method:'GET' });
 return handleResponse<EducationDTO[]>(res);
 },

 createEducation: async (payload: Partial<EducationDTO>): Promise<EducationDTO> => {
 const sanitized = {
 institution: String(payload.institution ||'').trim(),
 degree: String(payload.degree ||'').trim(),
 field: String(payload.field ||'').trim(),
 period: payload.period ||`${payload.startYear ||'2020'} - ${payload.endYear ||'Present'}`,
 startYear: payload.startYear ||'2020',
 endYear: payload.endYear ||'Present',
 gpa: payload.gpa?.trim() ||'',
 details: Array.isArray(payload.details) ? payload.details : payload.highlights || [],
 highlights: Array.isArray(payload.highlights) ? payload.highlights : [],
 relevantCourses: Array.isArray(payload.relevantCourses) ? payload.relevantCourses : [],
 displayOrder: Number(payload.displayOrder || 1),
 };

 const res = await fetchWithAuth('/api/admin/education', {
 method:'POST',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify(sanitized),
 });
 return handleResponse<EducationDTO>(res);
 },

 updateEducation: async (id: string, payload: Partial<EducationDTO>): Promise<EducationDTO> => {
 const sanitized = {
 institution: String(payload.institution ||'').trim(),
 degree: String(payload.degree ||'').trim(),
 field: String(payload.field ||'').trim(),
 period: payload.period ||`${payload.startYear ||'2020'} - ${payload.endYear ||'Present'}`,
 startYear: payload.startYear ||'2020',
 endYear: payload.endYear ||'Present',
 gpa: payload.gpa?.trim() ||'',
 details: Array.isArray(payload.details) ? payload.details : payload.highlights || [],
 highlights: Array.isArray(payload.highlights) ? payload.highlights : [],
 relevantCourses: Array.isArray(payload.relevantCourses) ? payload.relevantCourses : [],
 displayOrder: Number(payload.displayOrder || 1),
 };

 const res = await fetchWithAuth(`/api/admin/education/${id}`, {
 method:'PUT',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify(sanitized),
 });
 return handleResponse<EducationDTO>(res);
 },

 deleteEducation: async (id: string): Promise<void> => {
 const res = await fetchWithAuth(`/api/admin/education/${id}`, { method:'DELETE' });
 return handleResponse<void>(res);
 },

 // --- EXPERIENCE ---
 getExperience: async (): Promise<ExperienceDTO[]> => {
 const res = await fetchWithAuth('/api/admin/experience', { method:'GET' });
 return handleResponse<ExperienceDTO[]>(res);
 },

 createExperience: async (payload: Partial<ExperienceDTO>): Promise<ExperienceDTO> => {
 const sanitized = {
 role: String(payload.role ||'').trim(),
 company: String(payload.company ||'').trim(),
 location: String(payload.location ||'').trim(),
 employmentType: payload.employmentType ||'Full-time',
 startDate: String(payload.startDate ||'').trim(),
 endDate: payload.current ?'' : String(payload.endDate ||'').trim(),
 current: Boolean(payload.current),
 description: Array.isArray(payload.description) ? payload.description : [],
 technologies: Array.isArray(payload.technologies) ? payload.technologies : [],
 displayOrder: Number(payload.displayOrder || 1),
 };

 const res = await fetchWithAuth('/api/admin/experience', {
 method:'POST',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify(sanitized),
 });
 return handleResponse<ExperienceDTO>(res);
 },

 updateExperience: async (id: string, payload: Partial<ExperienceDTO>): Promise<ExperienceDTO> => {
 const sanitized = {
 role: String(payload.role ||'').trim(),
 company: String(payload.company ||'').trim(),
 location: String(payload.location ||'').trim(),
 employmentType: payload.employmentType ||'Full-time',
 startDate: String(payload.startDate ||'').trim(),
 endDate: payload.current ?'' : String(payload.endDate ||'').trim(),
 current: Boolean(payload.current),
 description: Array.isArray(payload.description) ? payload.description : [],
 technologies: Array.isArray(payload.technologies) ? payload.technologies : [],
 displayOrder: Number(payload.displayOrder || 1),
 };

 const res = await fetchWithAuth(`/api/admin/experience/${id}`, {
 method:'PUT',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify(sanitized),
 });
 return handleResponse<ExperienceDTO>(res);
 },

 deleteExperience: async (id: string): Promise<void> => {
 const res = await fetchWithAuth(`/api/admin/experience/${id}`, { method:'DELETE' });
 return handleResponse<void>(res);
 },

 // --- MEDIA ---
 getMedia: async (): Promise<MediaAssetDTO[]> => {
 const res = await fetchWithAuth('/api/admin/media', { method:'GET' });
 return handleResponse<MediaAssetDTO[]>(res);
 },

 uploadMedia: async (data: { file: File; usage: string; altText?: string }): Promise<MediaAssetDTO> => {
 const formData = new FormData();
 formData.append('file', data.file);
 formData.append('usage', data.usage);
 if (data.altText) formData.append('altText', data.altText);

 // fetchWithAuth attaches CSRF headers automatically without overriding multipart boundaries
 const res = await fetchWithAuth('/api/admin/media', {
 method:'POST',
 body: formData,
 });
 return handleResponse<MediaAssetDTO>(res);
 },

 deleteMedia: async (id: string): Promise<void> => {
 const res = await fetchWithAuth(`/api/admin/media/${id}`, { method:'DELETE' });
 return handleResponse<void>(res);
 },

 // --- CONTACT MESSAGES ---
 getContactMessages: async (): Promise<ContactMessageDTO[]> => {
 const res = await fetchWithAuth('/api/admin/contact', { method:'GET' });
 return handleResponse<ContactMessageDTO[]>(res);
 },

 markMessageRead: async (id: string): Promise<void> => {
 const res = await fetchWithAuth(`/api/admin/contact/${id}/read`, {
 method:'PATCH',
 });
 return handleResponse<void>(res);
 },

 archiveMessage: async (id: string): Promise<void> => {
 const res = await fetchWithAuth(`/api/admin/contact/${id}/archive`, {
 method:'PATCH',
 });
 return handleResponse<void>(res);
 },
 };
};