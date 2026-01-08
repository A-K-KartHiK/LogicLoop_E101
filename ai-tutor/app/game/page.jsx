"use client";

import { useState, useEffect } from "react";

export default function ConceptGame() {
  const [topic, setTopic] = useState("");
  const [stage, setStage] = useState("start");

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  const [placements, setPlacements] = useState({});
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  // Enable restore history if needed later
  const [history, setHistory] = useState([]);

  const startGame = async () => {
    if (!topic.trim()) return;
    setStage("loading");
    setLoading(true);
    setFeedback("");
    setPlacements({});

    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      if (!data.categories || !data.items) throw new Error("Invalid puzzle");

      setCategories(data.categories);
      setItems(data.items);
      setStage("play");
    } catch (err) {
      alert("⚠ Error starting puzzle");
    }
    setLoading(false);
  };

  const allowDrop = (e) => e.preventDefault();

  const dragStart = (e, word) => {
    e.dataTransfer.setData("text/plain", word);
  };

  const dropWord = (e, category) => {
    e.preventDefault();
    const word = e.dataTransfer.getData("text/plain");
    setPlacements((prev) => ({ ...prev, [word]: category }));
  };

  const checkAnswer = async () => {
    const res = await fetch("/api/game/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placements }),
    });

    const data = await res.json();
    setFeedback(data.feedback);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      {/* LEFT SIDE */}
      <aside className="w-64 bg-white shadow-lg p-4 border-r overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Game Menu</h2>

        <button
          onClick={() => setStage("start")}
          className="w-full bg-purple-600 text-white px-3 py-2 rounded shadow mb-4 hover:bg-purple-700"
        >
          🎮 New Game
        </button>

        <h3 className="font-bold text-gray-700 mb-2">🕹 Past Results</h3>
        <p className="text-gray-500 text-sm">(Coming soon)</p>
      </aside>

      {/* RIGHT SIDE */}
      <main className="flex-1 flex flex-col p-4 space-y-4">
        <h1 className="text-3xl font-bold text-purple-700 mb-2">
          🧩 Concept Puzzle Game
        </h1>

        {stage === "start" && (
          <div className="space-y-4">
            <input
              placeholder="Enter topic (ex: Solar system, Digital logic...)"
              className="border p-3 rounded w-full text-black"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />

            <button
              onClick={startGame}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Start Puzzle ▶️
            </button>
          </div>
        )}

        {stage === "loading" && (
          <p className="text-purple-600 text-lg">⏳ Preparing puzzle...</p>
        )}

        {stage === "play" && (
          <>
            {/* ITEMS TO DRAG */}
            <section className="bg-purple-200 rounded shadow p-3">
              <h2 className="font-bold text-lg mb-2">📦 Drag These Words</h2>
              <div className="flex flex-wrap gap-2">
                {items.map((word, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={(e) => dragStart(e, word)}
                    className="px-3 py-1 bg-indigo-500 text-white rounded shadow cursor-move hover:bg-indigo-600"
                  >
                    {word}
                  </div>
                ))}
              </div>
            </section>

            {/* DROP ZONES */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((cat, i) => (
                <div
                  key={i}
                  onDragOver={allowDrop}
                  onDrop={(e) => dropWord(e, cat)}
                  className="min-h-[150px] border-2 border-purple-400 bg-white rounded-lg p-3 shadow"
                >
                  <h3 className="font-bold text-purple-700 text-center mb-2">
                    {cat}
                  </h3>

                  {/* Show assigned words */}
                  {Object.entries(placements)
                    .filter(([word, c]) => c === cat)
                    .map(([word], idx) => (
                      <div
                        key={idx}
                        className="px-2 py-1 bg-gray-200 rounded shadow text-sm text-black"
                      >
                        {word}
                      </div>
                    ))}
                </div>
              ))}
            </section>

            <button
              onClick={checkAnswer}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              ✔ Check Answers
            </button>

            {feedback && (
              <p className="text-lg font-bold text-center mt-2">
                {feedback}
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
