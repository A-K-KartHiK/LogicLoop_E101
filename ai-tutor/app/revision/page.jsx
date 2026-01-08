"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Revision() {
  const [topic, setTopic] = useState("");
  const [revision, setRevision] = useState("");
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("revision_history");
      if (saved) setHistory(JSON.parse(saved));
    }
  }, []);

  const addHistory = (entry) => {
    const updated = [...history, entry];
    setHistory(updated);
    localStorage.setItem("revision_history", JSON.stringify(updated));
  };

  const fetchRevision = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setRevision("");

    try {
      const res = await fetch("/api/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      setRevision(data.summary);

      addHistory({
        topic,
        date: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error(err);
      setRevision("⚠️ Error fetching revision");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg p-4 border-r overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Revision Menu</h2>

        <a
          href="/"
          className="block bg-purple-600 text-white px-3 py-2 rounded shadow mb-4 hover:bg-purple-700 text-center"
        >
          🔙 Back to Tutor
        </a>

        <h3 className="font-bold text-gray-700 mb-2">📘 Past Revisions</h3>
        <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
          {history.map((h, i) => (
            <div key={i} className="p-2 bg-gray-200 rounded shadow">
              <div>📚 {h.topic}</div>
              <div>📅 {h.date}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col p-4">
        <h1 className="text-3xl font-bold text-purple-700 mb-4">
          ⏱ 1-Hour Quick Revision
        </h1>

        <div className="space-y-4">
          <input
            placeholder="Enter topic to revise"
            className="border p-3 rounded w-full text-black"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <button
            onClick={fetchRevision}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Start Revision ▶️
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-4 space-y-3 border mt-4">
          {loading && (
            <p className="text-purple-600 font-bold text-lg">
              ⏳ Compiling revision notes…
            </p>
          )}

          {revision && (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {revision}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
