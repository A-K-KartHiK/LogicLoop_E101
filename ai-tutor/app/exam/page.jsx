"use client";

import { useState, useEffect } from "react";

export default function ExamGenerator() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAns, setShowAns] = useState(false);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("exam_history");
      if (saved) setHistory(JSON.parse(saved));
    }
  }, []);

  const addHistory = (paper) => {
    const entry = {
      topic,
      date: new Date().toLocaleString(),
      count: numQuestions,
    };
    const updated = [...history, entry];
    setHistory(updated);
    localStorage.setItem("exam_history", JSON.stringify(updated));
  };

  const generateExam = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setShowAns(false);
    setExam(null);

    try {
      const res = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, numQuestions }),
      });

      const data = await res.json();
      if (!data.exam) throw new Error("invalid");

      const parsed = JSON.parse(data.exam);
      setExam(parsed);
      addHistory(parsed);
    } catch (err) {
      alert("⚠️ Error generating exam");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg p-4 border-r overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Exam Menu</h2>
        <a
          href="/"
          className="block bg-purple-600 text-white px-3 py-2 rounded shadow mb-4 hover:bg-purple-700 text-center"
        >
          🔙 Back
        </a>

        <h3 className="font-bold text-gray-700 mb-2">📜 Past Exams</h3>
        <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
          {history.map((h, i) => (
            <div key={i} className="p-2 bg-gray-200 rounded shadow">
              <div>📚 {h.topic}</div>
              <div>📝 {h.count} Q/Type</div>
              <div>📅 {h.date}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col p-4">
        <h1 className="text-3xl font-bold text-purple-700 mb-4">
          📝 Exam Paper Generator
        </h1>

        <div className="space-y-3">
          <input
            placeholder="Enter topic"
            className="border p-3 rounded w-full text-black"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <input
            type="number"
            min={1}
            className="border p-3 rounded w-full text-black"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
          />

          <button
            onClick={generateExam}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Generate Exam ▶️
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-4 space-y-3 border mt-4">
          {loading && <p className="text-purple-700 font-bold">⏳ Preparing paper...</p>}

          {exam && (
            <>
              {/* MCQ */}
              <h2 className="text-xl font-bold mt-4">🔹 Multiple Choice</h2>
              {exam.mcq.map((q, i) => (
                <div key={i} className="mb-3">
                  <p>{i + 1}. {q.q}</p>
                  {q.options.map((op, j) => (
                    <p key={j} className="pl-4">• {op}</p>
                  ))}
                  {showAns && <p className="text-green-700 pl-4">✔ Answer: {q.answer}</p>}
                </div>
              ))}

              {/* SHORT ANSWER */}
              <h2 className="text-xl font-bold mt-4">✍ Short Answers</h2>
              {exam.short.map((q, i) => (
                <div key={i} className="mb-3">
                  <p>{i + 1}. {q.q}</p>
                  {showAns && <p className="text-green-700 pl-4">✔ {q.answer}</p>}
                </div>
              ))}

              {/* LONG ANSWER */}
              <h2 className="text-xl font-bold mt-4">🧠 Long Answers</h2>
              {exam.long.map((q, i) => (
                <div key={i} className="mb-3">
                  <p>{i + 1}. {q.q}</p>
                  {showAns && <p className="text-green-700 pl-4 whitespace-pre-line">{q.answer}</p>}
                </div>
              ))}

              {/* TOGGLE ANSWERS */}
              <button
                onClick={() => setShowAns(!showAns)}
                className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                {showAns ? "Hide Answers" : "Show Answers"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
