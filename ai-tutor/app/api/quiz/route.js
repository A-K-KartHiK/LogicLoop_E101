import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Difficulty buckets
const LEVEL_NAMES = ["Easy", "Medium", "Hard"];

export async function POST(req) {
  try {
    const body = await req.json();
    const { topic, correctCount = 0, wrongCount = 0 } = body;

    // Start Medium for first question
    let levelIndex = 1;

    // Adapt difficulty
    if (correctCount >= 2) levelIndex = 2;     // Hard
    if (wrongCount >= 2) levelIndex = 0;       // Easy

    const difficulty = LEVEL_NAMES[levelIndex];

    // Groq prompt
    const prompt = `
Generate ONE ${difficulty} difficulty multiple-choice question about "${topic}".
Output EXACTLY this JSON (no commentary, no code block):

{
  "question": "...",
  "difficulty": "${difficulty}",
  "options": ["A) ...","B) ...","C) ...","D) ..."],
  "answer": "A",
  "explain": "Why the answer is correct in 1 paragraph."
}
`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a professional quiz generator bot. ALWAYS respond only with JSON. Do not explain, talk, ask, or provide instructions outside JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const text = response.choices[0].message.content.trim();

    return Response.json({ quiz: text });
  } catch (err) {
    console.error("QUIZ API ERROR:", err.message);
    return Response.json({ quiz: null }, { status: 500 });
  }
}
