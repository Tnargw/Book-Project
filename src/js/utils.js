import { ageGroups, ageGroupIndicators } from './config.js';

export function detectAgeGroup(subjects = []) {
  const lowerSubjects = subjects.map(s => s.toLowerCase().trim());
  const ageGroupPriority = ['children', 'young adult', 'adult'];
  const matchedGroups = [];

  for (const [group, keywords] of Object.entries(ageGroups)) {
    if (keywords.some(keyword => lowerSubjects.includes(keyword))) {
      matchedGroups.push(group);
    }
  }

  for (let i = ageGroupPriority.length - 1; i >= 0; i--) {
    if (matchedGroups.includes(ageGroupPriority[i])) {
      return ageGroupPriority[i];
    }
  }

  return null;
}

export function matchesAgeGroup(info, targetGroup) {
  const fields = [
    ...(info.categories || []),
    info.title || '',
    info.description || '',
    (info.authors || []).join(', ')
  ].join(' ').toLowerCase();

  for (const [group, keywords] of Object.entries(ageGroupIndicators)) {
    if (group !== targetGroup) {
      if (keywords.some(keyword => fields.includes(keyword))) {
        return false;
      }
    }
  }

  return true;
}



