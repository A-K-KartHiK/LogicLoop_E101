"use client";

import { useState, useEffect } from "react";

export default function QuizTutor() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [stage, setStage] = useState("start"); // start | asking | done

  const [quiz, setQuiz] = useState([]); // each Q stored here
  const [index, setIndex] = useState(0);

  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("quiz_history") || "[]")
  );

  const [loading, setLoading] = useState(false);

  // Track streak for difficulty
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);

  const [score, setScore] = useState(0);
  const [messages, setMessages] = useState([]);

  const addMessage = (type, text) => {
    setMessages((prev) => [...prev, { type, text }]);
  };

  const startQuiz = () => {
    if (!topic.trim()) return;
    setMessages([]);
    setQuiz([]);
    setIndex(0);
    setScore(0);
    setCorrectStreak(0);
    setWrongStreak(0);
    setStage("asking");
    fetchQuestion();
  };

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          correctCount: correctStreak,
          wrongCount: wrongStreak,
        }),
      });

      const data = await res.json();
      if (!data.quiz) throw new Error("No quiz generated");

      const parsed = JSON.parse(data.quiz);
      const updated = [...quiz, parsed];
      setQuiz(updated);

      addMessage(
        "ai",
        `🧠 **(${parsed.difficulty})** ${parsed.question}\n\n${parsed.options.join(
          "\n"
        )}`
      );
    } catch (err) {
      addMessage("ai", "⚠️ Error generating question. Try again.");
    }
    setLoading(false);
  };

  const submitAnswer = (option) => {
    const current = quiz[index];
    const correct = option[0] === current.answer;

    if (correct) {
      setScore(score + 1);
      addMessage(
        "ai",
        `✔️ Correct! 🎉\n\n${current.explain}`
      );
      setCorrectStreak(correctStreak + 1);
      setWrongStreak(0);
    } else {
      addMessage(
        "ai",
        `❌ Wrong.\nCorrect answer: **${current.answer}**\n\n${current.explain}`
      );
      setWrongStreak(wrongStreak + 1);
      setCorrectStreak(0);
    }

    const nextIndex = index + 1;
    setIndex(nextIndex);

    if (nextIndex >= numQuestions) {
      finishQuiz(score + (correct ? 1 : 0));
    } else {
      fetchQuestion();
    }
  };

  const finishQuiz = (finalScore) => {
    const result = {
      topic,
      score: finalScore,
      total: numQuestions,
      date: new Date().toLocaleString(),
    };

    const updated = [...history, result];
    setHistory(updated);
    localStorage.setItem("quiz_history", JSON.stringify(updated));

    addMessage(
      "ai",
      `🏁 Quiz Finished!\nTopic: **${topic}**\nScore: **${finalScore}/${numQuestions}**`
    );

    setStage("done");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      <aside className="w-64 bg-white shadow-lg p-4 border-r overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Quiz Menu</h2>
        <button
          onClick={() => setStage("start")}
          className="w-full bg-purple-600 text-white px-3 py-2 rounded shadow mb-4 hover:bg-purple-700"
        >
          🧠 Start New Quiz
        </button>

        <h3 className="font-bold text-gray-700 mb-2">📜 Past Scores</h3>
        <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
          {history.map((h, i) => (
            <div key={i} className="p-2 bg-gray-200 rounded shadow">
              <div>📚 {h.topic}</div>
              <div>🏆 {h.score}/{h.total}</div>
              <div>📅 {h.date}</div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col p-4">
        <h1 className="text-3xl font-bold text-purple-700 mb-4">Quiz Tutor</h1>

        {stage === "start" && (
          <div className="space-y-4">
            <input
              placeholder="Enter quiz topic"
              className="border p-3 rounded w-full text-black"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <input
              type="number"
              className="border p-3 rounded w-full text-black"
              value={numQuestions}
              min={1}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
            />
            <button
              onClick={startQuiz}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Start Quiz ▶️
            </button>
          </div>
        )}

        {/* CHAT FEED */}
        <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-4 space-y-3 border mt-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`max-w-[80%] p-2 rounded-lg text-sm whitespace-pre-line shadow ${
                m.type === "user"
                  ? "ml-auto bg-gray-200 text-black"
                  : "mr-auto bg-purple-100 text-black"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        {stage === "asking" && quiz[index] && !loading && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {quiz[index].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => submitAnswer(opt)}
                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
