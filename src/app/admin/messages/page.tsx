'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  timestamp: string;
  role: string;
  content: string;
  status: 'read' | 'unread';
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/messages');
      const data: Message[] = await res.json();
      setMessages(data);
    } catch {
      console.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => fetchMessages(), 0);
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('CONFIRM_SIGNAL_DELETION?')) return;
    try {
      const res = await fetch(`/api/messages?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchMessages();
    } catch {
      console.error('Delete failed');
    }
  };

  const toggleReadStatus = async (id: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'read' ? 'unread' : 'read';
    try {
      const res = await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) fetchMessages();
    } catch {
      console.error('Update failed');
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         m.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">SIGNAL_LOGS</div>
          <div className="page-subtitle">INCOMING DATA TRANSMISSIONS · ENCRYPTED</div>
        </div>
        <div className="page-actions">
          <div className="status-item">
            <span style={{ color: 'var(--green2)' }}>{messages.filter(m => m.status === 'unread').length}</span> UNREAD
          </div>
          <button onClick={fetchMessages} className="btn"><span>⟳ REFRESH</span></button>
        </div>
      </div>

      <div className="proj-toolbar">
        <input 
          className="search-input" 
          placeholder="> SEARCH_LOGS..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filter-group">
          <button 
            className={`filter-btn ${filter === 'all' ? 'on' : ''}`}
            onClick={() => setFilter('all')}
          >
            ALL
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'on' : ''}`}
            onClick={() => setFilter('unread')}
          >
            UNREAD
          </button>
          <button 
            className={`filter-btn ${filter === 'read' ? 'on' : ''}`}
            onClick={() => setFilter('read')}
          >
            READ
          </button>
        </div>
      </div>

      <div className="proj-table-wrap">
        <table className="proj-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>TIMESTAMP</th>
              <th style={{ width: '180px' }}>ROLE</th>
              <th>SIGNAL_CONTENT</th>
              <th style={{ width: '100px' }}>STATUS</th>
              <th style={{ width: '120px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-20" style={{ color: 'var(--dim)' }}>
                  SCANNING_FREQUENCIES...
                </td>
              </tr>
            ) : filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <tr key={msg.id} className="proj-row group">
                  <td style={{ fontSize: '10px', color: 'var(--dim)' }}>
                    {new Date(msg.timestamp).toLocaleDateString()}<br/>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false })}
                  </td>
                  <td className="proj-title" style={{ fontSize: '11px' }}>
                    {msg.role.toUpperCase()}
                  </td>
                  <td style={{ fontSize: '12px', lineHeight: '1.5', color: msg.status === 'unread' ? 'var(--green)' : 'var(--dim)' }}>
                    <div className="max-w-[500px] truncate-2-lines">
                      {msg.content}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${msg.status === 'read' ? 'archived' : 'published'}`}>
                      {msg.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button 
                        onClick={(e) => toggleReadStatus(msg.id, msg.status, e)}
                        className="row-btn"
                        title="TOGGLE_READ_STATUS"
                      >
                        {msg.status === 'read' ? 'OPEN' : 'READ'}
                      </button>
                      <button 
                        onClick={(e) => handleDelete(msg.id, e)}
                        className="row-btn del"
                      >
                        DEL
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-20" style={{ color: 'var(--faint)' }}>
                  NO_SIGNALS_DETECTED
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .truncate-2-lines {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .proj-row:hover .truncate-2-lines {
          overflow: visible;
          white-space: normal;
          display: block;
        }
      `}</style>
    </div>
  );
}
