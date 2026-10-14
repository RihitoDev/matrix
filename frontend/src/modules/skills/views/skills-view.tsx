"use client";

import { ProfilePageLayout } from "@/modules/profile/components/profile-page-layout";
import { SkillsSelector } from "../components/skills-selector";
import { TrajectorySteps } from "@/modules/profile/components/trajectory-steps";
import { SKILLS_UI_TEXTS } from "../constants/skills.constants";
import { useSkills } from "../hooks/use-skills";

export function SkillsView() {
  const {
    catalogSkills,
    selectedSkills,
    isLoading,
    isSaving,
    hasLoadError,
    feedback,
    addSkill,
    removeSkill,
    createCustomSkill,
    saveSkills,
    reload,
  } = useSkills();

  return (
    <ProfilePageLayout
      activeTab="trajectory"
      title={SKILLS_UI_TEXTS.pageTitle}
      description={SKILLS_UI_TEXTS.pageDescription}
    >
      <TrajectorySteps activeStep="skills" />
      {isLoading ? (
        <p role="status" className="text-[13px] text-text-secondary">
          {SKILLS_UI_TEXTS.loadingText}
        </p>
      ) : (
        <SkillsSelector
          catalogSkills={catalogSkills}
          selectedSkills={selectedSkills}
          onAddSkill={addSkill}
          onRemoveSkill={removeSkill}
          onCreateCustomSkill={createCustomSkill}
          onSave={() => void saveSkills()}
          isSaving={isSaving}
          hasLoadError={hasLoadError}
          onRetry={() => void reload()}
          feedback={feedback}
        />
      )}
    </ProfilePageLayout>
  );
}
