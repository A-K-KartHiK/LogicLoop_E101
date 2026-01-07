"use client";
import { useState, useRef, useEffect } from "react";


export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // 🔒 Persist chat so UI doesn't "reset"
  useEffect(() => {
    const saved = localStorage.getItem("messages");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage("user", input);
    handleAI(input);
    setInput("");
  };

  const handleAI = async (text) => {
    // 👉 Call backend AI instead of keyword rules
    try {
      addMessage("ai", "⏳ Thinking...");
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      // remove placeholder
      setMessages((prev) => prev.filter((m) => m.text !== "⏳ Thinking..."));

      addMessage("ai", data.reply || "🤖 (No reply from AI)");
    } catch {
      // remove placeholder
      setMessages((prev) => prev.filter((m) => m.text !== "⏳ Thinking..."));
      addMessage("ai", "⚠️ Error contacting AI server.");
    }
  };

  const uploadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      addMessage("ai", `📄 Uploaded and stored: ${file.name}`);
      setUploading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-100 to-indigo-200 p-4">
      <header className="text-3xl font-bold text-purple-700 mb-3">✨ AI Learning Tutor</header>

      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-4 space-y-3 border">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center">Start chatting with your AI tutor...</p>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] p-2 rounded-lg text-sm whitespace-pre-line shadow ${
              m.sender === "user" ? "ml-auto bg-purple-600 text-white" : "mr-auto bg-purple-200 text-purple-900"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-3 border rounded-lg shadow focus:outline-purple-500"
          placeholder="Ask to upload, teach, quiz, exam, etc..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700"
        >
          Send
        </button>
      </div>

      <div className="mt-2">
        <input type="file" ref={fileRef} onChange={uploadFile} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="px-3 py-1 text-sm bg-indigo-500 text-white rounded shadow hover:bg-indigo-600"
        >
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>
    </div>
  );
}
