import { QuestionType, QuizQuestion, MathDifficulty, MathSolution } from '../types';

export async function testGeminiApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Please enter your Gemini API key.' };
  }

  const trimmed = apiKey.trim();

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': trimmed },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
      })
    });

    const data = await res.json().catch(() => null);

    if (res.ok) {
      return { success: true, message: 'Gemini API key is valid.' };
    }

    const errMessage = (data?.error?.message || '').toLowerCase();
    const errStatus = (data?.error?.status || '').toLowerCase();

    if (
      res.status === 401 ||
      res.status === 403 ||
      errMessage.includes('api key') ||
      errMessage.includes('permission') ||
      errMessage.includes('unauthorized') ||
      errStatus.includes('invalid_argument') ||
      errStatus.includes('permission_denied') ||
      errStatus.includes('unauthenticated')
    ) {
      return { success: false, message: 'Invalid or unauthorized Gemini API key.' };
    }

    if (res.status === 404 || res.status === 503 || res.status === 429) {
      try {
        const modelsRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(trimmed)}`
        );
        if (modelsRes.ok) {
          return { success: true, message: 'Gemini API key is valid.' };
        }
        const modelsData = await modelsRes.json().catch(() => null);
        const modelsErr = (modelsData?.error?.message || '').toLowerCase();
        if (
          modelsRes.status === 400 ||
          modelsRes.status === 401 ||
          modelsRes.status === 403 ||
          modelsErr.includes('api key')
        ) {
          return { success: false, message: 'Invalid or unauthorized Gemini API key.' };
        }
      } catch {
        // Fall through to status handlers below
      }
    }

    if (res.status === 429) {
      return { success: false, message: 'Quota exceeded or rate limit reached. Please try again later.' };
    }

    if (res.status >= 500) {
      return { success: false, message: 'Gemini service is temporarily unavailable. Please try again later.' };
    }

    const shortMsg = data?.error?.message
      ? String(data.error.message).replace(trimmed, '[REDACTED]').slice(0, 100)
      : `HTTP ${res.status}`;
    return { success: false, message: shortMsg };
  } catch {
    return { success: false, message: 'Network error. Please check your internet connection.' };
  }
}

const SUPPORTED_GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3-flash'
];

function sanitizeError(msg: string, key?: string): string {
  if (!key || !key.trim()) return msg;
  return msg.replaceAll(key.trim(), '[REDACTED]');
}

/**
 * Executes a Gemini API generateContent call using supported models with automatic
 * fallback if a model experiences transient spikes or unavailability.
 */
async function callGeminiApi(
  apiKey: string,
  body: {
    contents: any[];
    generationConfig?: {
      temperature?: number;
      responseMimeType?: string;
    };
  }
): Promise<string> {
  const trimmedKey = apiKey.trim();
  let lastError: Error | null = null;

  for (const model of SUPPORTED_GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': trimmedKey },
        body: JSON.stringify(body)
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text || !text.trim()) {
          throw new Error('Gemini returned an empty response. Please try again.');
        }
        return text;
      }

      const errMsg = (data?.error?.message || '').toLowerCase();
      const errStatus = (data?.error?.status || '').toLowerCase();
      const safeMsg = sanitizeError(data?.error?.message || `HTTP ${res.status}`, trimmedKey);

      // Key errors: stop trying other models as the credentials are bad
      if (
        res.status === 400 && (errMsg.includes('api key') || errStatus.includes('invalid_argument'))
      ) {
        throw new Error('Invalid Gemini API Key. Please verify your key in Settings.');
      }
      if (res.status === 401 || res.status === 403) {
        throw new Error('Invalid or unauthorized Gemini API key. Please check your credentials in Settings.');
      }
      if (res.status === 429) {
        throw new Error('Gemini API quota or rate limit exceeded. Please wait a moment and try again.');
      }

      // If 404 (model not found) or 503 (model temporarily experiencing high demand), try next supported model
      if (res.status === 404 || res.status === 503) {
        lastError = new Error(`Gemini Error (${model}): ${safeMsg}`);
        continue;
      }

      throw new Error(`Gemini API Error (HTTP ${res.status}): ${safeMsg}`);
    } catch (err: unknown) {
      if (err instanceof Error && (
        err.message.includes('Invalid Gemini API Key') ||
        err.message.includes('Invalid or unauthorized') ||
        err.message.includes('quota or rate limit')
      )) {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('Gemini service is temporarily unavailable. Please try again.');
}

/**
 * Safely extracts and parses JSON from Gemini's response text, handling Markdown code fences
 * and conversational wrappers.
 */
function extractJsonFromAiResponse(rawText: string): any {
  if (!rawText || !rawText.trim()) {
    throw new Error('Gemini returned an empty response.');
  }

  let text = rawText.trim();
  if (text.startsWith('```json')) {
    text = text.slice(7).trim();
  } else if (text.startsWith('```')) {
    text = text.slice(3).trim();
  }
  if (text.endsWith('```')) {
    text = text.slice(0, -3).trim();
  }

  try {
    return JSON.parse(text);
  } catch {
    // If wrapped in commentary, extract the JSON block between braces or brackets
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    let startIdx = -1;
    let endIdx = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = text.lastIndexOf('}');
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = text.lastIndexOf(']');
    }

    if (startIdx !== -1 && endIdx > startIdx) {
      const candidate = text.slice(startIdx, endIdx + 1);
      try {
        return JSON.parse(candidate);
      } catch (innerErr) {
        throw new Error(`Failed to parse AI output: ${innerErr instanceof Error ? innerErr.message : String(innerErr)}`);
      }
    }
    throw new Error('Failed to parse AI output as JSON.');
  }
}

