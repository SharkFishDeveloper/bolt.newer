import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

export function App() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate("/builder", { state: { prompt } });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Zap className="w-14 h-14 text-blue-500 drop-shadow-lg" />
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight">
            AI-Powered Website Builder
          </h1>
          <p className="text-lg text-gray-400 mt-3">
            Just describe your idea, and AI will generate your website.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800/70 backdrop-blur-lg shadow-xl rounded-xl p-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown} // Handle Enter key
              placeholder="Describe the website you want to build..."
              className="w-full h-36 p-4 bg-transparent text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-500"
            />
            <button
              type="submit"
              className="w-full mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 active:scale-95"
            >
              Generate Website Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
