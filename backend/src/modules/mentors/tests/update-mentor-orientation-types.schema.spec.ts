import { describe, expect, it } from 'vitest';
import { updateMentorOrientationTypesSchema } from '../requests/update-mentor-orientation-types.schema.js';

describe('updateMentorOrientationTypesSchema', () => {
  const orientationTypeId = '0424f370-00f0-43cf-9b8a-997af81840b9';

  it('acepta una lista no vacia de UUID unicos', () => {
    expect(
      updateMentorOrientationTypesSchema.parse({
        orientationTypeIds: [orientationTypeId],
      }),
    ).toEqual({ orientationTypeIds: [orientationTypeId] });
  });

  it.each([
    { orientationTypeIds: [] },
    { orientationTypeIds: ['orientation-1'] },
    { orientationTypeIds: [orientationTypeId, orientationTypeId] },
    { orientationTypeIds: [orientationTypeId], userId: orientationTypeId },
  ])('rechaza payloads invalidos o con campos adicionales', (payload) => {
    expect(updateMentorOrientationTypesSchema.safeParse(payload).success).toBe(
      false,
    );
  });
});
