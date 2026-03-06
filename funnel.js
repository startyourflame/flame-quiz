/* =========================================================
   FLAME Automatisierungs-Check – Quiz Logic & Scoring
   ========================================================= */

'use strict';

/* ── Storage Key ── */
const STORAGE_KEY = 'flame_funnel_data';

/* ── Quiz Questions ── */
const QUESTIONS = [
  {
    id: 'q1_industry',
    text: 'In welcher Branche bist du tätig?',
    options: [
      { value: 'service',  label: 'Dienstleistung / Beratung' },
      { value: 'agency',   label: 'Agentur / Kreativbereich' },
      { value: 'craft',    label: 'Handwerk / Lokaler Service' },
      { value: 'online',   label: 'Online-Business / E-Commerce' },
      { value: 'other',    label: 'Sonstiges' }
    ]
  },
  {
    id: 'q2_size',
    text: 'Wie groß ist dein Unternehmen?',
    options: [
      { value: 'solo',    label: 'Solo – ich arbeite alleine' },
      { value: 'small',   label: '2–5 Personen' },
      { value: 'medium',  label: '6–20 Personen' },
      { value: 'large',   label: 'Mehr als 20 Personen' }
    ]
  },
  {
    id: 'q3_offers',
    text: 'Wie erstellst du Angebote für neue Kunden?',
    options: [
      { value: 'manual',    label: 'Manuell – jedes Angebot von Grund auf neu' },
      { value: 'template',  label: 'Ich nutze Word- oder Docs-Vorlagen' },
      { value: 'software',  label: 'Mit einer Angebotssoftware oder CRM' },
      { value: 'rarely',    label: 'Ich schreibe kaum Angebote' }
    ]
  },
  {
    id: 'q4_appointments',
    text: 'Wie werden Termine mit Kunden vereinbart?',
    options: [
      { value: 'email',   label: 'Per E-Mail – hin und her schreiben' },
      { value: 'phone',   label: 'Per Telefon' },
      { value: 'booking', label: 'Über ein Online-Buchungstool' },
      { value: 'mixed',   label: 'Gemischt – je nach Kunde' }
    ]
  },
  {
    id: 'q5_acquisition',
    text: 'Wie gewinnst du neue Kunden hauptsächlich?',
    options: [
      { value: 'referral',  label: 'Empfehlungen und Mundpropaganda' },
      { value: 'social',    label: 'Social Media und Content' },
      { value: 'website',   label: 'Website-Anfragen und SEO' },
      { value: 'outreach',  label: 'Aktive Akquise / Kaltakquise' }
    ]
  },
  {
    id: 'q6_organization',
    text: 'Wie organisierst du laufende Projekte und Aufgaben?',
    options: [
      { value: 'email',   label: 'Per E-Mail und im Kopf' },
      { value: 'excel',   label: 'Excel- oder Google-Tabellen' },
      { value: 'pm_tool', label: 'Projektmanagement-Tool (Trello, Asana, etc.)' },
      { value: 'crm',     label: 'CRM-System (HubSpot, Pipedrive, etc.)' }
    ]
  },
  {
    id: 'q7_documentation',
    text: 'Wie dokumentierst du Prozesse, Abläufe oder Wissen?',
    options: [
      { value: 'none',     label: 'Gar nicht – alles ist im Kopf' },
      { value: 'notes',    label: 'Notizen oder Word-Dokumente' },
      { value: 'manual',   label: 'Manuelle Protokolle und Checklisten' },
      { value: 'auto',     label: 'Automatische Tools und Wikis' }
    ]
  },
  {
    id: 'q8_admin_time',
    text: 'Wie viele Stunden pro Woche verbringst du mit administrativen Aufgaben?',
    options: [
      { value: 'low',      label: 'Unter 3 Stunden' },
      { value: 'medium',   label: '3–10 Stunden' },
      { value: 'high',     label: '10–20 Stunden' },
      { value: 'very_high', label: 'Mehr als 20 Stunden' }
    ]
  },
  {
    id: 'q9_openness',
    text: 'Wie offen bist du gegenüber dem Einsatz von KI und Automatisierung?',
    options: [
      { value: 'very_open',  label: 'Sehr offen – ich will so viel wie möglich automatisieren' },
      { value: 'interested', label: 'Interessiert – ich probiere gerne Neues aus' },
      { value: 'uncertain',  label: 'Unsicher – ich kenne mich kaum damit aus' },
      { value: 'skeptical',  label: 'Eher skeptisch – ich bin vorsichtig mit neuen Tools' }
    ]
  },
  {
    id: 'q10_goal',
    text: 'Was ist dein wichtigstes Ziel für dein Business?',
    options: [
      { value: 'time',       label: 'Zeit sparen und effizienter werden' },
      { value: 'customers',  label: 'Mehr Kunden gewinnen' },
      { value: 'chaos',      label: 'Weniger Chaos und mehr Struktur' },
      { value: 'scale',      label: 'Skalierung ohne mehr Personal' }
    ]
  },
  {
    id: 'q11_implementation',
    text: 'Wie möchtest du Automatisierung am liebsten umsetzen?',
    options: [
      { value: 'course_lead',       label: 'Ich möchte lernen, wie ich das selbst umsetzen kann.' },
      { value: 'consulting_lead',   label: 'Ich würde gerne Unterstützung bei der Umsetzung bekommen.' },
      { value: 'done_for_you_lead', label: 'Ich suche jemanden, der die Prozesse für uns aufsetzt.' },
      { value: 'explore_lead',      label: 'Ich möchte mich erstmal nur informieren.' }
    ]
  }
];

