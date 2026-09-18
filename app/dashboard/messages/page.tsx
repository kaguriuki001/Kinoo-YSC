"use client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDarkMode(localStorage.getItem('kinoo_theme') === 'dark');
    const saved = localStorage.getItem('kinoo_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
        loadConversations(u.id || u._id);
        loadUsers();
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.conversationId);
      const interval = setInterval(() => loadMessages(activeConv.conversationId), 5000);
      return () => clearInterval(interval);
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = (uid: string) => {
    fetch(`/api/conversations?userId=${uid}&t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setConversations(d); })
      .catch(() => {});
  };

  const loadUsers = () => {
    fetch("/api/users?t=" + Date.now())
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setAllUsers(d.filter((u: any) => u.status === 'active')); })
      .catch(() => {});
  };

  const loadMessages = (cid: string) => {
    fetch(`/api/messages?conversationId=${cid}&t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setMessages(d); })
      .catch(() => {});
  };

  const startDirectChat = async (otherUserId: string) => {
    const uid = user.id || user._id;
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: uid, otherUserId, type: 'direct' })
    });
    const data = await res.json();
    if (res.ok) {
      setShowNewChat(false);
      loadConversations(uid);
      const other = allUsers.find(u => u._id === otherUserId);
      setActiveConv({ conversationId: data.conversationId, name: other?.fullName || 'Chat' });
    }
  };

  const startBroadcast = async () => {
    const uid = user.id || user._id;
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: uid, type: 'broadcast', name: 'Broadcast to All' })
    });
    const data = await res.json();
    if (res.ok) {
      setShowNewChat(false);
      loadConversations(uid);
      setActiveConv({ conversationId: data.conversationId, name: 'Broadcast to All' });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return;
    const uid = user.id || user._id;
    const optimistic = {
      _id: 'temp_' + Date.now(),
      conversationId: activeConv.conversationId,
      senderId: uid,
      senderName: user.name || 'You',
      text: newMessage,
      createdAt: new Date(),
      readBy: [uid]
    };
    setMessages(prev => [...prev, optimistic]);
    const text = newMessage;
    setNewMessage("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConv.conversationId,
          senderId: uid,
          senderName: user.name || 'User',
          text
        })
      });
      if (res.ok) loadMessages(activeConv.conversationId);
    } catch (e) { toast.error("Message failed"); }
  };

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : 'white';
  const borderColor = darkMode ? '#334155' : '#e5e7eb';
  const myId = user?.id || user?._id;

  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const filteredUsers = allUsers.filter(u => u._id !== myId && u.fullName?.toLowerCase().includes(searchUser.toLowerCase()));

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 140px)', background: bgColor, borderRadius: '12px', border: `1px solid ${borderColor}`, color: textColor, overflow: 'hidden' }}>
      <div style={{ width: '300px', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '15px', borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>💬 Chats</h2>
          <button onClick={() => setShowNewChat(!showNewChat)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>+ New</button>
        </div>
        {showNewChat && (
          <div style={{ padding: '15px', borderBottom: `1px solid ${borderColor}` }}>
            <button onClick={startBroadcast} style={{ width: '100%', background: '#8b5cf6', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '10px', fontSize: '13px', fontWeight: '600' }}>📢 Broadcast to All</button>
            <input placeholder="Search members..." value={searchUser} onChange={(e) => setSearchUser(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: darkMode ? '#334155' : 'white', color: textColor, fontSize: '13px', boxSizing: 'border-box' as const, marginBottom: '8px' }} />
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredUsers.map(u => (
                <div key={u._id} onClick={() => startDirectChat(u._id)} style={{ padding: '8px', cursor: 'pointer', borderRadius: '6px', marginBottom: '4px', background: darkMode ? '#334155' : '#f8fafc' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600' }}>{u.fullName}</p>
                  <p style={{ fontSize: '11px', opacity: '0.6' }}>{u.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', opacity: '0.6', fontSize: '13px' }}>No conversations yet</p>
          ) : conversations.map(c => (
            <div key={c.conversationId} onClick={() => setActiveConv(c)} style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: `1px solid ${borderColor}`, background: activeConv?.conversationId === c.conversationId ? (darkMode ? '#334155' : '#eff6ff') : 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontWeight: '600', fontSize: '14px' }}>{c.name}</p>
                {c.unread > 0 && <span style={{ background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 7px', borderRadius: '10px', fontWeight: 'bold' }}>{c.unread}</span>}
              </div>
              <p style={{ fontSize: '12px', opacity: '0.6', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMessage || 'New conversation'}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!activeConv ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: '0.5' }}>
            <p style={{ fontSize: '48px' }}>💬</p>
            <p style={{ marginTop: '10px' }}>Select a chat or start a new one</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '15px', borderBottom: `1px solid ${borderColor}`, fontWeight: 'bold' }}>{activeConv.name}</div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: darkMode ? '#0f172a' : '#f8fafc' }}>
              {messages.map((m: any) => {
                const isMine = m.senderId === myId;
                return (
                  <div key={m._id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                    <div style={{ maxWidth: '70%', background: isMine ? '#3b82f6' : (darkMode ? '#334155' : 'white'), color: isMine ? 'white' : textColor, padding: '10px 14px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                      {!isMine && <p style={{ fontSize: '11px', fontWeight: 'bold', opacity: '0.8', marginBottom: '3px' }}>{m.senderName}</p>}
                      <p style={{ fontSize: '14px', lineHeight: '1.4', wordBreak: 'break-word' }}>{m.text}</p>
                      <p style={{ fontSize: '10px', opacity: '0.7', marginTop: '4px', textAlign: 'right' }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '12px 15px', borderTop: `1px solid ${borderColor}`, display: 'flex', gap: '8px' }}>
              <input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} style={{ flex: 1, padding: '10px 14px', borderRadius: '22px', border: `1px solid ${borderColor}`, background: darkMode ? '#334155' : '#f8fafc', color: textColor, fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }} />
              <button onClick={sendMessage} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '50%', width: '42px', height: '42px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>➤</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