export async function generateQuizQuestions(
  apiKey: string,
  topic: string,
  questionType: QuestionType,
  count: number
): Promise<QuizQuestion[]> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Please configure your Gemini API key in Settings.');
  }
  if (!topic || !topic.trim()) {
    throw new Error('Please enter a quiz topic.');
  }

  const prompt = questionType === 'MCQ'
    ? `You are an expert academic examiner. Create exactly ${count} distinct, high-quality multiple choice questions (MCQs) for an academic exam on the topic: "${topic}".
STRICT REQUIREMENTS:
1. Generate EXACTLY ${count} questions.
2. For each question provide:
   - "question": clear question text
   - "options": array of 4 options labeled "A. ...", "B. ...", "C. ...", "D. ..."
   - "correctAnswer": exact string of the correct option (e.g. "B. ...")
   - "explanation": concise 1-2 sentence academic explanation.
3. Randomize the position of the correct answer (A, B, C, D).
4. Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "Sample question?",
      "options": ["A. opt1", "B. opt2", "C. opt3", "D. opt4"],
      "correctAnswer": "B. opt2",
      "explanation": "Explanation here."
    }
  ]
}`
    : `You are an expert academic examiner. Create exactly ${count} distinct, high-quality very short answer questions for an academic exam on the topic: "${topic}".
STRICT REQUIREMENTS:
1. Generate EXACTLY ${count} questions.
2. For each question provide:
   - "question": clear question requiring a short direct answer (1 to 5 words)
   - "correctAnswer": exact short answer term or phrase
   - "explanation": concise 1-2 sentence academic explanation.
3. Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "Sample question?",
      "correctAnswer": "Sample Answer",
      "explanation": "Explanation here."
    }
  ]
}`;

  const rawAiText = await callGeminiApi(apiKey, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json'
    }
  });

  const parsed = extractJsonFromAiResponse(rawAiText);
  const rawQuestions = parsed?.questions || (Array.isArray(parsed) ? parsed : []);
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    throw new Error('No questions could be extracted from AI response. Please try again.');
  }

  return rawQuestions.map((q: any, idx: number) => {
    let options: string[] = [];
    if (questionType === 'MCQ') {
      if (Array.isArray(q.options) && q.options.length >= 2) {
        options = q.options.map((opt: any, optIdx: number) => {
          const str = String(opt || '').trim();
          const prefix = ['A.', 'B.', 'C.', 'D.'][optIdx] || `${optIdx + 1}.`;
          return str.startsWith(prefix) ? str : `${prefix} ${str}`;
        });
      } else {
        options = ['A. Option 1', 'B. Option 2', 'C. Option 3', 'D. Option 4'];
      }
    }

    let correctAnswer = String(q.correctAnswer || '').trim();
    if (questionType === 'MCQ' && options.length > 0) {
      if (!options.includes(correctAnswer)) {
        const letter = correctAnswer.replace(/[^A-Za-z]/g, '').toUpperCase().charAt(0);
        const match = options.find(o => o.startsWith(letter + '.') || o.startsWith(letter + ')'));
        correctAnswer = match || options[0];
      }
    }

    return {
      id: idx + 1,
      question: String(q.question || `Question ${idx + 1}`).trim(),
      options,
      correctAnswer: correctAnswer || (options[0] || 'Answer'),
      explanation: String(q.explanation || 'No explanation provided.').trim()
    };
  });
}

/**
 * Generates academic Mathematics MCQs for a selected Chapter/Topic and Difficulty.
 */
