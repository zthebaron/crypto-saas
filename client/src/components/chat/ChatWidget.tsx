import { useState, useRef, useEffect, useMemo } from 'react';
import { MessageSquare, X, Send, Trash2, Bot, User } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import ReactMarkdown from 'react-markdown';

const SLASH_COMMANDS = [
  { command: '/signals', description: 'View latest trading signals' },
  { command: '/portfolio', description: 'View portfolio summary' },
  { command: '/compare', description: 'Compare coins (e.g. /compare BTC ETH)' },
  { command: '/knowledge', description: 'Search knowledge base' },
  { command: '/run', description: 'Run the agent pipeline' },
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showCommands, setShowCommands] = useState(false);
  const { messages, streaming, loading, sendMessage, loadHistory, clearChat } = useChatStore();

  const filteredCommands = useMemo(() => {
    if (!input.startsWith('/')) return [];
    const query = input.toLowerCase();
    return SLASH_COMMANDS.filter(c => c.command.startsWith(query));
  }, [input]);

  useEffect(() => {
    setShowCommands(input.startsWith('/') && filteredCommands.length > 0 && !input.includes(' '));
  }, [input, filteredCommands]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;
    setInput('');
    sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat popup */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-96 h-[32rem] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">BlockView AI</div>
                <div className="text-xs text-gray-400">Crypto Research Assistant</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !loading && (
              <div className="text-center text-gray-500 mt-12">
                <Bot className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                <p className="text-sm font-medium">Welcome to BlockView AI</p>
                <p className="text-xs mt-1">Ask about crypto markets, signals, or agent analysis.</p>
                <div className="mt-4 space-y-2">
                  {['What are the top signals today?', 'Analyze BTC price action', 'Which coins are trending?'].map(q => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="block w-full text-left text-xs px-3 py-2 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-indigo-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none break-words [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0">
                      {msg.content ? <ReactMarkdown>{msg.content}</ReactMarkdown> : (streaming ? <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse rounded-sm" /> : '')}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-md bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700 bg-gray-800 relative">
            {showCommands && (
              <div className="absolute bottom-full left-3 right-3 mb-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
                {filteredCommands.map(cmd => (
                  <button
                    key={cmd.command}
                    onClick={() => { setInput(cmd.command + ' '); setShowCommands(false); inputRef.current?.focus(); }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <span className="text-indigo-400 text-xs font-mono">{cmd.command}</span>
                    <span className="text-gray-500 text-xs">{cmd.description}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about crypto markets..."
                rows={1}
                className="flex-1 bg-gray-900 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500 max-h-24"
                style={{ minHeight: '2.5rem' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || streaming}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 rounded-xl text-white transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? 'bg-gray-700 hover:bg-gray-600 rotate-0'
            : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageSquare className="w-6 h-6 text-white" />
        )}
      </button>
    </>
  );
}
