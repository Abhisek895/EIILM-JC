import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { chatbotApi, siteSettingsApi } from '@api/endpoints';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi there. I can help you explore courses, admissions, fees, and placements.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [botName, setBotName] = useState('Admissions Assistant');
  const [botSubtitle, setBotSubtitle] = useState('Here to help');
  const [botEnabled, setBotEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    siteSettingsApi
      .getMap()
      .then((res: any) => {
        const data = res?.data;
        if (!data) return;

        if (data.chatbot_enabled === 'false') {
          setBotEnabled(false);
        }

        if (data.chatbot_name) {
          setBotName(data.chatbot_name);
          setMessages([
            {
              role: 'assistant',
              content: `Hi there. Welcome to ${data.chatbot_name}. I can help you with admissions, courses, and student support.`,
            },
          ]);
        }

        if (data.chatbot_subtitle) {
          setBotSubtitle(data.chatbot_subtitle);
        }
      })
      .catch(() => {
        // Keep defaults.
      });

    const existingSession = localStorage.getItem('chat_session_id');
    if (existingSession) {
      setSessionId(existingSession);
      return;
    }

    const newSession = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    localStorage.setItem('chat_session_id', newSession);
    setSessionId(newSession);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent, presetMessage?: string) => {
    if (e) e.preventDefault();

    const text = presetMessage || input;
    if (!text.trim()) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res: any = await chatbotApi.chat(sessionId, text);
      const reply = res?.answer || 'I am having trouble reaching my knowledge base right now.';
      setMessages([...nextMessages, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([
        ...nextMessages,
        { role: 'assistant', content: 'An error occurred while connecting to the server. Please try again later.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    'How do I apply?',
    'Which course should I choose?',
    'What scholarships are available?',
    'Tell me about placements',
  ];

  if (!botEnabled) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-2xl transition-transform hover:scale-110"
        aria-label="Open chatbot"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] max-h-[80vh] w-80 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl sm:w-96">
          <div className="flex items-center justify-between bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold">{botName}</h3>
                <p className="flex items-center gap-1 text-xs text-primary-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {botSubtitle}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 transition-colors hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/50 p-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      msg.role === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-indigo-100 text-indigo-600'
                    }`}
                  >
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div
                    className={`rounded-2xl p-3 text-sm ${
                      msg.role === 'user'
                        ? 'rounded-tr-none bg-primary-600 text-white'
                        : 'rounded-tl-none border border-gray-100 bg-white text-gray-700 shadow-sm'
                    } whitespace-pre-wrap`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Bot size={16} />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-gray-100 bg-white p-3 text-sm text-gray-700 shadow-sm">
                    <Loader2 size={16} className="animate-spin text-primary-500" />
                    Typing...
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {!isLoading && messages[messages.length - 1]?.role === 'assistant' && (
            <div className="flex flex-wrap gap-2 bg-gray-50/50 px-4 pb-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSend(undefined, question)}
                  className="rounded-full border border-primary-200 bg-white px-3 py-1.5 text-xs text-primary-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-gray-100 bg-white p-4">
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="w-full rounded-full border-transparent bg-gray-100 px-4 py-2.5 pr-12 text-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <Send size={14} className="-ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
