export const formatSkillName = (name: string): string => name.trim().split(/\s+/).filter(Boolean).join(' ');
