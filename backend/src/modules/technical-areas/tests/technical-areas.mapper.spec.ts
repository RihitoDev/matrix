import { describe, expect, it } from 'vitest';
import { TechnicalAreasMapper } from '../mappers/technical-areas.mapper.js';

describe('TechnicalAreasMapper', () => {
  const mapper = new TechnicalAreasMapper();

  it('mapea un record explicitamente y omite campos ajenos al contrato', () => {
    const record = {
      id: 'area-1',
      name: 'Backend',
      description: 'APIs',
      createdAt: new Date(),
    };
    const result = mapper.toResponse(record);

    expect(result).toEqual({
      id: 'area-1',
      name: 'Backend',
      description: 'APIs',
    });
    expect(result).not.toBe(record);
  });

  it('mapea una lista conservando orden y description null', () => {
    const records = [
      { id: 'area-1', name: 'Backend', description: null },
      { id: 'area-2', name: 'Cloud', description: 'Infraestructura' },
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
