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
import { NlpService } from './nlp.service.js'; 
import { SkillCatalogService } from '../../skills/services/skill-catalog.service.js';
import { UserSkillService } from '../../skills/services/user-skill.service.js';

@Injectable()
export class MatchingService {
  constructor(
    private readonly skillDictionaryService: SkillDictionaryService,
    private readonly skillsClassifierService: SkillsClassifierService,
    private readonly nlpService: NlpService,
    private readonly skillCatalogService: SkillCatalogService,
    private readonly userSkillService: UserSkillService,
  ) {}
  async analyzeExperience(input: AnalyzeExperienceInput): Promise<AnalyzeExperienceResponse> {
    const startedAt = performance.now();
    const text = input.text ?? ''; 
    let skills: DetectedSkillResponse[] = [];
    
    if (text.trim().length > 0) {
      const catalog = await this.skillCatalogService.listCatalog({});
      skills = this.skillsClassifierService.classify(this.buildCandidates(text), catalog);
      if (skills.length > 0) {
        await this.saveDetectedSkills(input.userId, skills);
      }
    }
    return {
      experienceId: input.experienceId,
      skills,
      processingTimeMs: Math.round(performance.now() - startedAt),
    };
  }

  intersectRequirements(input: MatchingInput): MatchingResult {
    const careerMatch =
      !input.requiredCareer ||
      input.userCareer.trim().toLowerCase() === input.requiredCareer.trim().toLowerCase();

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

  private buildCandidates(text: string): string[] {
    const tokens = this.nlpService.tokenizeAndFilter(this.nlpService.normalizeText(text));
    const ngrams = this.nlpService.generateNGrams(tokens);
    const fromDictionary = this.skillDictionaryService
      .extract(text)
      .skills.map((name) => this.nlpService.normalizeText(name).replace(/ /g, '_'));
    return [...tokens, ...ngrams, ...fromDictionary];
  }

  private async saveDetectedSkills(userId: string, skills: DetectedSkillResponse[]): Promise<void> {
    const current = await this.userSkillService.getUserSkills(userId);
    const skillIds = [...new Set([...current.map(({ id }) => id), ...skills.map(({ id }) => id)])];
        
    await this.userSkillService.updateUserSkills(userId, { skillIds });
  }
}
