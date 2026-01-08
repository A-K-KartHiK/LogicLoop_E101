import Groq from "groq-sdk";
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Store mapping in server memory
let latestMapping = {};

export async function POST(req) {
  try {
    const { topic } = await req.json();

    const prompt = `
Create a drag-and-drop concept sorting puzzle for topic: "${topic}".
Rules:
- EXACT JSON only, NO commentary
- 2 to 3 categories
- 6 to 12 items
- Include correct mapping

Format:
{
  "categories": ["...", "..."],
  "items": ["...", "..."],
  "mapping": {"item":"category", ...}
}
`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });

    const text = response.choices[0].message.content.trim();

    const json = JSON.parse(text); // parse now

    // Save mapping globally
    latestMapping = json.mapping;

    return Response.json({
      categories: json.categories,
      items: json.items,
    });
  } catch (err) {
    console.error("GAME API ERROR", err.message);
    return Response.json({ error: true }, { status: 500 });
  }
}

// EXPORT mapping so check route can use it
export function getMapping() {
  return latestMapping;
}