/* ── Category Definitions ── */
const CATEGORIES = {
  angebotsprozess: {
    label: 'Angebotsprozess',
    savings: '3–5 Stunden pro Woche',
    savingsMid: 4,
    icon: '📄',
    problem: 'Du erstellst Angebote noch manuell oder mit einfachen Vorlagen. Das kostet viel Zeit und verhindert schnelle Reaktionen auf Anfragen.',
    idea: 'Mit einem automatisierten Angebotssystem könntest du Standardangebote in Minuten statt Stunden versenden – inkl. automatischer Follow-ups.'
  },
  terminbuchung: {
    label: 'Terminbuchung',
    savings: '2–4 Stunden pro Woche',
    savingsMid: 3,
    icon: '📅',
    problem: 'Termine werden noch manuell per E-Mail oder Telefon koordiniert. Das Back-and-Forth kostet unnötig Zeit und Nerven.',
    idea: 'Ein Online-Buchungstool eliminiert die Abstimmung komplett – Kunden buchen selbst, du bekommst die Termine automatisch in deinen Kalender.'
  },
  onboarding: {
    label: 'Kunden-Onboarding',
    savings: '2–3 Stunden pro Woche',
    savingsMid: 2.5,
    icon: '🤝',
    problem: 'Neue Kunden manuell einzuführen, Infos zu sammeln und Zugänge einzurichten dauert Stunden pro Neukunde.',
    idea: 'Automatisiertes Onboarding mit Formularen, Welcome-Mails und vorgefertigten Checklisten spart dir bei jedem neuen Kunden mehrere Stunden.'
  },
  marketing: {
    label: 'Marketing & Kundengewinnung',
    savings: '3–6 Stunden pro Woche',
    savingsMid: 4.5,
    icon: '📣',
    problem: 'Die Kundengewinnung läuft noch zu manuell – kein systematischer Funnel, kein automatisiertes Follow-up.',
    idea: 'Mit einem automatisierten Lead-Funnel und E-Mail-Sequenzen kannst du Interessenten systematisch in Kunden verwandeln – ohne manuellen Aufwand.'
  },
  projektorganisation: {
    label: 'Projektorganisation',
    savings: '3–5 Stunden pro Woche',
    savingsMid: 4,
    icon: '🗂️',
    problem: 'Projekte werden per E-Mail oder Tabellen verwaltet. Das führt zu Informationsverlust, Suchaufwand und verpassten Deadlines.',
    idea: 'Ein strukturiertes Projektmanagement-System mit automatischen Benachrichtigungen und Status-Updates reduziert Chaos und Koordinationsaufwand drastisch.'
  },
  dokumentation: {
    label: 'Dokumentation & Wissen',
    savings: '1–3 Stunden pro Woche',
    savingsMid: 2,
    icon: '📋',
    problem: 'Prozesse und Wissen sind nicht systematisch dokumentiert. Das führt zu Wiederholungen, Fehlern und Abhängigkeit von einzelnen Personen.',
    idea: 'Automatische Prozessdokumentation und ein internes Wiki sparen Zeit bei Einarbeitung und verhindern, dass dasselbe immer wieder erklärt werden muss.'
  }
};

