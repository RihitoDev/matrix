import { describe, it, expect } from 'vitest';
import { MOCK_USERS, CURRENT_USER, CURRENT_USER_ID } from '../mocks/mock-users';

describe('mock-users', () => {
  it('debe tener al menos 100 usuarios', ()=> {
    expect(MOCK_USERS.length).toBeGreaterThanOrEqual(100);
  });

  it('debe incluir al menos un usuario sin avatar', () => {
    expect(MOCK_USERS.some((u) => u.avatarUrl === null)).toBe(true);
  });

  it('debe incluir al menos un usuario inactivo', () => {
    expect(MOCK_USERS.some((u) => u.isActive === false)).toBe(true);
  });

  it('el currentUser no debe estar dentro de MOCK_USERS', () => {
    expect(MOCK_USERS.find((u) => u.id === CURRENT_USER_ID)).toBeUndefined();
  });

  it('el currentUser debe existir y tener la forma esperada', () => {
    expect(CURRENT_USER.id).toBe(CURRENT_USER_ID);
    expect(CURRENT_USER.isActive).toBe(true);
    expect(CURRENT_USER.fullName.length).toBeGreaterThan(0);
  });

  it('debe incluir al menos un usuario de cada rol principal', () => {
    const roles = new Set(MOCK_USERS.map((u) => u.role));
    expect(roles.has('GRADUATE')).toBe(true);
    expect(roles.has('MENTOR')).toBe(true);
    expect(roles.has('RECRUITER')).toBe(true);
  });

  it('los ids de usuario deben ser únicos', () => {
    const ids = MOCK_USERS.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});