export async function generateMathQuestions(
  apiKey: string,
  chapter: string,
  topic: string,
  difficulty: MathDifficulty,
  count: number
): Promise<QuizQuestion[]> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Please configure your Gemini API key in Settings.');
  }

  const mathTopic = topic.trim() || chapter;
  const prompt = `You are a distinguished mathematics professor and academic examination creator.
Generate exactly ${count} multiple choice questions (MCQs) for an academic mathematics exam.

Subject: Mathematics
Chapter: ${chapter}
Specific Topic: ${mathTopic}
Difficulty Level: ${difficulty} (Ensure the questions strictly match ${difficulty} difficulty standard)

REQUIREMENTS:
1. Generate EXACTLY ${count} high-quality, mathematically sound questions.
2. For each question:
   - "question": clearly formulated problem statement with clear mathematical notation (e.g. standard algebraic or arithmetic notation).
   - "options": 4 plausible options labeled "A. ...", "B. ...", "C. ...", "D. ..."
   - "correctAnswer": exact matching option string (e.g. "B. 4")
   - "explanation": concise step-by-step mathematical reasoning leading to the correct answer.
3. Randomize the position of the correct answer (A, B, C, D).
4. Return ONLY valid JSON formatted as:
{
  "questions": [
    {
      "question": "Solve for x: 3x - 5 = 16",
      "options": ["A. x = 5", "B. x = 7", "C. x = 6", "D. x = 8"],
      "correctAnswer": "B. x = 7",
      "explanation": "Add 5 to both sides: 3x = 21. Divide by 3: x = 7."
    }
  ]
}`;

  const rawAiText = await callGeminiApi(apiKey, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json'
    }
  });

  const parsed = extractJsonFromAiResponse(rawAiText);
  const rawQuestions = parsed?.questions || (Array.isArray(parsed) ? parsed : []);
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    throw new Error('No mathematics questions could be extracted from AI response. Please try again.');
  }

  return rawQuestions.map((q: any, idx: number) => {
    let options: string[] = [];
    if (Array.isArray(q.options) && q.options.length >= 2) {
      options = q.options.map((opt: any, optIdx: number) => {
        const str = String(opt || '').trim();
        const prefix = ['A.', 'B.', 'C.', 'D.'][optIdx] || `${optIdx + 1}.`;
        return str.startsWith(prefix) ? str : `${prefix} ${str}`;
      });
    } else {
      options = ['A. 1', 'B. 2', 'C. 3', 'D. 4'];
    }

    let correctAnswer = String(q.correctAnswer || '').trim();
    if (options.length > 0 && !options.includes(correctAnswer)) {
      const letter = correctAnswer.replace(/[^A-Za-z]/g, '').toUpperCase().charAt(0);
      const match = options.find(o => o.startsWith(letter + '.') || o.startsWith(letter + ')'));
      correctAnswer = match || options[0];
    }

    return {
      id: idx + 1,
      question: String(q.question || `Question ${idx + 1}`).trim(),
      options,
      correctAnswer: correctAnswer || options[0],
      explanation: String(q.explanation || 'No explanation provided.').trim(),
      chapter,
      topic: mathTopic,
      difficulty
    };
  });
}

/**
 * Solves a mathematical problem (Typed, Photo, or PDF) step-by-step using Gemini.
 */
export async function solveMathProblem(
  apiKey: string,
  chapter: string,
  topic: string,
  problemText: string,
  fileData?: { mimeType: string; base64: string }
): Promise<{ problem: string; solutionSteps: string[]; finalAnswer: string }> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Please configure your Gemini API key in Settings.');
  }

  const systemInstruction = `You are an expert academic mathematics tutor and solver.
Your task is to analyze the mathematical problem and provide a clean, step-by-step rigorous solution with a crystal clear final answer.

Chapter/Context: ${chapter || 'Mathematics'}
Topic: ${topic || 'General'}

Output Requirement:
Return ONLY valid JSON with this exact schema:
{
  "problem": "Clear verbatim or standardized statement of the math problem",
  "solutionSteps": [
    "Step 1: Description and formula",
    "Step 2: Substitution and calculation",
    "Step 3: Simplification"
  ],
  "finalAnswer": "The final simplified answer (e.g. x = 2 or 48 cm²)"
}`;

  const parts: any[] = [{ text: systemInstruction }];

  if (problemText && problemText.trim()) {
    parts.push({ text: `User Problem:\n${problemText.trim()}` });
  }

  if (fileData && fileData.base64) {
    parts.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.base64
      }
    });
    parts.push({
      text: "Please extract the mathematical problem from the attached document/image, state it clearly in the 'problem' field, and provide the complete step-by-step solution."
    });
  }

  const rawAiText = await callGeminiApi(apiKey, {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  });

  try {
    const parsed = extractJsonFromAiResponse(rawAiText);
    return {
      problem: parsed.problem || problemText || 'Mathematical Problem',
      solutionSteps: Array.isArray(parsed.solutionSteps)
        ? parsed.solutionSteps.map((s: any) => String(s).trim())
        : [String(parsed.solutionSteps || 'Solution provided.')],
      finalAnswer: String(parsed.finalAnswer || 'See solution steps.').trim()
    };
  } catch {
    // If JSON parsing fails, fallback gracefully so the student still sees the full solution
    const cleanLines = rawAiText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('```'));

    return {
      problem: problemText || 'Mathematical Problem',
      solutionSteps: cleanLines.length > 0 ? cleanLines : [rawAiText.trim()],
      finalAnswer: 'See step-by-step solution above.'
    };
  }
}
