import React from 'react';
import {
  useProfile,
  useSkills,
  useExperience,
  useEducation,
  useProjects,
  useMedia
} from '../hooks/usePortfolioData';
import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import { SkillsSection } from '../components/sections/SkillsSection';
import { TechStackSection } from '../components/sections/TechStackSection';
import { ExperienceSection } from '../components/sections/ExperienceSection';
import { EducationSection } from '../components/sections/EducationSection';
import { ProjectsSection } from '../components/sections/ProjectsSection';
import { ContactSection } from '../components/sections/ContactSection';

export const HomePage: React.FC = () => {
  const profileQuery = useProfile();
  const skillsQuery = useSkills();
  const experienceQuery = useExperience();
  const educationQuery = useEducation();
  const projectsQuery = useProjects();
  const mediaQuery = useMedia();
  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState<string>('ALL');

  if ([profileQuery, skillsQuery, experienceQuery, educationQuery, projectsQuery, mediaQuery].some(query => query.isLoading)) {
    return <main className="min-h-screen" aria-busy="true" />;
  }

  if ([profileQuery, skillsQuery, experienceQuery, educationQuery, projectsQuery, mediaQuery].some(query => query.isError)) {
    return <main className="min-h-screen flex items-center justify-center p-8 text-center">Unable to load portfolio data.</main>;
  }

  const profile = profileQuery.data!;
  const skillsData = skillsQuery.data!;
  const experience = experienceQuery.data!;
  const education = educationQuery.data!;
  const projects = projectsQuery.data!;
  const media = mediaQuery.data!;

  const handleExploreProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactClick = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen">
      <HeroSection
        profile={profile}
        projectCount={projects?.length || 0}
        onExploreProjects={handleExploreProjects}
        onContactClick={handleContactClick}
      />
      <AboutSection profile={profile} media={media} />
      {/* <SkillsSection categories={skillsData.categories} /> */}
      <TechStackSection 
        skills={skillsData.skills}
        categories={skillsData.categories}
        selectedCategoryFilter={selectedCategoryFilter}
        onFilterChange={setSelectedCategoryFilter}
        />
      <ExperienceSection experience={experience} />
      <ProjectsSection projects={projects} />
      <EducationSection education={education} />
      <ContactSection profile={profile} />
    </main>
  );
};

