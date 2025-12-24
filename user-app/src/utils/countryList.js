// utils/countryList.js
export const countries = [
  // Major trading/financial hubs
  { code: 'US', code3: 'USA', name: 'United States' },
  { code: 'GB', code3: 'GBR', name: 'United Kingdom' },
  { code: 'JP', code3: 'JPN', name: 'Japan' },
  { code: 'SG', code3: 'SGP', name: 'Singapore' },
  { code: 'HK', code3: 'HKG', name: 'Hong Kong' },
  { code: 'CH', code3: 'CHE', name: 'Switzerland' },
  { code: 'AU', code3: 'AUS', name: 'Australia' },
  { code: 'CA', code3: 'CAN', name: 'Canada' },
  
  // ASEAN Countries (for Indonesian app context)
  { code: 'ID', code3: 'IDN', name: 'Indonesia' },
  { code: 'MY', code3: 'MYS', name: 'Malaysia' },
  { code: 'TH', code3: 'THA', name: 'Thailand' },
  { code: 'VN', code3: 'VNM', name: 'Vietnam' },
  { code: 'PH', code3: 'PHL', name: 'Philippines' },
  
  // Other major countries
  { code: 'DE', code3: 'DEU', name: 'Germany' },
  { code: 'FR', code3: 'FRA', name: 'France' },
  { code: 'IT', code3: 'ITA', name: 'Italy' },
  { code: 'ES', code3: 'ESP', name: 'Spain' },
  { code: 'NL', code3: 'NLD', name: 'Netherlands' },
  
  // BRICS and emerging markets
  { code: 'IN', code3: 'IND', name: 'India' },
  { code: 'CN', code3: 'CHN', name: 'China' },
  { code: 'BR', code3: 'BRA', name: 'Brazil' },
  { code: 'RU', code3: 'RUS', name: 'Russia' },
  { code: 'ZA', code3: 'ZAF', name: 'South Africa' },
  
  // Middle East financial hubs
  { code: 'AE', code3: 'ARE', name: 'United Arab Emirates' },
  { code: 'SA', code3: 'SAU', name: 'Saudi Arabia' },
  { code: 'QA', code3: 'QAT', name: 'Qatar' },
  
  // Other European
  { code: 'SE', code3: 'SWE', name: 'Sweden' },
  { code: 'NO', code3: 'NOR', name: 'Norway' },
  { code: 'DK', code3: 'DNK', name: 'Denmark' },
  { code: 'FI', code3: 'FIN', name: 'Finland' },
  
  // Others
  { code: 'KR', code3: 'KOR', name: 'South Korea' },
  { code: 'TW', code3: 'TWN', name: 'Taiwan' },
  { code: 'NZ', code3: 'NZL', name: 'New Zealand' },

    // Americas
  { code: 'MX', code3: 'MEX', name: 'Mexico' },
  { code: 'AR', code3: 'ARG', name: 'Argentina' },
  { code: 'CL', code3: 'CHL', name: 'Chile' },
  { code: 'CO', code3: 'COL', name: 'Colombia' },
  { code: 'PE', code3: 'PER', name: 'Peru' },

  // Asia
  { code: 'PK', code3: 'PAK', name: 'Pakistan' },
  { code: 'BD', code3: 'BGD', name: 'Bangladesh' },
  { code: 'LK', code3: 'LKA', name: 'Sri Lanka' },
  { code: 'NP', code3: 'NPL', name: 'Nepal' },
  { code: 'MM', code3: 'MMR', name: 'Myanmar' },
  { code: 'KH', code3: 'KHM', name: 'Cambodia' },
  { code: 'LA', code3: 'LAO', name: 'Laos' },
  { code: 'MN', code3: 'MNG', name: 'Mongolia' },

  // East Asia
  { code: 'MO', code3: 'MAC', name: 'Macau' },

  // Europe
  { code: 'BE', code3: 'BEL', name: 'Belgium' },
  { code: 'AT', code3: 'AUT', name: 'Austria' },
  { code: 'PL', code3: 'POL', name: 'Poland' },
  { code: 'CZ', code3: 'CZE', name: 'Czech Republic' },
  { code: 'HU', code3: 'HUN', name: 'Hungary' },
  { code: 'PT', code3: 'PRT', name: 'Portugal' },
  { code: 'IE', code3: 'IRL', name: 'Ireland' },
  { code: 'GR', code3: 'GRC', name: 'Greece' },
  { code: 'RO', code3: 'ROU', name: 'Romania' },
  { code: 'BG', code3: 'BGR', name: 'Bulgaria' },
  { code: 'UA', code3: 'UKR', name: 'Ukraine' },

  // Middle East
  { code: 'IL', code3: 'ISR', name: 'Israel' },
  { code: 'TR', code3: 'TUR', name: 'Turkey' },
  { code: 'KW', code3: 'KWT', name: 'Kuwait' },
  { code: 'BH', code3: 'BHR', name: 'Bahrain' },
  { code: 'OM', code3: 'OMN', name: 'Oman' },

  // Africa
  { code: 'EG', code3: 'EGY', name: 'Egypt' },
  { code: 'NG', code3: 'NGA', name: 'Nigeria' },
  { code: 'KE', code3: 'KEN', name: 'Kenya' },
  { code: 'GH', code3: 'GHA', name: 'Ghana' },
  { code: 'MA', code3: 'MAR', name: 'Morocco' },
  { code: 'TN', code3: 'TUN', name: 'Tunisia' },

  // Oceania
  { code: 'PG', code3: 'PNG', name: 'Papua New Guinea' },
  { code: 'FJ', code3: 'FJI', name: 'Fiji' },
];

// Sort countries alphabetically by name for the dropdown
export const sortedCountries = [...countries].sort((a, b) => 
  a.name.localeCompare(b.name)
);

// Helper function to get country name by code3
export const getCountryNameByCode3 = (code3) => {
  const country = countries.find(c => c.code3 === code3);
  return country ? country.name : 'Unknown';
};

// Helper function to get country by code3
export const getCountryByCode3 = (code3) => {
  return countries.find(c => c.code3 === code3) || null;
};

// Get only Alpha-2 codes for flags
export const getAlpha2Codes = () => {
  return countries.map(c => c.code);
};