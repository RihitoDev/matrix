import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { educationsService } from '../services/educations.service';
import type { EducationInstitution } from '../types/education-institution.types';
import { useEducationInstitutions } from './use-education-institutions';

vi.mock('../services/educations.service', () => ({ educationsService: { getInstitutions: vi.fn() } }));
const INSTITUTIONS = [{ name: 'Universidad Mayor de San Simón (UMSS)', aliases: ['UMSS'] }];

describe('useEducationInstitutions', () => {
  beforeEach(() => vi.mocked(educationsService.getInstitutions).mockResolvedValue(INSTITUTIONS));
  afterEach(() => { cleanup(); vi.resetAllMocks(); });

  it('loads catalogue and clears loading', async () => {
    const { result } = renderHook(useEducationInstitutions);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.institutions).toEqual([]);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.institutions).toEqual(INSTITUTIONS);
    expect(result.current.error).toBeNull();
  });

  it('reports an error and recovers after an explicit retry', async () => {
    vi.mocked(educationsService.getInstitutions).mockRejectedValueOnce(new Error('Unavailable'));
    const { result } = renderHook(useEducationInstitutions);
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.institutions).toEqual([]);
    act(() => result.current.reload());
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.institutions).toEqual(INSTITUTIONS);
    expect(result.current.error).toBeNull();
  });

  it('ignores stale requests and responses after unmounting', async () => {
    let finish!: (value: EducationInstitution[]) => void;
    vi.mocked(educationsService.getInstitutions).mockReturnValueOnce(new Promise((resolve) => { finish = resolve; }));
    const { result, unmount } = renderHook(useEducationInstitutions);
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.institutions).toEqual(INSTITUTIONS));
    await act(async () => finish([]));
    expect(result.current.institutions).toEqual(INSTITUTIONS);
    vi.mocked(educationsService.getInstitutions).mockReturnValueOnce(new Promise((resolve) => { finish = resolve; }));
    act(() => result.current.reload());
    unmount();
    await act(async () => finish(INSTITUTIONS));
  });
});