/* ── Industry-Specific Tips ── */
const INDUSTRY_TIPS = {
  service: [
    'Automatische Erstberatungs-Buchung mit Fragebogen vorab',
    'Follow-up E-Mails nach Angeboten (24h, 72h, 7 Tage)',
    'Monatliche Reporting-Mails automatisch erstellen und versenden'
  ],
  agency: [
    'Briefing-Formulare automatisch in Projektdokumente umwandeln',
    'Kunden-Feedback automatisch sammeln und auswerten',
    'Rechnungsstellung und Mahnwesen komplett automatisieren'
  ],
  craft: [
    'Terminbuchung und -erinnerungen vollautomatisch',
    'Angebotserstellung mit Foto-Upload und automatischer Kalkulation',
    'Kundenbewertungen automatisch nach Auftrag anfragen'
  ],
  online: [
    'Warenkorb-Abbrecher automatisch zurückgewinnen',
    'Kunden-Segmentierung und personalisierte E-Mail-Sequenzen',
    'Support-Anfragen mit KI-Chatbot vorfiltern'
  ],
  other: [
    'Wiederkehrende E-Mails und Antworten automatisieren',
    'Rechnungsstellung und Buchhaltungs-Export automatisieren',
    'Aufgaben-Zuweisung und Team-Benachrichtigungen automatisieren'
  ]
};

/* ── Score Mapping ── */
function calculateScores(data) {
  const scores = {
    angebotsprozess:    getOfferScore(data.q3_offers),
    terminbuchung:      getAppointmentScore(data.q4_appointments),
    marketing:          getMarketingScore(data.q5_acquisition),
    projektorganisation: getOrganizationScore(data.q6_organization),
    dokumentation:      getDocumentationScore(data.q7_documentation),
    onboarding:         0  // derived below
  };

  // Onboarding derived from terminbuchung + projektorganisation average
  scores.onboarding = Math.round((scores.terminbuchung + scores.projektorganisation) / 2);

  // Admin time modifier (applied to all categories)
  const modifier = getAdminModifier(data.q8_admin_time);
  for (const key of Object.keys(scores)) {
    scores[key] = Math.max(0, Math.min(20, scores[key] + modifier));
  }

  // Total score normalized to 0-100
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const totalScore = Math.round((total / 120) * 100);

  // Top 3: categories with LOWEST score (= highest automation potential)
  const sorted = Object.entries(scores)
    .sort((a, b) => a[1] - b[1])
    .map(([key]) => key);
  const top3 = sorted.slice(0, 3);

  return { scores, totalScore, top3 };
}

function getOfferScore(val) {
  return { manual: 2, template: 8, software: 18, rarely: 12 }[val] ?? 8;
}
function getAppointmentScore(val) {
  return { email: 3, phone: 1, booking: 18, mixed: 8 }[val] ?? 5;
}
function getMarketingScore(val) {
  return { referral: 5, social: 10, website: 14, outreach: 8 }[val] ?? 8;
}
function getOrganizationScore(val) {
  return { email: 2, excel: 7, pm_tool: 15, crm: 18 }[val] ?? 8;
}
function getDocumentationScore(val) {
  return { none: 0, notes: 5, manual: 8, auto: 18 }[val] ?? 5;
}
function getAdminModifier(val) {
  return { low: 3, medium: 0, high: -3, very_high: -8 }[val] ?? 0;
}

/* ── Score Label ── */
function getScoreLabel(score) {
  if (score >= 80) return 'Sehr effiziente Prozesse';
  if (score >= 60) return 'Solide Struktur mit Potenzial';
  if (score >= 40) return 'Deutliches Effizienzpotenzial';
  return 'Sehr großes Automatisierungspotenzial';
}

function getScoreDescription(score) {
  if (score >= 80) return 'Deine Prozesse sind bereits gut strukturiert. Mit gezielten Optimierungen kannst du noch effizienter werden.';
  if (score >= 60) return 'Du hast eine solide Basis. Mit den richtigen Automatisierungen kannst du deutlich Zeit sparen.';
  if (score >= 40) return 'Es gibt klares Potenzial für Zeitersparnis. Mehrere deiner Prozesse lassen sich mit einfachen Tools automatisieren.';
  return 'Du hast erhebliches Automatisierungspotenzial. Mit den richtigen Tools kannst du wöchentlich viele Stunden zurückgewinnen.';
}

/* ── Potential Time Savings ── */
function calculateTotalSavings(top3) {
  const total = top3.reduce((sum, key) => sum + CATEGORIES[key].savingsMid, 0);
  const yearlyHours = Math.round(total * 52);
  return { weekly: total, yearly: yearlyHours };
}

/* ── localStorage Helpers ── */
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch(e) {
    console.warn('localStorage nicht verfügbar:', e);
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) {
    return null;
  }
}

function clearData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch(e) {}
}

/* ── Exports (global) ── */
window.FunnelData = {
  QUESTIONS,
  CATEGORIES,
  INDUSTRY_TIPS,
  calculateScores,
  getScoreLabel,
  getScoreDescription,
  calculateTotalSavings,
  saveData,
  loadData,
  clearData
};
