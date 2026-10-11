import { describe, expect, it } from 'vitest';
import { updateMentorTechnicalAreasSchema } from '../requests/update-mentor-technical-areas.schema.js';

describe('updateMentorTechnicalAreasSchema', () => {
  const areaId = '0424f370-00f0-43cf-9b8a-997af81840b9';

  it('acepta una lista no vacia de UUID unicos', () => {
    expect(
      updateMentorTechnicalAreasSchema.parse({ technicalAreaIds: [areaId] }),
    ).toEqual({ technicalAreaIds: [areaId] });
  });

  it.each([
    { technicalAreaIds: [] },
    { technicalAreaIds: ['area-1'] },
    { technicalAreaIds: [areaId, areaId] },
    { technicalAreaIds: [areaId], mentorId: areaId },
  ])('rechaza payloads invalidos o con campos adicionales', (payload) => {
    expect(updateMentorTechnicalAreasSchema.safeParse(payload).success).toBe(
      false,
    );
  });
});
