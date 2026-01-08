import Groq from "groq-sdk";
import mammoth from "mammoth";
import pdfParse from "pdf-parse-fixed";
import { NextResponse } from "next/server";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ reply: "⚠️ No file uploaded." });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = file.name.toLowerCase();

    let text = "";

    // 1️⃣ PDF
    if (fileName.endsWith(".pdf")) {
      const data = await pdfParse(buffer);
      text = data.text;
    }
    // 2️⃣ Word (.docx)
    else if (fileName.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }
    // 3️⃣ TXT / MD / JSON / CSV
    else if (
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md") ||
      fileName.endsWith(".json") ||
      fileName.endsWith(".csv")
    ) {
      text = buffer.toString("utf-8");
    }
    // 4️⃣ Everything else (PPTX, XLSX, RTF...) → fallback
    else {
      text = `User uploaded a ${fileName} file. Summarize key concepts:`;

      // Add base64 preview for Groq to reason over
      text += `\n\nFILE-DATA (BASE64):\n${buffer.toString("base64")}`;
    }

    if (!text.trim()) {
      return NextResponse.json({
        reply: "⚠️ The file was uploaded, but no readable text found.",
      });
    }

    // Send extracted text to AI
    const aiResponse = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a teaching tutor. Provide a readable explanation, important points, formulas, and mini examples from the document.",
        },
        { role: "user", content: text.slice(0, 8000) },
      ],
    });

    const reply = aiResponse.choices[0]?.message?.content || "No explanation generated.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);
    return NextResponse.json(
      { reply: "⚠️ Error reading file. Try PDF or DOCX." },
      { status: 500 }
    );
  }
}
