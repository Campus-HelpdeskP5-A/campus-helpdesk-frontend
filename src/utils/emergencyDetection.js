// كلمات مفتاحية بتدل على حالة طوارئ حقيقية — بالعربي والإنجليزي
const EMERGENCY_KEYWORDS = [
  // English
  'fire', 'injury', 'injured', 'danger', 'dangerous', 'hazard', 'hazardous',
  'gas leak', 'explosion', 'explode', 'smoke', 'electric shock', 'electrocution',
  'bleeding', 'collapse', 'collapsed', 'emergency', 'unconscious', 'trapped',
  'assault', 'attack', 'flood', 'flooding',
  // Arabic
  'حريق', 'حرايق', 'اصابة', 'إصابة', 'خطر', 'خطورة', 'تسريب غاز', 'غاز',
  'انفجار', 'دخان', 'صعقة كهربائية', 'كهرباء', 'نزيف', 'انهيار', 'طوارئ',
  'اغماء', 'إغماء', 'محبوس', 'اعتداء', 'إعتداء', 'غرق',
]

/**
 * بيدور على أي كلمة من كلمات الطوارئ جوه النص، من غير حساسية لحالة الأحرف
 * @param {string} text
 * @returns {boolean}
 */
export function containsEmergencyKeyword(text) {
  if (!text) return false
  const normalized = text.toLowerCase()
  return EMERGENCY_KEYWORDS.some((keyword) => normalized.includes(keyword.toLowerCase()))
}

export { EMERGENCY_KEYWORDS }