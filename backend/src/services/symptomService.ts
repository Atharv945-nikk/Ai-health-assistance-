import { v4 as uuidv4 } from 'uuid';
import { execute, queryAll } from '../database/connection.js';
import { evaluateEmergencyRules } from '../ai/emergencyRules.js';
import { assertNoPromptInjection } from '../ai/promptInjectionGuard.js';
import { auditService } from './auditService.js';
import { SymptomAssessmentResult, WhyConditionResult, UrgencyLevel } from '../types/shared.js';

export interface SymptomInput {
  symptoms: string;
  duration?: string;
  severityScale?: number;
  age?: number;
  knownConditions?: string[];
  medications?: string[];
  allergies?: string[];
  additionalContext?: string;
}

export class SymptomService {
  analyzeSymptoms(userId: string, input: SymptomInput): SymptomAssessmentResult {
    assertNoPromptInjection(input.symptoms);
    if (input.additionalContext) {
      assertNoPromptInjection(input.additionalContext);
    }

    const fullText = `${input.symptoms} ${input.additionalContext || ''}`;
    const emergencyEval = evaluateEmergencyRules(fullText);

    let result: SymptomAssessmentResult;

    if (emergencyEval.isEmergency) {
      auditService.log({
        userId,
        action: 'EMERGENCY_SYMPTOM_ASSESSMENT',
        resourceType: 'symptom_assessment',
        details: { matchedCategory: emergencyEval.matchedCategory, rule: emergencyEval.matchedRule },
      });

      result = {
        symptomsUnderstood: [input.symptoms],
        urgencyLevel: 'emergency',
        isEmergency: true,
        possibleExplanations: [
          {
            name: emergencyEval.matchedCategory || 'Acute Medical Emergency',
            description: 'The symptoms reported contain high-risk clinical red flags that require immediate emergency evaluation.',
            likelihood: 'high',
            supportingFactors: ['Reported symptoms match clinical emergency indicators.'],
          }
        ],
        supportingFactors: ['Acute onset or critical severity marker detected.'],
        factorsRequiringAttention: emergencyEval.immediateActions,
        missingInformation: ['Immediate emergency vitals and clinical examination are required.'],
        generalNextSteps: emergencyEval.immediateActions,
        whenToSeekCare: 'IMMEDIATELY: Call emergency services (911/112) or go to the nearest emergency room.',
        emergencyWarningSigns: emergencyEval.immediateActions,
        disclaimer: 'CRITICAL SAFETY ALERT: This educational triage tool has detected acute emergency warning signs. Do not wait. Contact emergency services immediately.',
      };
    } else {
      // Clinical Heuristic Differential Analysis
      const symLower = input.symptoms.toLowerCase();
      let urgency: UrgencyLevel = 'routine';
      if ((input.severityScale || 0) >= 8) urgency = 'urgent';
      else if ((input.severityScale || 0) >= 5) urgency = 'prompt';

      const possibleExplanations: SymptomAssessmentResult['possibleExplanations'] = [];
      const symptomsUnderstood: string[] = input.symptoms.split(/[,;\n]+/).map(s => s.trim()).filter(s => s.length > 0);

      // Diagnostic cluster detection
      if (symLower.includes('cough') || symLower.includes('fever') || symLower.includes('throat') || symLower.includes('cold')) {
        possibleExplanations.push({
          name: 'Upper Respiratory Tract Infection (Viral)',
          description: 'A common viral inflammation of the nasal passages, pharynx, or bronchi.',
          likelihood: 'high',
          supportingFactors: ['Presence of acute cough, sore throat, or mild pyrexia.'],
        });
        possibleExplanations.push({
          name: 'Allergic Rhinitis or Environmental Irritation',
          description: 'Inflammatory response to airborne allergens or pollutants.',
          likelihood: 'moderate',
          supportingFactors: ['Symptoms without significant constitutional fever or myalgia.'],
        });
      } else if (symLower.includes('headache') || symLower.includes('migraine')) {
        possibleExplanations.push({
          name: 'Tension-Type Headache',
          description: 'Mild to moderate bilateral pressing discomfort associated with cervical muscle strain or stress.',
          likelihood: 'high',
          supportingFactors: ['Absence of sudden focal neurologic deficits.'],
        });
        possibleExplanations.push({
          name: 'Migraine without Aura',
          description: 'Neurovascular episodic headache characterized by throbbing discomfort or sensory sensitivity.',
          likelihood: 'moderate',
          supportingFactors: ['Recurrent episodic course or unilateral predominance.'],
        });
      } else if (symLower.includes('stomach') || symLower.includes('nausea') || symLower.includes('vomit') || symLower.includes('diarrhea') || symLower.includes('abdomen')) {
        possibleExplanations.push({
          name: 'Acute Gastroenteritis / Dyspepsia',
          description: 'Transient irritation of the gastric or intestinal mucosa.',
          likelihood: 'high',
          supportingFactors: ['Abdominal cramping, nausea, or altered bowel habits.'],
        });
      } else if (symLower.includes('joint') || symLower.includes('knee') || symLower.includes('back') || symLower.includes('muscle')) {
        possibleExplanations.push({
          name: 'Musculoskeletal Strain / Sprain',
          description: 'Micro-tears or inflammation in myofascial fibers or ligamentous structures following exertion.',
          likelihood: 'high',
          supportingFactors: ['Localized mechanical tenderness exacerbated by motion.'],
        });
      } else {
        possibleExplanations.push({
          name: 'Non-Specific Clinical Symptom Cluster',
          description: 'The symptoms described can be associated with several benign or systemic conditions.',
          likelihood: 'moderate',
          supportingFactors: ['Non-localized or multifocal symptom presentation.'],
        });
      }

      result = {
        symptomsUnderstood: symptomsUnderstood.length > 0 ? symptomsUnderstood : [input.symptoms],
        urgencyLevel: urgency,
        isEmergency: false,
        possibleExplanations,
        supportingFactors: [
          `Reported duration: ${input.duration || 'Not specified'}.`,
          `Reported severity rating: ${input.severityScale || 'Moderate'} / 10.`,
          `Patient age: ${input.age ? `${input.age} years old` : 'Adult'}.`,
        ],
        factorsRequiringAttention: [
          'Monitor for sudden exacerbation or development of high fever, difficulty breathing, or severe pain.',
          'Note whether symptoms improve with hydration, rest, or standard over-the-counter measures.',
        ],
        missingInformation: [
          'Objective physical vital signs (temperature, blood pressure, oxygen saturation).',
          'Exact timeline of symptom progression and response to prior home treatments.',
          'Relevant family medical history.',
        ],
        generalNextSteps: [
          'Keep an organized daily symptom diary noting specific times, severity, and meals/activities.',
          'Ensure adequate hydration and restorative rest.',
          'Schedule an in-person consultation with a primary healthcare physician for a physical examination.',
        ],
        whenToSeekCare: urgency === 'urgent'
          ? 'Within the next 4 to 12 hours at an urgent care center or clinic.'
          : urgency === 'prompt'
          ? 'Within the next 24 to 48 hours with your primary care doctor.'
          : 'At your next routine wellness checkup, or sooner if symptoms persist beyond 7 days.',
        emergencyWarningSigns: [
          'Sudden severe chest pressure, tightness, or pain radiating to arm or jaw.',
          'Difficulty breathing, persistent gasping, or blue discoloration around lips.',
          'Sudden facial droop, arm weakness, or slurred speech.',
          'Sudden high fever accompanied by a stiff neck or confusion.',
        ],
        disclaimer: 'This assessment is for educational and guidance purposes only. It is not a clinical diagnosis or medical treatment plan. Always consult a licensed healthcare professional regarding personal medical conditions.',
      };
    }

    // Persist assessment to database
    const assessmentId = uuidv4();
    const now = new Date().toISOString();
    execute(
      `INSERT INTO symptom_assessments (id, user_id, reported_symptoms, duration, severity_scale, urgency_level, is_emergency_override, assessment_result_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assessmentId,
        userId,
        input.symptoms,
        input.duration || null,
        input.severityScale || null,
        result.urgencyLevel,
        result.isEmergency ? 1 : 0,
        JSON.stringify(result),
        now,
      ]
    );

    return result;
  }

  explainWhyCondition(conditionName: string, symptoms?: string): WhyConditionResult {
    assertNoPromptInjection(conditionName);
    if (symptoms) assertNoPromptInjection(symptoms);

    const cond = conditionName.trim();
    const condLower = cond.toLowerCase();

    let simpleExplanation = `${cond} is a medical condition affecting specific physiological systems.`;
    let biologicalMechanism = `Pathophysiologically, ${cond} alters normal cellular or organ homeostasis, creating detectable clinical manifestations.`;
    let contributingFactors = ['Genetic predisposition', 'Environmental exposures', 'Immune status', 'Lifestyle factors'];
    let riskFactors = ['Family history', 'Age', 'Sedentary habits or stress'];
    let supportingFindings = ['Specific symptom timing and clinical history matching standard presentations.'];
    let findingsRequiringEvaluation = ['Objective laboratory blood tests, imaging studies, and physical examination by a specialist.'];
    let cannotBeConcluded = [
      'Whether this condition is definitively present in any individual without in-person clinical workup.',
      'The exact stage, severity, or subtype of the condition.',
    ];

    if (condLower.includes('migraine')) {
      simpleExplanation = 'Migraine is a complex neurological disorder that causes recurrent episodes of moderate-to-severe headache, typically with sensory hypersensitivity.';
      biologicalMechanism = 'It involves activation of the trigeminovascular system, causing neurogenic inflammation and altered cortical excitability, leading to vascular dilation and pulsatile pain.';
      contributingFactors = ['Hormonal fluctuations', 'Sleep deprivation', 'Dietary triggers (caffeine, aged cheeses)', 'Bright sensory stimuli'];
      riskFactors = ['Family history of migraines', 'Female sex', 'High perceived stress'];
      supportingFindings = ['Unilateral throbbing headache', 'Nausea', 'Photophobia and phonophobia', 'Duration of 4 to 72 hours'];
      findingsRequiringEvaluation = ['Neurological physical exam to rule out secondary intracranial causes (e.g. vascular malformations).'];
    } else if (condLower.includes('diabetes') || condLower.includes('hyperglycemia')) {
      simpleExplanation = 'Diabetes is a metabolic condition where the body cannot effectively produce or utilize insulin, leading to elevated glucose levels in the bloodstream.';
      biologicalMechanism = 'In Type 2 Diabetes, target tissues develop insulin resistance, while pancreatic beta-cells experience progressive secretory decline. Excess circulating glucose overwhelms renal tubular reabsorption, inducing osmotic diuresis (frequent urination) and subsequent dehydration (polydipsia).';
      contributingFactors = ['Insulin receptor desensitization', 'Elevated adiposity', 'Chronic low-grade inflammation'];
      riskFactors = ['Body mass index (BMI) >= 25', 'First-degree relative with diabetes', 'Hypertension or dyslipidemia', 'Age >= 45'];
      supportingFindings = ['Polyuria (frequent urination)', 'Polydipsia (excessive thirst)', 'Unexplained weight loss', 'Chronic fatigue'];
      findingsRequiringEvaluation = ['Fasting blood plasma glucose test (>= 126 mg/dL)', 'HbA1c test (>= 6.5%)', 'Oral glucose tolerance test'];
    } else if (condLower.includes('asthma')) {
      simpleExplanation = 'Asthma is a chronic inflammatory disorder of the airways that causes periodic narrowing of the bronchial tubes, making breathing difficult.';
      biologicalMechanism = 'Airway hyper-reactivity causes bronchial smooth muscle bronchospasm, mucosal edema, and hypersecretion of thick mucus in response to inhaled irritants or allergens.';
      contributingFactors = ['Allergen inhalation (pollen, dust mites, pet dander)', 'Cold dry air', 'Viral respiratory infections', 'Physical exertion'];
      riskFactors = ['Atopic history (eczema, allergic rhinitis)', 'Occupational chemical exposure', 'Childhood environmental smoke exposure'];
      supportingFindings = ['Wheezing during expiration', 'Shortness of breath', 'Chest tightness', 'Nocturnal coughing'];
      findingsRequiringEvaluation = ['Spirometry demonstrating reversible airflow obstruction (FEV1 increase >= 12% following bronchodilator).'];
    }

    return {
      conditionName: cond,
      simpleExplanation,
      biologicalMechanism,
      contributingFactors,
      riskFactors,
      supportingFindings,
      findingsRequiringEvaluation,
      cannotBeConcluded,
      disclaimer: 'This educational explanation outlines why symptoms are biologically correlated with this condition. It is not an individual medical confirmation. A physician evaluation is required.',
    };
  }

  getPastAssessments(userId: string): any[] {
    const rows = queryAll<any>(
      `SELECT id, reported_symptoms as reportedSymptoms, duration, severity_scale as severityScale,
              urgency_level as urgencyLevel, is_emergency_override as isEmergency,
              assessment_result_json as resultJson, created_at as createdAt
       FROM symptom_assessments
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );

    return rows.map(r => ({
      id: r.id,
      reportedSymptoms: r.reportedSymptoms,
      duration: r.duration,
      severityScale: r.severityScale,
      urgencyLevel: r.urgencyLevel,
      isEmergency: Boolean(r.isEmergency),
      result: r.resultJson ? JSON.parse(r.resultJson) : undefined,
      createdAt: r.createdAt,
    }));
  }
}

export const symptomService = new SymptomService();
