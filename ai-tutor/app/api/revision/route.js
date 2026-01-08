import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { topic } = await req.json();

    const prompt = `
Give a clear 1-hour revision summary for topic: "${topic}".

FORMAT STRICTLY:
### 📌 Key Concepts
- Bullet points only

### 🧮 Formulas (if any)
| Name | Formula |
|------|---------|
| Example | a² + b² |

### 🔗 Flowchart
Wrap flowchart ONLY in triple backticks like:
\`\`\`
Start
 ↓
Step 1
 ↓
Step 2
 ↓
End
\`\`\`

### 📝 Tips
- 3–5 revision tips
`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are an expert revision tutor." },
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
    });

    return Response.json({ summary: response.choices[0].message.content });
  } catch (e) {
    console.error(e);
    return Response.json({ summary: "Error generating revision" }, { status: 500 });
  }
}
