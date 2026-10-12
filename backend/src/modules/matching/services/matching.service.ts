import { Injectable } from '@nestjs/common';
import type {
  AnalyzeExperienceInput,
  AnalyzeExperienceResponse,
  DetectedSkillResponse,
  MatchingInput,
  MatchingResult,
} from '../types/matching.types.js';
import { SkillDictionaryService } from '../../job-connect/services/skill-dictionary.service.js';
import { SkillsClassifierService } from './skills-classifier.service.js';

@Injectable()
export class MatchingService {
  constructor(
    private readonly skillDictionaryService: SkillDictionaryService,
    private readonly skillsClassifierService: SkillsClassifierService,
  ) {}
  analyzeExperience(input: AnalyzeExperienceInput): AnalyzeExperienceResponse {
    const startedAt = performance.now();
    const textToProcess = input.text || ''; 
    const { skills: rawSkills } = this.skillDictionaryService.extract(textToProcess);

    const skills = this.skillsClassifierService.classify(rawSkills, []);

    return {
      experienceId: input.experienceId,
      skills,
      processingTimeMs: Math.round(performance.now() - startedAt),
    };
  }

  intersectRequirements(input: MatchingInput): MatchingResult {
    const careerMatch =
      !input.requiredCareer ||
      input.userCareer.toLowerCase() === input.requiredCareer.toLowerCase();

    const experienceMatch =
      input.userExperienceYears >= input.minimumExperienceYears;

    const userSkills = new Set(
      input.userSkills.map((skill) => skill.toLowerCase()),
    );

    const matchedSkills = input.requiredSkills.filter((skill) =>
      userSkills.has(skill.toLowerCase()),
    );

    const allRequiredSkillsMatch =
      matchedSkills.length === input.requiredSkills.length;

    return {
      careerMatch,
      experienceMatch,
      matchedSkills,
      allRequiredSkillsMatch,
    };
  }
}
