export interface SampleLesion {
  id: string;
  name: string;
  category: string;
  clinicalDescription: string;
  anatomicalSite: string;
  histopathology: string;
  dataUrl: string;
}

// Generate realistic synthetic dermatoscopic sample lesions for immediate research evaluation
function generateLesionDataUrl(type: 'melanoma' | 'nevus' | 'bcc' | 'keratosis'): string {
  const size = 300;
  let lesionSvg = '';

  if (type === 'melanoma') {
    // Atypical, asymmetrical, variegated dark brown/black with irregular borders
    lesionSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <rect width="100%" height="100%" fill="#e8cbb6" />
        <!-- Skin pore texture -->
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.8  0 0 0 0 0.6  0 0 0 0 0.5  0 0 0 0.15 0" />
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" opacity="0.3" />
        <!-- Melanoma lesion body: Asymmetric, jagged, multi-lobed -->
        <path d="M 110,65 Q 160,50 200,85 Q 240,120 225,180 Q 210,240 150,230 Q 95,225 75,175 Q 60,125 110,65 Z" fill="#2a1810" opacity="0.9" />
        <!-- Darker atypical pigment network & focal dots -->
        <path d="M 125,85 Q 165,75 190,105 Q 215,135 195,175 Q 175,215 135,195 Q 95,180 100,135 Z" fill="#120904" opacity="0.95" />
        <circle cx="170" cy="115" r="8" fill="#000000" />
        <circle cx="145" cy="155" r="12" fill="#0a0502" />
        <circle cx="120" cy="110" r="6" fill="#3d1d11" />
        <!-- Erythematous reddish border peripheral halo -->
        <path d="M 105,60 Q 165,45 208,80 Q 250,118 232,185 Q 215,248 145,238 Q 90,232 70,178 Q 55,120 105,60 Z" fill="none" stroke="#b33939" stroke-width="6" opacity="0.45" filter="blur(4px)" />
        <!-- Dermoscopic scale / grid line -->
        <line x1="20" y1="280" x2="80" y2="280" stroke="#ffffff" stroke-width="2" />
        <text x="35" y="275" fill="#ffffff" font-size="10" font-family="monospace">5 mm</text>
      </svg>
    `;
  } else if (type === 'nevus') {
    // Symmetrical, homogeneous brown, round, regular pigment network
    lesionSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <rect width="100%" height="100%" fill="#edd2bf" />
        <ellipse cx="150" cy="150" rx="65" ry="60" fill="#6d462f" opacity="0.88" />
        <ellipse cx="150" cy="150" rx="45" ry="42" fill="#4d301f" opacity="0.92" />
        <ellipse cx="150" cy="150" rx="20" ry="18" fill="#382113" opacity="0.95" />
        <!-- Regular pigment reticular mesh -->
        <circle cx="140" cy="140" r="2" fill="#2b170c" />
        <circle cx="160" cy="145" r="2" fill="#2b170c" />
        <circle cx="150" cy="165" r="2" fill="#2b170c" />
        <line x1="20" y1="280" x2="80" y2="280" stroke="#ffffff" stroke-width="2" />
        <text x="35" y="275" fill="#ffffff" font-size="10" font-family="monospace">5 mm</text>
      </svg>
    `;
  } else if (type === 'bcc') {
    // Basal Cell Carcinoma: Pearly translucency, arborizing telangiectasia (branching vessels)
    lesionSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <rect width="100%" height="100%" fill="#edd7cb" />
        <ellipse cx="150" cy="150" rx="75" ry="65" fill="#dfb3a4" opacity="0.9" />
        <ellipse cx="145" cy="148" rx="55" ry="48" fill="#e8c4b8" opacity="0.95" />
        <!-- Central ulceration / depression -->
        <ellipse cx="152" cy="150" rx="25" ry="20" fill="#a86055" opacity="0.8" />
        <!-- Arborizing telangiectasia (fine sharp branching blood vessels) -->
        <path d="M 120,135 Q 135,145 155,140 T 180,130" stroke="#c0392b" stroke-width="2" fill="none" />
        <path d="M 140,140 Q 148,158 160,165" stroke="#c0392b" stroke-width="1.8" fill="none" />
        <path d="M 130,160 Q 145,162 165,152" stroke="#c0392b" stroke-width="1.5" fill="none" />
        <!-- Shiny white streaks / shiny areas -->
        <circle cx="130" cy="130" r="5" fill="#ffffff" opacity="0.7" />
        <circle cx="170" cy="140" r="4" fill="#ffffff" opacity="0.6" />
        <line x1="20" y1="280" x2="80" y2="280" stroke="#ffffff" stroke-width="2" />
        <text x="35" y="275" fill="#ffffff" font-size="10" font-family="monospace">5 mm</text>
      </svg>
    `;
  } else {
    // Benign Keratosis: Stuck-on appearance, milia-like cysts, comedo-like openings
    lesionSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <rect width="100%" height="100%" fill="#e5c8b5" />
        <ellipse cx="150" cy="150" rx="70" ry="62" fill="#7a5538" opacity="0.92" />
        <!-- Verrucous / cerebriform surface texture -->
        <circle cx="135" cy="135" r="10" fill="#583c26" />
        <circle cx="165" cy="140" r="12" fill="#583c26" />
        <circle cx="145" cy="165" r="14" fill="#583c26" />
        <!-- Comedo-like openings (crypts) and milia-like cysts -->
        <circle cx="130" cy="140" r="3" fill="#2b1a0d" />
        <circle cx="160" cy="150" r="3.5" fill="#2b1a0d" />
        <circle cx="145" cy="130" r="3.5" fill="#fffae8" opacity="0.9" />
        <circle cx="170" cy="165" r="3" fill="#fffae8" opacity="0.9" />
        <line x1="20" y1="280" x2="80" y2="280" stroke="#ffffff" stroke-width="2" />
        <text x="35" y="275" fill="#ffffff" font-size="10" font-family="monospace">5 mm</text>
      </svg>
    `;
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(lesionSvg.trim())}`;
}

export const SAMPLE_LESIONS: SampleLesion[] = [
  {
    id: 'sample-mel-1',
    name: 'Cutaneous Melanoma (Superficial Spreading)',
    category: 'mel',
    clinicalDescription: 'Asymmetric pigmented macule with irregular scalloped borders, color variegation (tan, dark brown, black), and focal regression.',
    anatomicalSite: 'Upper Back / Trunk',
    histopathology: 'Histopathology verified invasive malignant melanoma (Breslow depth 0.85 mm, Clark level III).',
    dataUrl: generateLesionDataUrl('melanoma')
  },
  {
    id: 'sample-nv-1',
    name: 'Dysplastic / Typical Melanocytic Nevus',
    category: 'nv',
    clinicalDescription: 'Symmetric, evenly pigmented brown macule showing regular reticular pigment network and peripheral fading.',
    anatomicalSite: 'Forearm',
    histopathology: 'Histopathology verified benign compound melanocytic nevus without architectural atypia.',
    dataUrl: generateLesionDataUrl('nevus')
  },
  {
    id: 'sample-bcc-1',
    name: 'Nodular Basal Cell Carcinoma',
    category: 'bcc',
    clinicalDescription: 'Translucent pearly papule with arborizing telangiectatic vessels and faint central micro-ulceration.',
    anatomicalSite: 'Nasal Alar Fold / Facial',
    histopathology: 'Histopathology confirmed nodular basal cell carcinoma with peripheral palisading of basaloid cells.',
    dataUrl: generateLesionDataUrl('bcc')
  },
  {
    id: 'sample-bkl-1',
    name: 'Seborrheic Keratosis / Benign Keratosis',
    category: 'bkl',
    clinicalDescription: 'Verrucous, sharply demarcated plaque with stuck-on appearance, milia-like cysts, and comedo-like openings.',
    anatomicalSite: 'Anterior Chest Wall',
    histopathology: 'Histopathology verified benign seborrheic keratosis, acanthotic subtype with horn pseudocysts.',
    dataUrl: generateLesionDataUrl('keratosis')
  }
];
