import { UrgencyLevel } from '../types/shared.js';

export interface EmergencyEvaluation {
  isEmergency: boolean;
  urgencyLevel: UrgencyLevel;
  matchedRule?: string;
  matchedCategory?: string;
  immediateActions: string[];
}

interface RuleDefinition {
  category: string;
  urgency: UrgencyLevel;
  patterns: RegExp[];
  advice: string[];
}

const CLINICAL_RULES: RuleDefinition[] = [
  // 1. Level 5: Acute Coronary / Cardiac Emergency
  {
    category: 'Acute Cardiac / Coronary Emergency',
    urgency: 'emergency',
    patterns: [
      /\b(chest pain|chest tightness|pressure in chest|crushing chest)\b.*?\b(left arm|jaw|neck|back|shoulder|sweat|sweating|cold sweat|shortness of breath|dyspnea|nausea)\b/i,
      /\b(heart attack|myocardial infarction|crushing chest pain)\b/i,
      /\b(cardiac arrest|passed out|collapse|unconscious)\b/i,
    ],
    advice: [
      'Call emergency medical services (911 / 112 / your local emergency number) immediately.',
      'Chew and swallow an aspirin (325 mg) if advised by emergency dispatch and you have no aspirin allergy or active bleeding.',
      'Sit or lie down in a position of maximum comfort and avoid physical exertion.',
      'Do not attempt to drive yourself to the emergency department.',
    ]
  },

  // 2. Level 5: Acute Cerebrovascular Event (Stroke / FAST)
  {
    category: 'Acute Stroke (FAST Warning Signs)',
    urgency: 'emergency',
    patterns: [
      /\b(facial droop|face drooping|slurred speech|cannot speak|loss of speech|arm weakness|one side paralyzed|unilateral weakness)\b/i,
      /\b(sudden numbness|sudden paralysis|stroke symptoms)\b/i,
      /\b(worst headache of my life|thunderclap headache)\b/i,
    ],
    advice: [
      'Call emergency medical services immediately. Note the exact time when symptoms began.',
      'Do not give the person anything to eat or drink (choking hazard).',
      'Do not administer aspirin before a CT scan is performed in the hospital (to rule out hemorrhagic stroke).',
      'Keep the person calm and lying flat or slightly elevated.',
    ]
  },

  // 3. Level 5: Severe Airway Compromise & Anaphylaxis
  {
    category: 'Acute Respiratory Failure & Anaphylaxis',
    urgency: 'emergency',
    patterns: [
      /\b(cannot breathe|stridor|gasping for air|blue lips|cyanosis|choking)\b/i,
      /\b(throat closing|tongue swelling|lip swelling|swollen airway|swelling of the tongue|throat is closing)\b/i,
      /\b(anaphylaxis|anaphylactic)\b/i,
      /\b(peanut|bee sting|allergy|allergic)\b.*?\b(throat|breathing|swelling|swollen)\b/i,
      /\b(throat|breathing|swelling|swollen)\b.*?\b(peanut|bee sting|allergy|allergic)\b/i,
    ],
    advice: [
      'Use an epinephrine auto-injector (EpiPen) immediately if prescribed and available.',
      'Call emergency medical services right away, even if symptoms temporarily improve after epinephrine.',
      'Remain seated or lying with legs elevated unless breathing is easier upright.',
    ]
  },

  // 4. Level 5: Acute Psychiatric Crisis & Self-Harm
  {
    category: 'Acute Psychiatric Crisis / Self-Harm Risk',
    urgency: 'emergency',
    patterns: [
      /\b(kill myself|suicide|commit suicide|end my life|want to die|take all my pills|slit my wrists)\b/i,
    ],
    advice: [
      'You are not alone. Please contact the National Suicide and Crisis Lifeline immediately by dialing 988 (in the US/Canada) or your local crisis helpline.',
      'Text HOME to 741741 to connect with a crisis counselor.',
      'Go to the nearest hospital emergency room or stay with a trusted friend/family member.',
    ]
  },

  // 5. Level 4: Urgent Warning Signs
  {
    category: 'Urgent Medical Attention Required',
    urgency: 'urgent',
    patterns: [
      /\b(high fever|fever > 103|fever > 39\.5|stiff neck|coughing blood|hemoptysis)\b/i,
      /\b(severe abdominal pain|acute abdomen|rigid abdomen|blood in stool|black tarry stool|melena)\b/i,
      /\b(blood in vomit|coffee ground emesis|severe dehydration|unable to keep fluids)\b/i,
    ],
    advice: [
      'Seek evaluation at an urgent care facility or emergency clinic within the next few hours.',
      'Monitor temperature and fluid intake.',
      'Do not take pain medication that masks symptoms before clinical evaluation if abdominal pain is severe.',
    ]
  },

  // 6. Level 3: Prompt Medical Attention (Next 24-48 Hours)
  {
    category: 'Prompt Medical Consultation',
    urgency: 'prompt',
    patterns: [
      /\b(persistent fever|fever for 3 days|fever for 4 days|fever for 5 days)\b/i,
      /\b(ear pain|sinus pressure|urinary pain|dysuria|burning when urinating|unexplained rash|spreading rash)\b/i,
      /\b(swollen ankle|sprained ankle|deep cut|wound infection|pus)\b/i,
    ],
    advice: [
      'Schedule an appointment with a primary healthcare provider or visit an outpatient clinic within 24 to 48 hours.',
      'Rest and maintain adequate hydration.',
      'Record symptom trajectory to provide accurate history to your doctor.',
    ]
  }
];

export function evaluateEmergencyRules(text: string): EmergencyEvaluation {
  const normalized = text.toLowerCase();

  for (const rule of CLINICAL_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(normalized)) {
        return {
          isEmergency: rule.urgency === 'emergency',
          urgencyLevel: rule.urgency,
          matchedRule: pattern.toString(),
          matchedCategory: rule.category,
          immediateActions: rule.advice,
        };
      }
    }
  }

  // Default evaluation when no acute red flags are triggered
  return {
    isEmergency: false,
    urgencyLevel: 'routine',
    immediateActions: [
      'Discuss these symptoms with your primary care provider during routine consultations.',
      'Seek timely evaluation if symptoms worsen, do not improve, or if new red-flag signs emerge.',
    ],
  };
}
