import { MedicineInfo } from '../types/shared.js';
import { AppError } from '../middlewares/errorHandler.js';

const MEDICINES_DATABASE: MedicineInfo[] = [
  {
    id: 'med-001',
    genericName: 'Paracetamol / Acetaminophen',
    brandNames: ['Tylenol', 'Panadol', 'Calpol', 'Crocin'],
    commonUses: [
      'Relief of mild to moderate pain (headaches, muscle aches, toothaches)',
      'Reduction of fever (antipyretic)',
      'Adjunct in multimodal pain management regimens',
    ],
    mechanismOfAction: 'Inhibits central prostaglandin synthesis in the central nervous system and modulates descending serotonergic pain pathways.',
    commonSideEffects: ['Nausea', 'Mild stomach discomfort', 'Headache'],
    seriousSideEffects: [
      'Hepatotoxicity (liver damage) at doses exceeding 4,000 mg/day or when combined with excessive alcohol',
      'Rare severe cutaneous adverse reactions (Stevens-Johnson syndrome)',
    ],
    precautions: [
      'Maximum adult daily dose is 4,000 mg (often limited to 3,000 mg or less in elderly patients or chronic liver impairment)',
      'Check all concurrent cold/flu combination products to avoid accidental cumulative acetaminophen overdose',
    ],
    commonInteractions: [
      'Warfarin (chronic daily use may enhance anticoagulant effect)',
      'Alcohol (increases risk of hepatic toxicity)',
      'Isoniazid (enhanced risk of hepatotoxicity)',
    ],
    storageAdvice: 'Store at room temperature between 20°C and 25°C (68°F to 77°F), away from moisture and heat.',
    generalWarnings: [
      'Do not exceed recommended dosage.',
      'Do not take with other acetaminophen-containing medications without physician guidance.',
    ],
    whenToContactDoctor: [
      'Pain persists longer than 10 days in adults (5 days in children)',
      'Fever lasts longer than 3 days or exceeds 39.5°C (103°F)',
      'Development of unexplained skin redness, blistering, or jaundice (yellowing of eyes/skin)',
    ],
    sources: [
      {
        id: 'fda-apap',
        title: 'FDA Drug Safety Communication: Prescription Acetaminophen Products',
        organization: 'U.S. Food and Drug Administration (FDA)',
        sourceUrl: 'https://www.fda.gov/drugs/drug-safety-and-availability/acetaminophen',
        evidenceLevel: 'A',
        snippet: 'FDA limits acetaminophen dosage in prescription combination products to protect consumers from severe liver injury.',
      },
    ],
    updatedAt: '2024-02-10',
  },
  {
    id: 'med-002',
    genericName: 'Amoxicillin',
    brandNames: ['Amoxil', 'Trimox', 'Moxatag'],
    commonUses: [
      'Bacterial infections of the ear, nose, and throat (acute otitis media, streptococcal pharyngitis)',
      'Lower respiratory tract infections (community-acquired pneumonia)',
      'Urinary tract infections and Helicobacter pylori eradication (in combination therapy)',
    ],
    mechanismOfAction: 'Inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins (PBPs), causing cell lysis and death (bactericidal beta-lactam).',
    commonSideEffects: ['Diarrhea', 'Nausea', 'Vomiting', 'Mild transient skin rash'],
    seriousSideEffects: [
      'Severe allergic reactions / anaphylaxis (angioedema, bronchospasm, urticaria)',
      'Clostridioides difficile-associated diarrhea (pseudomembranous colitis)',
    ],
    precautions: [
      'Contraindicated in patients with a verified history of severe allergic reaction (anaphylaxis) to beta-lactams.',
      'Complete the entire prescribed duration of antimicrobial therapy even if symptoms improve early, to prevent antibiotic resistance.',
    ],
    commonInteractions: [
      'Methotrexate (reduced renal clearance)',
      'Probenecid (increases amoxicillin serum concentrations)',
      'Oral contraceptives (may reduce efficacy; backup barrier method advised)',
    ],
    storageAdvice: 'Capsules and tablets: room temperature. Liquid suspension: refrigerate (2°C - 8°C) and discard unused portion after 14 days.',
    generalWarnings: [
      'Amoxicillin treats bacterial infections only. It is completely ineffective against viral colds, flu, or COVID-19.',
    ],
    whenToContactDoctor: [
      'Severe watery diarrhea lasting more than 2 days',
      'Difficulty breathing, wheezing, or facial swelling',
      'Spreading itchy hives or skin rash',
    ],
    sources: [
      {
        id: 'who-amox',
        title: 'WHO Model List of Essential Medicines - Antibacterials',
        organization: 'World Health Organization (WHO)',
        sourceUrl: 'https://www.who.int/groups/expert-committee-on-selection-and-use-of-essential-medicines',
        evidenceLevel: 'A',
        snippet: 'Amoxicillin is categorized as an Access group antibiotic in the WHO AWaRe classification.',
      },
    ],
    updatedAt: '2024-01-18',
  },
  {
    id: 'med-003',
    genericName: 'Metformin Hydrochloride',
    brandNames: ['Glucophage', 'Fortamet', 'Glumetza'],
    commonUses: [
      'First-line pharmacological management of Type 2 Diabetes Mellitus',
      'Polycystic ovary syndrome (PCOS) management (off-label)',
      'Prevention of Type 2 diabetes in high-risk pre-diabetic individuals',
    ],
    mechanismOfAction: 'Decreases hepatic gluconeogenesis, reduces intestinal glucose absorption, and enhances peripheral insulin sensitivity by activating AMP-activated protein kinase (AMPK).',
    commonSideEffects: ['Diarrhea', 'Flatulence', 'Abdominal cramping', 'Metallic taste in mouth'],
    seriousSideEffects: [
      'Lactic acidosis (rare but life-threatening metabolic emergency)',
      'Vitamin B12 deficiency with prolonged use (due to decreased ileal absorption)',
    ],
    precautions: [
      'Contraindicated in severe renal impairment (eGFR < 30 mL/min/1.73m²)',
      'Must be temporarily withheld prior to iodinated radiocontrast imaging procedures',
    ],
    commonInteractions: [
      'Iodinated contrast media (increased risk of contrast-induced nephropathy and lactic acidosis)',
      'Cimetidine (increases metformin plasma concentrations)',
      'Heavy alcohol consumption (enhances lactic acidosis risk)',
    ],
    storageAdvice: 'Store at 20°C to 25°C (68°F to 77°F). Protect from excessive heat and moisture.',
    generalWarnings: [
      'Take with meals to substantially reduce gastrointestinal side effects.',
      'Never alter prescribed dosage without clinical monitoring of glycemic parameters (HbA1c).',
    ],
    whenToContactDoctor: [
      'Signs of lactic acidosis: severe fatigue, muscle aches, hyperventilation, persistent stomach discomfort',
      'Numbness, tingling, or weakness in hands/feet (signs of B12 deficiency)',
    ],
    sources: [
      {
        id: 'ada-metformin',
        title: 'ADA Standards of Care: Pharmacologic Approaches to Glycemic Treatment',
        organization: 'American Diabetes Association',
        sourceUrl: 'https://diabetesjournals.org/care',
        evidenceLevel: 'A',
        snippet: 'Metformin remains the foundational first-line therapy for type 2 diabetes unless contraindicated.',
      },
    ],
    updatedAt: '2024-03-01',
  },
  {
    id: 'med-004',
    genericName: 'Atorvastatin',
    brandNames: ['Lipitor', 'Torvast', 'Atorva'],
    commonUses: [
      'Reduction of elevated low-density lipoprotein cholesterol (LDL-C) and total cholesterol',
      'Primary and secondary prevention of atherosclerotic cardiovascular events (heart attacks, strokes)',
    ],
    mechanismOfAction: 'Competitively inhibits 3-hydroxy-3-methylglutaryl-coenzyme A (HMG-CoA) reductase, the rate-limiting enzyme in hepatic cholesterol biosynthesis.',
    commonSideEffects: ['Myalgia (muscle ache)', 'Mild joint stiffness', 'Nasopharyngitis', 'Mild elevation in liver transaminases'],
    seriousSideEffects: [
      'Rhabdomyolysis (severe skeletal muscle breakdown with acute renal failure)',
      'Hepatotoxicity (significant hepatic enzyme elevation)',
    ],
    precautions: [
      'Contraindicated in active liver disease or unexplained persistent hepatic enzyme elevation',
      'Contraindicated during pregnancy and breastfeeding',
    ],
    commonInteractions: [
      'Grapefruit juice in large amounts (inhibits CYP3A4 metabolism, raising drug levels)',
      'Clarithromycin / Erythromycin (potent CYP3A4 inhibitors, greatly elevates myopathy risk)',
      'Cyclosporine and Gemfibrozil (elevates rhabdomyolysis risk)',
    ],
    storageAdvice: 'Store at 20°C to 25°C (68°F to 77°F).',
    generalWarnings: [
      'Adhere to healthy dietary and exercise habits alongside pharmacological statin therapy.',
    ],
    whenToContactDoctor: [
      'Unexplained muscle pain, tenderness, or weakness, especially accompanied by dark (tea-colored) urine or fever',
      'Yellowing of skin or eyes, loss of appetite, dark urine (liver warnings)',
    ],
    sources: [
      {
        id: 'acc-statin',
        title: 'AHA/ACC Guideline on the Management of Blood Cholesterol',
        organization: 'American Heart Association / American College of Cardiology',
        sourceUrl: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000625',
        evidenceLevel: 'A',
        snippet: 'High-intensity statin therapy with atorvastatin reliably reduces major adverse cardiovascular events.',
      },
    ],
    updatedAt: '2024-02-28',
  },
  {
    id: 'med-005',
    genericName: 'Albuterol / Salbutamol Inhaler',
    brandNames: ['Ventolin', 'ProAir', 'Proventil', 'Asthalin'],
    commonUses: [
      'Rapid relief of acute bronchospasm in bronchial asthma and COPD',
      'Prevention of exercise-induced bronchoconstriction',
    ],
    mechanismOfAction: 'Selective short-acting beta-2 adrenergic agonist (SABA) that stimulates adenylyl cyclase, relaxing bronchial smooth muscle within minutes.',
    commonSideEffects: ['Fine skeletal muscle tremor (especially hands)', 'Tachycardia (rapid heartbeat)', 'Palpitations', 'Nervousness'],
    seriousSideEffects: [
      'Paradoxical bronchospasm (sudden worsening of airway constriction after inhalation)',
      'Hypokalemia (potassium shift at high doses)',
      'Cardiac arrhythmias',
    ],
    precautions: [
      'If using more than 2 canisters per year or relying on rescue inhaler more than twice weekly, asthma maintenance therapy requires escalation.',
    ],
    commonInteractions: [
      'Non-selective beta-blockers (e.g. Propranolol) directly antagonize bronchodilatory action and may precipitate severe bronchospasm.',
      'Diuretics (may potentiate hypokalemia).',
    ],
    storageAdvice: 'Store between 15°C and 25°C. Do not puncture or expose pressurized canister to open flame.',
    generalWarnings: [
      'Albuterol is a rescue bronchodilator; it does not treat the underlying chronic inflammation in asthma.',
    ],
    whenToContactDoctor: [
      'Rescue inhaler does not provide breathing relief within 15 minutes',
      'Need for rescue puffs increases noticeably over 24-48 hours',
      'Difficulty speaking in full sentences due to breathlessness (Call Emergency immediately)',
    ],
    sources: [
      {
        id: 'gina-asthma',
        title: 'Global Strategy for Asthma Management and Prevention (GINA)',
        organization: 'Global Initiative for Asthma',
        sourceUrl: 'https://ginasthma.org/gina-reports/',
        evidenceLevel: 'A',
        snippet: 'GINA emphasizes appropriate use of SABA and integration of inhaled corticosteroids for asthma safety.',
      },
    ],
    updatedAt: '2024-03-10',
  },
];

export class MedicineService {
  searchMedicines(query: string): MedicineInfo[] {
    const q = query.toLowerCase().trim();
    if (!q) return MEDICINES_DATABASE;

    return MEDICINES_DATABASE.filter(m =>
      m.genericName.toLowerCase().includes(q) ||
      m.brandNames.some((b: string) => b.toLowerCase().includes(q)) ||
      m.commonUses.some((u: string) => u.toLowerCase().includes(q))
    );
  }

  getMedicineByName(name: string): MedicineInfo {
    const q = name.toLowerCase().trim();
    const match = MEDICINES_DATABASE.find(m =>
      m.genericName.toLowerCase().includes(q) ||
      m.brandNames.some((b: string) => b.toLowerCase().includes(q))
    );

    if (!match) {
      throw new AppError(`Medicine '${name}' not found in the verified pharmacopeia database.`, 404, 'NOT_FOUND');
    }

    return match;
  }
}

export const medicineService = new MedicineService();
