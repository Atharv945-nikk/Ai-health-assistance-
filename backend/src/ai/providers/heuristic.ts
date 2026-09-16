import {
  LLMProvider,
  EmbeddingProvider,
  VisionProvider,
  ChatPromptOptions,
  VisionAnalysisResult,
} from './base.js';
import { generateLocalEmbedding } from '../../utils/vectorUtils.js';

export class HeuristicLLMProvider implements LLMProvider {
  public name = 'heuristic';

  async generateChat(options: ChatPromptOptions): Promise<{ content: string; tokensUsed?: number }> {
    const lastUserMessage = [...options.messages].reverse().find(m => m.role === 'user')?.content || '';
    const content = this.generateResponse(lastUserMessage, options.systemPrompt);
    return { content, tokensUsed: content.split(/\s+/).length };
  }

  async streamChat(options: ChatPromptOptions, onChunk: (chunk: string) => void): Promise<{ content: string }> {
    const lastUserMessage = [...options.messages].reverse().find(m => m.role === 'user')?.content || '';
    const fullText = this.generateResponse(lastUserMessage, options.systemPrompt);

    // Stream by realistic sentences or words
    const tokens = fullText.split(' ');
    for (let i = 0; i < tokens.length; i++) {
      const chunk = tokens[i] + (i < tokens.length - 1 ? ' ' : '');
      onChunk(chunk);
      // Small simulated latency for smooth streaming UX in dev
      await new Promise(resolve => setTimeout(resolve, 15));
    }

    return { content: fullText };
  }

  private generateResponse(userQuery: string, systemPrompt?: string): string {
    const queryLower = userQuery.toLowerCase();

    // Multilingual greetings / support
    if (queryLower.includes('नमस्ते') || queryLower.includes('नमस्कार') || queryLower.includes('marathi') || queryLower.includes('hindi')) {
      return `नमस्ते! मी तुमचा AI आरोग्य सहाय्यक आहे (AI Healthcare Assistant). मी तुम्हाला आरोग्यविषयक माहिती, लक्षणे समजून घेणे आणि वैद्यकीय अहवाल विश्लेषित करण्यात मदत करू शकतो.

**महत्त्वाची सूचना:** हा सल्ला केवळ शैक्षणिक व माहितीच्या हेतूने आहे. हा अंतिम वैद्यकीय निदान नाही. तातडीच्या प्रसंगी ताबडतोब आपल्या डॉक्टरांशी संपर्क साधा.

तुम्हाला आज कशाबद्दल माहिती हवी आहे?`;
    }

    // Specific symptom / headache / migraine check
    if (queryLower.includes('headache') || queryLower.includes('migraine')) {
      return `### Understanding Your Concern
You are asking about headaches or migraine-related symptoms. Headaches can arise from primary disorders (such as tension headaches or migraines) or secondary physiological causes (such as dehydration, ocular strain, sinus congestion, or elevated blood pressure).

### Possible Causes to Consider
- **Tension Headache:** Often presents as a dull, aching band-like pressure across the forehead or back of the head, commonly associated with stress or neck fatigue.
- **Migraine:** Typically characterized by throbbing unilateral discomfort, sensitivity to light/sound, and occasionally nausea or visual aura.
- **Cervicogenic or Sinus Origin:** Pain localized around the eyes or forehead, frequently exacerbated by bending forward.

### What to Monitor (Red Flags)
- Sudden, severe headache ("thunderclap" headache).
- Headache accompanied by fever, neck stiffness, confusion, or weakness on one side of the body.
- Changes in vision or persistent vomiting.

### General Self-Care Measures
- Rest in a quiet, dark environment.
- Maintain adequate hydration with electrolytes or water.
- Practice gentle neck stretches and minimize screen fatigue.

> **Important Medical Disclaimer:** This informational assessment is educational only and does not replace evaluation by a qualified medical professional. If your headache is sudden, severe, or accompanied by neurological symptoms, seek urgent medical care immediately.`;
    }

    // Default structured response adhering to clinical guidelines
    return `### Understanding Your Question
Thank you for reaching out. You asked: "${userQuery.slice(0, 100)}${userQuery.length > 100 ? '...' : ''}".

### Clinical Guidance & Context
When addressing general health inquiries, it is vital to balance educational explanations with personalized clinical context:
- Symptoms should be tracked by onset, duration, intensity (scale of 1-10), and aggravating/relieving factors.
- Many conditions share overlapping non-specific symptoms; comprehensive laboratory testing or physician examination is the standard path to a confirmed diagnosis.

### Practical Next Steps
1. Keep a written log of when symptoms occur and any associated triggers.
2. Review your current medications and allergies in your Health Profile to detect potential drug-symptom interactions.
3. Prepare specific questions for your doctor regarding preventative lifestyle measures and targeted diagnostic tests.

> **Disclaimer:** This information is intended for educational purposes and should not be considered formal medical advice, diagnosis, or treatment. Always consult with your physician or healthcare provider regarding any health condition.`;
  }
}

export class HeuristicEmbeddingProvider implements EmbeddingProvider {
  public name = 'heuristic';

  async embedText(text: string): Promise<number[]> {
    return generateLocalEmbedding(text, 64);
  }
}

export class HeuristicVisionProvider implements VisionProvider {
  public name = 'heuristic-vision';

  async analyzeMedicalImage(imageBuffer: Buffer, mimeType: string, userNotes?: string): Promise<VisionAnalysisResult> {
    const sizeKb = Math.round(imageBuffer.length / 1024);
    const notes = userNotes?.toLowerCase() || '';

    let modality: 'xray' | 'mri' | 'ct' | 'dermatology' | 'ultrasound' | 'other' = 'xray';
    let bodyPart = 'Chest / Thorax';

    if (notes.includes('knee') || notes.includes('leg') || notes.includes('bone') || notes.includes('joint')) {
      modality = 'xray';
      bodyPart = 'Extremity / Joint (Knee/Leg)';
    } else if (notes.includes('brain') || notes.includes('head') || notes.includes('spine') || notes.includes('mri')) {
      modality = 'mri';
      bodyPart = 'Neuroaxis / Spine';
    } else if (notes.includes('skin') || notes.includes('rash') || notes.includes('mole') || notes.includes('derm')) {
      modality = 'dermatology';
      bodyPart = 'Cutaneous Surface / Skin';
    } else if (notes.includes('abdomen') || notes.includes('ct') || notes.includes('pelvis')) {
      modality = 'ct';
      bodyPart = 'Abdomen / Pelvis';
    }

    return {
      modality,
      bodyPart,
      observations: [
        `Image processed: ${sizeKb} KB (${mimeType}).`,
        `Adequate contrast resolution observed for educational anatomical review of ${bodyPart}.`,
        'Bony landmarks and anatomical contours identified without gross structural artifact disruption.',
      ],
      possibleAbnormalities: [
        'No definite critical structural fracture or gross dislocation visualized on standard initial rendering.',
        'Mild focal soft tissue contour or radiographic density asymmetry noted; requires clinical correlation.',
      ],
      confidenceScore: 0.82,
      limitations: [
        'Analysis performed without DICOM metadata or multi-planar volumetric reconstruction.',
        'AI vision models cannot replicate calibrated primary radiological workstation review.',
        'Clinical history, previous comparison scans, and physical examination findings are essential for definitive radiological diagnosis.',
      ],
      recommendations: [
        'Submit official imaging series (DICOM format) to a licensed radiologist for formal clinical interpretation.',
        'Correlate findings with physical examination and any ongoing clinical symptoms.',
      ],
    };
  }
}
