import { Injectable } from '@nestjs/common';
import { JobOffersService } from '../../job-offers/services/job-offers.service.js';
import type { JobOfferResponse } from '../../job-offers/responses/job-offer.response.js';
import { SkillDictionaryService } from '../../job-connect/services/skill-dictionary.service.js';
import { UserSkillService } from '../../skills/services/user-skill.service.js';
import { JobOfferNotFoundException } from '../exceptions/job-offer-not-found.exception.js';
import type {
  JobMatchResponse,
  RecommendationsResponse,
  RecommendedJobResponse,
} from '../types/job-match.types.js';
import type { RequirementState } from '../types/requirement-state.types.js';
import { WeightedScoreService } from './weighted-score.service.js';

@Injectable()
export class JobMatchingService {
  constructor(
    private readonly jobOffersService: JobOffersService,
    private readonly userSkillService: UserSkillService,
    private readonly skillDictionaryService: SkillDictionaryService,
    private readonly weightedScoreService: WeightedScoreService,
  ) {}

  async getRecommendations(userId: string): Promise<RecommendationsResponse> {
    const userSkills = await this.getUserSkillNames(userId);
    if (userSkills.length === 0) return { isProfileComplete: false, items: [] };

    const offers = await this.jobOffersService.listPublished();
    const items = offers
      .map((offer) => this.toRecommendation(offer, userSkills))
      .filter(({ matchedSkills }) => matchedSkills.length > 0)
      .sort((a, b) => b.score - a.score || b.matchedSkills.length - a.matchedSkills.length);

    return { isProfileComplete: true, items };
  }

  async getOfferMatch(userId: string, jobOfferId: string): Promise<JobMatchResponse> {
    const userSkills = await this.getUserSkillNames(userId);
    // TODO: pedir al equipo de ofertas un findPublishedById para no listar todas
    const offers = await this.jobOffersService.listPublished();
    const offer = offers.find(({ id }) => id === jobOfferId);
    if (!offer) throw new JobOfferNotFoundException();

    const requirements = this.evaluateSkills(offer, userSkills);
    return {
      jobOfferId: offer.id,
      title: offer.title,
      companyName: offer.company.name,
      modality: offer.modality,
      description: offer.description,
      score: this.calculateScore(requirements),
      requirements,
      hasPendingRequirements: requirements.some(({ status }) => status === 'Pendiente'),
    };
  }

  private async getUserSkillNames(userId: string): Promise<string[]> {
    const skills = await this.userSkillService.getUserSkills(userId);
    return skills.map(({ name }) => name);
  }

  private evaluateSkills(offer: JobOfferResponse, userSkills: string[]): RequirementState[] {
    const owned = new Set(userSkills.map((name) => this.skillDictionaryService.canonicalize(name)));
    return offer.skills.map(({ name }) => ({
      name,
      status: owned.has(this.skillDictionaryService.canonicalize(name)) ? 'Cumple' : 'Pendiente',
    }));
  }

  private calculateScore(skills: RequirementState[]): number {
    return this.weightedScoreService.calculate({
      skills,
      academicRequirements: [],
      experienceRequirements: [],
      otherRequirements: [],
    });
  }

  private toRecommendation(offer: JobOfferResponse, userSkills: string[]): RecommendedJobResponse {
    const requirements = this.evaluateSkills(offer, userSkills);
    return {
      jobOfferId: offer.id,
      title: offer.title,
      companyName: offer.company.name,
      modality: offer.modality,
      score: this.calculateScore(requirements),
      matchedSkills: requirements.filter(({ status }) => status === 'Cumple').map(({ name }) => name),
      skills: offer.skills.map(({ name }) => name),
    };
  }
}