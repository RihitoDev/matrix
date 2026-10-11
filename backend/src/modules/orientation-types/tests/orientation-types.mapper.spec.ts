import { describe, expect, it } from 'vitest';
import { OrientationTypesMapper } from '../mappers/orientation-types.mapper.js';

describe('OrientationTypesMapper', () => {
  const mapper = new OrientationTypesMapper();

  it('mapea un record explicitamente y omite campos ajenos al contrato', () => {
    const record = {
      id: 'orientation-1',
      name: 'Orientación técnica',
      description: 'Apoyo técnico',
      isActive: true,
    };
    const result = mapper.toResponse(record);

    expect(result).toEqual({
      id: 'orientation-1',
      name: 'Orientación técnica',
      description: 'Apoyo técnico',
    });
    expect(result).not.toBe(record);
  });

  it('mapea una lista conservando orden y description null', () => {
    const records = [
      {
        id: 'orientation-1',
        name: 'Orientación profesional',
        description: null,
      },
      {
        id: 'orientation-2',
        name: 'Orientación técnica',
        description: 'Apoyo técnico',
      },
    ];
    const result = mapper.toResponseList(records);

    expect(result).toEqual(records);
    expect(result).not.toBe(records);
    expect(result[0]).not.toBe(records[0]);
  });

  it('mapea una lista vacia', () => {
    expect(mapper.toResponseList([])).toEqual([]);
  });
});
