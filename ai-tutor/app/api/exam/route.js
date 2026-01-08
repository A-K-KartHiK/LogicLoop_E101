import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { topic, numQuestions } = await req.json();

    const prompt = `
Generate an exam paper on the topic "${topic}" with EXACTLY:
- ${numQuestions} MCQs (A-D)
- ${numQuestions} Short Answer (2-3 sentences expected)
- ${numQuestions} Long Answer questions (detailed explanation expected)

RETURN STRICT VALID JSON ONLY WITH NO COMMENTS:
{
  "mcq": [
    { "q": "...", "options": ["A) ..","B) ..","C) ..","D) .."], "answer": "A" }
  ],
  "short": [
    { "q": "...", "answer": "..." }
  ],
  "long": [
    { "q": "...", "answer": "..." }
  ]
}
`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You output valid JSON only." },
        { role: "user", content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const text = response.choices[0].message.content.trim();
    return Response.json({ exam: text });
  } catch (e) {
    console.error("EXAM API ERROR:", e.message);
    return Response.json({ exam: null }, { status: 500 });
  }
}
