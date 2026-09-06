export interface SiteProfile {
 id?: string;
 name: string;
 heroTitle: string;
 heroSubtitle: string;
 bio: string;
 email: string;
 phone?: string;
 location?: string;
 resumeUrl?: string;
 githubUrl?: string;
 linkedinUrl?: string;
 profileImageUrl?: string;
 yearsOfExperience?: number;
 showExperienceInProfile?: boolean;
 active?: boolean;
}

export type ProfileDTO = SiteProfile;

export interface SkillCategoryDTO {
 id: string;
 name: string;
 description?: string;
 displayOrder: number;
}

export interface SkillDTO {
 id: string;
 name: string;
 category: string;
 displayOrder: number;
 overview?: string;
 yearsOfExperience?: number;
 knowledgePercentage?: number;
 active: boolean;
}

export interface ProjectMetric {
 label: string;
 value: string;
}

export interface ProjectDTO {
 id: string;
 title: string;
 slug?: string;
 shortDescription?: string;
 description: string;
 category: string;
 technologies: string[];
 features?: string[];
 keyFeatures?: string[];
 challenges?: string[];
 metrics?: ProjectMetric[];
 githubUrl?: string;
 liveUrl?: string;
 liveDemoUrl?: string;
 imageUrl?: string;
 role?: string;
 displayOrder: number;
 featured: boolean;
 active: boolean;
}

export interface ExperienceDTO {
 id: string;
 role: string;
 company: string;
 location?: string;
 employmentType?: string;
 period?: string;
 startDate?: string;
 endDate?: string;
 current?: boolean;
 description: string[] | string;
 technologies: string[];
 displayOrder?: number;
}

export interface EducationDTO {
 id: string;
 degree: string;
 institution: string;
 field?: string;
 location?: string;
 period?: string;
 startYear?: string;
 endYear?: string;
 gpa?: string;
 details?: string[];
 highlights?: string[];
 relevantCourses?: string[];
 displayOrder?: number;
}

export interface MediaAssetDTO {
 id: string;
 name: string;
 url: string;
 usage:'profile' |'project' |'general' | string;
 size?: string;
 uploadedAt?: string;
 altText?: string;
}

export type MediaDTO = MediaAssetDTO;

export interface ContactMessagePayload {
 name: string;
 email: string;
 subject: string;
 message: string;
}

export interface ContactMessageDTO {
 id: string;
 name: string;
 email: string;
 subject: string;
 message: string;
 read?: boolean;
 archived?: boolean;
 receivedAt?: string;
 createdAt?: string;
}