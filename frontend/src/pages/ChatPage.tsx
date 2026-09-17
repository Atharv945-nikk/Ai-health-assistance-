import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { translations } from '../i18n/translations.js';
import { chatApi, getToken } from '../api/client.js';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Edit2,
  Copy,
  RotateCcw,
  Check,
  AlertTriangle,
  BookOpen,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Conversation, ChatMessage, Citation } from '../types/index.js';

export const ChatPage: React.FC = () => {
  const { language } = useAuth();
  const t = translations[language];
  const location = useLocation();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingChunk, setStreamingChunk] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingChunk]);

  // Load conversations on mount
  useEffect(() => {
    async function loadConversations() {
      try {
        const list = await chatApi.getConversations();
        setConversations(list);

        const params = new URLSearchParams(location.search);
        const queryId = params.get('id');

        if (queryId && list.some(c => c.id === queryId)) {
          setActiveConvId(queryId);
        } else if (list.length > 0) {
          setActiveConvId(list[0].id);
        } else {
          // Create initial consultation
          const initial = await chatApi.createConversation(t.chat.newChat);
          setConversations([initial]);
          setActiveConvId(initial.id);
        }
      } catch (err: any) {
        console.error('Failed to load conversations:', err);
      }
    }
    loadConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;
    async function loadMessages() {
      try {
        const fullConv = await chatApi.getConversation(activeConvId!);
        setMessages(fullConv.messages || []);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load messages:', err);
      }
    }
    loadMessages();
  }, [activeConvId]);

  // Handle location state initialPrompt if navigated from Dashboard
  useEffect(() => {
    const initialPrompt = (location.state as any)?.initialPrompt;
    if (initialPrompt && activeConvId && !isStreaming) {
      handleSendMessage(initialPrompt);
      // Clear history state to avoid resending on refresh
      window.history.replaceState({}, document.title);
    }
  }, [activeConvId]);

  const handleCreateNewChat = async () => {
    try {
      const newConv = await chatApi.createConversation(t.chat.newChat);
      setConversations([newConv, ...conversations]);
      setActiveConvId(newConv.id);
      setMessages([]);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this consultation?')) return;
    try {
      await chatApi.deleteConversation(id);
      const remaining = conversations.filter(c => c.id !== id);
      setConversations(remaining);
      if (activeConvId === id) {
        setActiveConvId(remaining.length > 0 ? remaining[0].id : null);
        setMessages([]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputContent).trim();
    if (!text || !activeConvId || isStreaming) return;

    setInputContent('');
    setError(null);
    setIsStreaming(true);
    setStreamingChunk('');

    // Optimistically add user message to UI
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeConvId,
      sender: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // Connect to SSE streaming endpoint
      const token = getToken();
      const response = await fetch(`/api/v1/chat/conversations/${activeConvId}/messages?stream=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ content: text }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value);
          const lines = chunkText.split('\n');

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('event: chunk')) {
              const nextLine = lines[i + 1]?.trim();
              if (nextLine && nextLine.startsWith('data: ')) {
                try {
                  const parsed = JSON.parse(nextLine.slice(6));
                  streamBuffer += parsed.chunk;
                  setStreamingChunk(streamBuffer);
                } catch {
                  // ignore
                }
              }
            } else if (line.startsWith('event: done')) {
              const nextLine = lines[i + 1]?.trim();
              if (nextLine && nextLine.startsWith('data: ')) {
                try {
                  const parsed = JSON.parse(nextLine.slice(6));
                  // Replace temp message with server confirmed messages
                  setMessages(prev => {
                    const withoutTemp = prev.filter(m => m.id !== tempUserMsg.id);
                    return [...withoutTemp, parsed.userMessage, parsed.assistantMessage];
                  });
                  setStreamingChunk('');
                } catch {
                  // ignore
                }
              }
            } else if (line.startsWith('event: error')) {
              const nextLine = lines[i + 1]?.trim();
              if (nextLine && nextLine.startsWith('data: ')) {
                const parsed = JSON.parse(nextLine.slice(6));
                setError(parsed.message || 'Stream processing error');
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('Streaming failed, falling back to standard JSON API:', err);
      // Fallback to standard non-streaming API
      try {
        const result = await chatApi.sendMessage(activeConvId, text);
        setMessages(prev => {
          const withoutTemp = prev.filter(m => m.id !== tempUserMsg.id);
          return [...withoutTemp, result.userMessage, result.assistantMessage];
        });
      } catch (fallbackErr: any) {
        setError(fallbackErr.message || 'Failed to send message');
      }
    } finally {
      setIsStreaming(false);
      setStreamingChunk('');
      // Refresh conversation list to update titles if auto-renamed
      chatApi.getConversations().then(setConversations).catch(() => {});
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const samplePrompts = [
    'What are the key clinical indicators of Type 2 Diabetes?',
    'Explain the difference between tension headache and migraine.',
    'I received my lipid panel results. What does high LDL indicate?',
    'What precautions should I take when taking Amoxicillin?',
  ];

  return (
    <div className="h-[calc(100vh-5rem)] flex bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Session History Sidebar */}
      <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 hidden md:flex">
        <div className="p-4 border-b border-slate-200">
          <button
            onClick={handleCreateNewChat}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.chat.newChat}</span>
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all group ${
                activeConvId === conv.id
                  ? 'bg-white text-teal-800 font-semibold shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-teal-600" />
                <span className="truncate">{conv.title}</span>
              </div>
              <button
                onClick={(e) => handleDeleteChat(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>AI Clinical Assistant</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              Evidence-grounded medical support • Non-diagnostic educational tool
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNewChat}
              className="md:hidden p-2 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold"
            >
              + New
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {messages.length === 0 && !isStreaming ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-12">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">How can I assist you today?</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Describe your symptoms, ask questions about medical conditions, or paste laboratory values. Answers are cross-referenced against verified clinical sources.
              </p>

              <div className="w-full space-y-2 text-left">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                  Suggested Medical Questions
                </span>
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-teal-50 hover:text-teal-900 border border-slate-200/80 text-xs text-slate-700 transition-colors flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-teal-600 text-white rounded-br-none'
                          : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      {/* Markdown rendered lines */}
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Citations Card if attached */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-2">
                          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wide">
                            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                            <span>{t.chat.evidenceTitle}</span>
                          </span>
                          <div className="grid grid-cols-1 gap-1.5">
                            {msg.citations.map((c, i) => (
                              <div
                                key={i}
                                className="p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700"
                              >
                                <div className="flex items-center justify-between font-semibold text-slate-900">
                                  <span>{c.title}</span>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-50 text-teal-700 border border-teal-200">
                                    Grade {c.evidenceLevel}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  {c.organization} {c.publicationDate ? `• ${c.publicationDate}` : ''}
                                </span>
                                {c.sourceUrl && (
                                  <a
                                    href={c.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-teal-600 hover:underline inline-flex items-center gap-1 mt-1 font-medium"
                                  >
                                    <span>Read Official Source</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Actions row */}
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 px-1">
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-slate-600 transition-colors flex items-center gap-0.5 ml-1"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Streaming Output Indicator */}
              {isStreaming && (
                <div className="flex flex-col items-start">
                  <div className="max-w-2xl rounded-2xl p-4 text-sm leading-relaxed bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-none shadow-sm">
                    <div className="whitespace-pre-wrap">{streamingChunk}</div>
                    <div className="flex items-center gap-1.5 mt-2 text-teal-600 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                      <span>Assistant is composing clinical response...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              disabled={isStreaming}
              placeholder={t.chat.placeholder}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
            <button
              type="submit"
              disabled={!inputContent.trim() || isStreaming}
              className="p-3 rounded-2xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 shadow-sm transition-all shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <span className="block text-center text-[10px] text-slate-400 mt-2">
            AI responses are educational and not a medical diagnosis. In life-threatening situations, dial 911 / 112 immediately.
          </span>
        </div>
      </div>
    </div>
  );
};
