// utils/badgeUtils.js
export const parseRequirementValue = (badge) => {
  // Jika di production (dari log yang ada)
  if (process.env.NODE_ENV === 'production') {
    // Coba parse dari requirementValue jika ada
    if (badge.requirementValue && typeof badge.requirementValue === 'string') {
      // Jika string JSON
      if (badge.requirementValue.includes('{')) {
        try {
          const parsed = JSON.parse(badge.requirementValue);
          return parsed.value || 0;
        } catch (e) {
          // Jika gagal, coba extract angka
          const match = badge.requirementValue.match(/"value":\s*(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        }
      }
      // Jika string angka biasa
      return parseInt(badge.requirementValue, 10) || 0;
    }
    
    // Fallback: parse dari requirement
    if (badge.requirement && typeof badge.requirement === 'string') {
      try {
        const parsed = JSON.parse(badge.requirement);
        return parsed.value || 0;
      } catch (e) {
        // Extract angka dari string JSON yang mungkin rusak
        const match = badge.requirement.match(/"value":\s*(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      }
    }
  }
  
  // Untuk development/localhost
  if (badge.requirementValue !== undefined) {
    return Number(badge.requirementValue) || 0;
  }
  
  if (badge.requirement && typeof badge.requirement === 'object') {
    return badge.requirement.value || 0;
  }
  
  return 0;
};