import React, { useState, useEffect, useRef } from 'react';
import api from '../../lib/api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { io } from 'socket.io-client';
import {
  MessageSquare,
  Send,
  Users,
  Wifi,
  WifiOff
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function ChatMessenger() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('drivair_token');
    if (!token) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    const s = io(socketUrl, {
      auth: { token },
    });

    s.on('connect', () => {
      setConnected(true);
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const loadConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      const convList = res.data.data.conversations || [];
      setConversations(convList);
      if (convList.length > 0 && !activeConv) {
        selectConversation(convList[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const selectConversation = async (conv) => {
    setActiveConv(conv);
    try {
      const res = await api.get(`/chat/conversations/${conv._id}/messages`);
      setMessages(res.data.data.messages || []);
      if (socket) {
        socket.emit('join_conversation', conv._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const messageText = inputText.trim();
    setInputText('');

    if (socket && connected) {
      socket.emit('send_message', {
        conversationId: activeConv._id,
        content: messageText,
      });
    } else {
      try {
        const res = await api.post(`/chat/conversations/${activeConv._id}/messages`, {
          content: messageText,
        });
        setMessages((prev) => [...prev, res.data.data.message]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv?.participants) return 'Member';
    const other = conv.participants.find((p) => p._id !== user?._id);
    return other?.fullName || other?.email || 'Partner';
  };

  return (
    <Card variant="surface" className="p-0 overflow-hidden flex flex-col md:flex-row h-[600px] border border-[var(--color-border-subtle)]">
      {/* Left Column: Conversations List */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[var(--color-border-subtle)] flex flex-col bg-[var(--color-canvas)]">
        <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-surface)]">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-[var(--color-primary)]" />
            <h3 className="font-bold text-sm text-white">Conversations</h3>
          </div>
          <div className="flex items-center gap-1.5">
            {connected ? (
              <Badge variant="active" className="text-[10px]">
                <Wifi size={10} className="inline mr-1" /> Live
              </Badge>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-text-muted)] bg-white/5 px-2 py-0.5 rounded-full">
                <WifiOff size={10} /> REST
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border-subtle)]">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-[var(--color-text-muted)] space-y-2">
              <Users size={24} className="mx-auto text-[var(--color-text-muted)]" />
              <p className="text-xs">No active conversations found.</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Direct chats trigger when submitting bids or direct hire proposals.
              </p>
            </div>
          ) : (
            conversations.map((c) => {
              const isSelected = activeConv?._id === c._id;
              const name = getOtherParticipant(c);
              return (
                <div
                  key={c._id}
                  onClick={() => selectConversation(c)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition ${
                    isSelected
                      ? 'bg-[var(--color-elevated)] border-l-4 border-[var(--color-primary)]'
                      : 'hover:bg-[var(--color-control)] bg-[var(--color-canvas)]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-[var(--color-canvas)] flex items-center justify-center font-bold text-xs shrink-0">
                    {name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">{name}</p>
                      <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">
                        {c.contextType}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] truncate mt-0.5">
                      {c.lastMessage?.content || 'Click to view messages'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Chat Box */}
      <div className="flex-1 flex flex-col bg-[var(--color-surface)]">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-surface)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-[var(--color-canvas)] flex items-center justify-center font-bold text-xs">
                  {getOtherParticipant(activeConv)[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    {getOtherParticipant(activeConv)}
                  </h4>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    Negotiation Channel · Context: <span className="font-semibold text-[var(--color-primary)]">{activeConv.contextType}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[var(--color-canvas)]">
              {messages.length === 0 ? (
                <div className="py-12 text-center text-[var(--color-text-muted)] text-xs">
                  Say hello! Start negotiating contract terms or requirements.
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMine = m.senderId?._id === user?._id || m.senderId === user?._id;
                  return (
                    <div
                      key={m._id || idx}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                          isMine
                            ? 'bg-[var(--color-primary)] text-[var(--color-canvas)] font-medium rounded-br-none'
                            : 'bg-[var(--color-control)] text-white border border-[var(--color-border-subtle)] rounded-bl-none'
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[9px] text-[var(--color-text-muted)] mt-1 px-1">
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message or negotiate terms..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-full text-xs sm:text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
              />
              <Button
                type="submit"
                disabled={!inputText.trim()}
                variant="primary"
                className="p-2.5 rounded-full"
              >
                <Send size={16} />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-muted)] p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 text-[var(--color-primary)] flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <h4 className="font-bold text-sm text-white">No Chat Selected</h4>
            <p className="text-xs text-[var(--color-text-muted)] max-w-xs">
              Select an active conversation on the left or reach out directly to providers.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
