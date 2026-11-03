// src/lib/services/aiModeration.ts
// AI helpers for the community (post screening) and peer skill exams.
// Every function degrades safely when GEMINI_API_KEY is missing.
import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODEL } from './aiService';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI(apiKey ? { apiKey } : undefined);

function extractJson(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  return start >= 0 && end > start ? text.slice(start, end + 1) : text;
}

export type PostVerdict = 'SCIENTIFIC' | 'NOT_SCIENTIFIC' | 'UNCERTAIN';

/**
 * Decides whether a community post is academic content.
 * UNCERTAIN means "could not decide" and the post is published, so a broken AI never blocks students.
 */
export async function classifyCommunityPost(text: string): Promise<{ verdict: PostVerdict; reason: string }> {
  if (!apiKey || !text.trim()) {
    return { verdict: 'UNCERTAIN', reason: 'AI moderation unavailable' };
  }

  const prompt = `
You moderate a university student platform for academic content.
Classify the post below. A post is SCIENTIFIC if it is about study, projects, courses, technology, career, or helping peers learn.
A post is NOT_SCIENTIFIC if it is jokes, memes, chit-chat, insults, or content unrelated to studies.
Be lenient with short, friendly messages that help or ask a study question.

POST:
"""${text.slice(0, 2000)}"""

Respond ONLY with JSON: {"verdict": "SCIENTIFIC" | "NOT_SCIENTIFIC" | "UNCERTAIN", "reason": "short reason in English"}
`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(extractJson(response.text || '{}')) as { verdict?: string; reason?: string };
    const verdict = parsed.verdict === 'NOT_SCIENTIFIC' || parsed.verdict === 'SCIENTIFIC' ? parsed.verdict : 'UNCERTAIN';
    return { verdict, reason: parsed.reason || '' };
  } catch (error) {
    console.error('Community moderation AI error:', error);
    return { verdict: 'UNCERTAIN', reason: 'AI moderation failed' };
  }
}

export interface ExamQuestion {
  question: string;
  options: string[];
  answer: number; // index of the correct option. Stored server-side only.
}

/** Generates a short multiple-choice exam for a skill. Throws if AI is unavailable. */
export async function generateSkillExam(skill: string, count = 5): Promise<ExamQuestion[]> {
  if (!apiKey) {
    throw new Error('AI exam generation is not configured');
  }

  const prompt = `
Create ${count} multiple-choice questions to check a university student's practical understanding of: "${skill}".
Rules:
- Test understanding and practice, not trivia about names or dates.
- Exactly 4 options per question, only one correct.
- Vary the position of the correct answer.
- Keep questions short and clear.

Respond ONLY with JSON: {"questions": [{"question": "...", "options": ["...","...","...","..."], "answer": 0}]}
where "answer" is the 0-based index of the correct option.
`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  const parsed = JSON.parse(extractJson(response.text || '{}')) as { questions?: ExamQuestion[] };
  const questions = (parsed.questions || []).filter(
    (q) =>
      typeof q.question === 'string' &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      Number.isInteger(q.answer) &&
      q.answer >= 0 &&
      q.answer < 4
  );

  if (questions.length < count) {
    throw new Error('AI returned an incomplete exam');
  }
  return questions.slice(0, count);
}
