
import React, { useState, useRef, useEffect } from 'react';
import { getBotResponse } from '../services/geminiService';
import Spinner from './common/Spinner';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hi there! I'm Reze, your creative assistant. How can I help you today? You can ask me for prompt ideas or how to use the generator's features."
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await getBotResponse(input);
      const modelMessage: Message = { role: 'model', content: response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (err) {
      setError(err instanceof Error ? `SYSTEM ERROR: ${err.message}` : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto animate-fadeIn">
      <div className="flex-grow overflow-y-auto p-4 bg-slate-900/40 rounded-t-lg ring-1 ring-white/10 space-y-4">
        {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg px-4 py-2 rounded-2xl animate-messagePopIn ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-slate-700 text-gray-200 rounded-bl-none'}`}>
                  <p className="whitespace-pre-wrap text-md" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }}></p>
              </div>
            </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-lg px-4 py-2 rounded-2xl bg-slate-700">
                    <Spinner text="Thinking..."/>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && <p className="text-red-400 text-center mt-2 text-md bg-red-900/30 p-3 rounded-lg border border-red-500/50">{error}</p>}
      <form onSubmit={handleSubmit} className="p-4 flex gap-4 bg-slate-900/60 rounded-b-lg ring-1 ring-white/10">
        <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for creative ideas..."
            className="flex-1 p-3 bg-slate-800/70 border border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none text-gray-200 placeholder-gray-500 transition-all duration-300"
            disabled={isLoading}
            autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold p-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/30 flex items-center justify-center"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
        </button>
      </form>
    </div>
  );
};

export default Chat;
