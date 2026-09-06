import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCheck,
  Archive,
  Search,
  ExternalLink,
  Clock,
  User,
  Inbox,
  X
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useToast } from '../../../context/ToastContext';
import { createAdminApi } from '../../../api/adminApi';
import { ContactMessageDTO } from '../../../types';
import { TableLoadingSkeleton } from '../LoadingSkeleton';
import { EmptyState } from '../EmptyState';

export const ContactMessagesAdminSection: React.FC = () => {
  const { fetchWithAuth } = useAdminAuth();
  const { showSuccess, showError } = useToast();
  const api = createAdminApi(fetchWithAuth);

  const [messages, setMessages] = useState<ContactMessageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedMessage, setSelectedMessage] = useState<ContactMessageDTO | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await api.getContactMessages();
      setMessages(data);
    } catch (err: any) {
      showError('Failed to load contact messages', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkRead = async (msg: ContactMessageDTO) => {
    const previous = [...messages];
    // Optimistic update
    setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, read: true } : m)));
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage(prev => prev ? { ...prev, read: true } : null);
    }

    try {
      await api.markMessageRead(msg.id);
      showSuccess('Message marked as read');
    } catch (err: any) {
      // Rollback on failure
      setMessages(previous);
      showError('Failed to update message status', err.message);
    }
  };

  const handleArchive = async (msg: ContactMessageDTO) => {
    if (msg.archived) return;
    const previous = [...messages];
    const newArchived = true;
    // Optimistic update
    setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, archived: newArchived } : m)));
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage(prev => prev ? { ...prev, archived: newArchived } : null);
    }

    try {
      await api.archiveMessage(msg.id);
      showSuccess('Message archived');
    } catch (err: any) {
      // Rollback on failure
      setMessages(previous);
      showError('Failed to archive message', err.message);
    }
  };

  const filteredMessages = messages.filter(msg => {
    // Tab filter
    if (filter === 'unread' && msg.read) return false;
    if (filter === 'archived' && !msg.archived) return false;
    if (filter === 'all' && msg.archived) return false; // In 'all' show non-archived by default

    // Search query
    const q = searchQuery.toLowerCase();
    return (
      msg.name.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      msg.subject.toLowerCase().includes(q) ||
      msg.message.toLowerCase().includes(q)
    );
  });

  const unreadCount = messages.filter(m => !m.read && !m.archived).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white">
              Client Inquiries &amp; Messages
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-sans font-bold bg-blue-500 text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-light">
            Inquiries submitted through your portfolio contact form. Respond directly or manage status.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Inbox ({messages.filter(m => !m.archived).length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-colors cursor-pointer ${
              filter === 'unread'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-colors cursor-pointer ${
              filter === 'archived'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Archived ({messages.filter(m => m.archived).length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-zinc-800 px-4 py-2.5 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by sender name, email, subject or keyword..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs font-sans text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-600"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content Layout: 2 Columns on desktop */}
      {loading ? (
        <TableLoadingSkeleton rows={5} cols={3} />
      ) : filteredMessages.length === 0 ? (
        <EmptyState
          title="No Messages Found"
          description="There are no contact messages matching your active filters."
          icon={<Inbox className="w-7 h-7" />}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Message List */}
          <div className="lg:col-span-5 space-y-3">
            {filteredMessages.map(msg => (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMessage(msg);
                  if (!msg.read) {
                    handleMarkRead(msg);
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedMessage?.id === msg.id
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                    : msg.read
                    ? 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121212] hover:border-slate-300 dark:hover:border-zinc-700'
                    : 'border-blue-300 dark:border-blue-900/60 bg-white dark:bg-[#151515] shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {!msg.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold font-sans text-slate-900 dark:text-white truncate">
                      {msg.name}
                    </h4>
                  </div>
                  <span className="text-[10px] font-sans text-slate-400 dark:text-zinc-500 shrink-0">
                    {msg.receivedAt || 'Recent'}
                  </span>
                </div>

                <div className="text-xs font-bold font-['Syne',sans-serif] text-slate-800 dark:text-zinc-200 truncate mb-1">
                  {msg.subject}
                </div>

                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>

          {/* Message Detail View */}
          <div className="lg:col-span-7">
            {selectedMessage ? (
              <div className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs flex flex-col justify-between min-h-[400px]">
                <div>
                  <div className="flex items-start justify-between gap-4 pb-4 mb-6 border-b border-slate-100 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] font-sans uppercase text-slate-400 dark:text-zinc-500">
                        Received: {selectedMessage.receivedAt || 'Recently'}
                      </span>
                      <h3 className="text-lg font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white mt-1">
                        {selectedMessage.subject}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-sans text-slate-600 dark:text-zinc-400 mt-1">
                        <User className="w-3.5 h-3.5" />
                        <span className="font-bold text-slate-900 dark:text-white">{selectedMessage.name}</span>
                        <span>&lt;{selectedMessage.email}&gt;</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleMarkRead(selectedMessage)}
                        className={`p-2 rounded-xl border text-xs font-sans transition-colors cursor-pointer ${
                          selectedMessage.read
                            ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border-slate-200 dark:border-zinc-700'
                            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                        }`}
                        title={selectedMessage.read ? 'Marked as read' : 'Mark as read'}
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleArchive(selectedMessage)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors cursor-pointer"
                        title={selectedMessage.archived ? 'Message archived' : 'Archive message'}
                      >
                        <Archive className="w-4 h-4" />
                      </button>

                    </div>
                  </div>

                  <div className="text-xs text-slate-800 dark:text-zinc-200 font-light leading-relaxed whitespace-pre-wrap bg-slate-50/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-100 dark:border-zinc-800/80">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="text-[11px] font-sans text-slate-400">
                    Sender: {selectedMessage.email}
                  </div>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-slate-900 text-xs font-sans font-bold transition-all shadow-xs"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <Mail className="w-10 h-10 text-slate-300 dark:text-zinc-700 mb-3" />
                <h4 className="text-sm font-bold font-['Syne',sans-serif] text-slate-800 dark:text-zinc-200">
                  Select a message
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Choose an inquiry from the list on the left to view full message content and reply.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
