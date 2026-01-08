import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { placements } = await req.json();

    // Convert placements object to readable grading list
    const formatted = Object.entries(placements)
      .map(([word, cat]) => `${word} → ${cat}`)
      .join("\n");

    const prompt = `
Grade this classification:
${formatted}

Reply ONLY like this JSON:
{
  "feedback": "Short scoring message"
}
`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a game scoring assistant. Reply ONLY with JSON containing 'feedback'. No other text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const output = response.choices[0].message.content.trim();

    return Response.json({ feedback: JSON.parse(output).feedback });
  } catch (err) {
    console.error("GAME CHECK ERROR:", err.message);
    return Response.json({ feedback: "⚠️ Could not check answers." });
  }
}
