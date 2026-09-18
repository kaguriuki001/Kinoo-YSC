"use client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { STICKER_PACKS, GIF_STICKERS } from "@/lib/stickers";

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
  const [isMobile, setIsMobile] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [stickerPack, setStickerPack] = useState(0);
  const [showGifs, setShowGifs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDarkMode(localStorage.getItem("kinoo_theme") === "dark");
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    const saved = localStorage.getItem("kinoo_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
        loadConversations(u.id || u._id);
        loadUsers();
      } catch (e) {}
    }
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.conversationId);
      markAsRead(activeConv.conversationId);
      setConversations(prev => prev.map(c =>
        c.conversationId === activeConv.conversationId ? { ...c, unread: 0 } : c
      ));
      const interval = setInterval(() => loadMessages(activeConv.conversationId), 4000);
      return () => clearInterval(interval);
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = (uid: string) => {
    fetch("/api/conversations?userId=" + uid + "&t=" + Date.now(), { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setConversations(d); })
      .catch(() => {});
  };

  const loadUsers = () => {
    fetch("/api/users?t=" + Date.now())
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setAllUsers(d.filter((u: any) => u.status === "active")); })
      .catch(() => {});
  };

  const loadMessages = (cid: string) => {
    fetch("/api/messages?conversationId=" + cid + "&t=" + Date.now(), { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setMessages(d); })
      .catch(() => {});
  };

  const markAsRead = async (cid: string) => {
    const uid = user?.id || user?._id;
    if (!uid) return;
    try {
      await fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: cid, userId: uid })
      });
    } catch (e) {}
  };

  const startDirectChat = async (otherUserId: string) => {
    const uid = user.id || user._id;
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: uid, otherUserId, type: "direct" })
    });
    const data = await res.json();
    if (res.ok) {
      setShowNewChat(false);
      loadConversations(uid);
      const other = allUsers.find(u => u._id === otherUserId);
      setActiveConv({ conversationId: data.conversationId, name: other?.fullName || "Chat" });
    }
  };

  const startBroadcast = async () => {
    const uid = user.id || user._id;
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: uid, type: "broadcast", name: "Broadcast to All" })
    });
    const data = await res.json();
    if (res.ok) {
      setShowNewChat(false);
      loadConversations(uid);
      setActiveConv({ conversationId: data.conversationId, name: "Broadcast to All" });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return;
    const uid = user.id || user._id;
    const optimistic = {
      _id: "temp_" + Date.now(),
      conversationId: activeConv.conversationId,
      senderId: uid,
      senderName: user.name || "You",
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
          senderName: user.name || "User",
          text
        })
      });
      if (res.ok) loadMessages(activeConv.conversationId);
    } catch (e) { toast.error("Message failed"); }
  };

  const sendSticker = async (sticker: string, type: string) => {
    if (!activeConv) return;
    const uid = user.id || user._id;
    const optimistic = {
      _id: "temp_" + Date.now(),
      conversationId: activeConv.conversationId,
      senderId: uid,
      senderName: user.name || "You",
      text: "",
      stickers: [{ content: sticker, type }],
      createdAt: new Date(),
      readBy: [uid]
    };
    setMessages(prev => [...prev, optimistic]);
    setShowStickers(false);
    setShowGifs(false);

    try {
      const res = await fetch("/api/messages/sticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConv.conversationId, senderId: uid, senderName: user.name || "User", sticker, stickerType: type })
      });
      if (res.ok) loadMessages(activeConv.conversationId);
    } catch (e) { toast.error("Sticker failed"); }
  };

  const textColor = darkMode ? "#e2e8f0" : "#1e293b";
  const bgColor = darkMode ? "#1e293b" : "white";
  const borderColor = darkMode ? "#334155" : "#e5e7eb";
  const chatBg = darkMode ? "#0f172a" : "#efeae2";
  const myId = user?.id || user?._id;

  if (!user) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;

  const filteredUsers = allUsers.filter(u => u._id !== myId && u.fullName?.toLowerCase().includes(searchUser.toLowerCase()));
  const showChatList = !isMobile || !activeConv;
  const showChatWindow = !isMobile || activeConv;

  return (
    <div style={{ display: "flex", height: isMobile ? "calc(100vh - 130px)" : "calc(100vh - 140px)", background: bgColor, borderRadius: isMobile ? "0" : "12px", border: isMobile ? "none" : "1px solid " + borderColor, color: textColor, overflow: "hidden" }}>
      {showChatList && (
        <div style={{ width: isMobile ? "100%" : "340px", borderRight: isMobile ? "none" : "1px solid " + borderColor, display: "flex", flexDirection: "column", background: bgColor }}>
          <div style={{ padding: "12px 15px", borderBottom: "1px solid " + borderColor, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Chats</h2>
            <button onClick={() => setShowNewChat(!showNewChat)} style={{ background: "#3b82f6", color: "white", border: "none", padding: "8px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>+ New</button>
          </div>

          {showNewChat && (
            <div style={{ padding: "15px", borderBottom: "1px solid " + borderColor, background: darkMode ? "#1f2937" : "#f9fafb" }}>
              <button onClick={startBroadcast} style={{ width: "100%", background: "#8b5cf6", color: "white", border: "none", padding: "12px", borderRadius: "10px", cursor: "pointer", marginBottom: "10px", fontSize: "13px", fontWeight: "600" }}>📢 Broadcast to All Members</button>
              <input placeholder="Search members..." value={searchUser} onChange={(e) => setSearchUser(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid " + borderColor, background: darkMode ? "#334155" : "white", color: textColor, fontSize: "14px", boxSizing: "border-box", marginBottom: "10px", outline: "none" }} />
              <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                {filteredUsers.map(u => (
                  <div key={u._id} onClick={() => startDirectChat(u._id)} style={{ padding: "10px", cursor: "pointer", borderRadius: "8px", marginBottom: "5px", background: darkMode ? "#334155" : "white", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#3b82f6", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", flexShrink: 0 }}>{u.fullName?.charAt(0)?.toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "14px", fontWeight: "600" }}>{u.fullName}</p>
                      <p style={{ fontSize: "12px", opacity: "0.6" }}>{u.phone}</p>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && <p style={{ textAlign: "center", opacity: "0.5", fontSize: "13px", padding: "10px" }}>No members found</p>}
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto" }}>
            {conversations.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", opacity: "0.5" }}>
                <p style={{ fontSize: "48px", marginBottom: "10px" }}>💬</p>
                <p style={{ fontSize: "14px" }}>No chats yet</p>
                <p style={{ fontSize: "12px", marginTop: "5px" }}>Tap "+ New" to start</p>
              </div>
            ) : conversations.map(c => (
              <div key={c.conversationId} onClick={() => setActiveConv(c)} style={{ padding: "12px 15px", cursor: "pointer", borderBottom: "1px solid " + borderColor, background: activeConv?.conversationId === c.conversationId ? (darkMode ? "#334155" : "#eff6ff") : "transparent", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: c.type === "broadcast" ? "#8b5cf6" : "#10b981", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px", flexShrink: 0 }}>{c.type === "broadcast" ? "📢" : c.name?.charAt(0)?.toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                    <p style={{ fontWeight: "600", fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                    <span style={{ fontSize: "11px", opacity: "0.6", flexShrink: 0, marginLeft: "5px" }}>{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: "13px", opacity: "0.7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{c.lastMessage || "No messages yet"}</p>
                    {c.unread > 0 && activeConv?.conversationId !== c.conversationId && (
                      <span style={{ background: "#25d366", color: "white", fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold", marginLeft: "5px", flexShrink: 0 }}>{c.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showChatWindow && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: chatBg, position: "relative" }}>
          {!activeConv ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: "0.5" }}>
              <p style={{ fontSize: "64px" }}>💬</p>
              <p style={{ marginTop: "15px", fontSize: "15px" }}>Select a chat or start a new one</p>
            </div>
          ) : (
            <>
              <div style={{ padding: "10px 15px", background: darkMode ? "#1e293b" : "#075e54", color: "white", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
                {isMobile && (
                  <button onClick={() => setActiveConv(null)} style={{ background: "none", border: "none", color: "white", fontSize: "22px", cursor: "pointer", padding: "4px", marginLeft: "-8px" }}>←</button>
                )}
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px", flexShrink: 0 }}>{activeConv.type === "broadcast" ? "📢" : activeConv.name?.charAt(0)?.toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: "600", fontSize: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeConv.name}</p>
                  <p style={{ fontSize: "12px", opacity: "0.8" }}>{activeConv.type === "broadcast" ? "All members" : "online"}</p>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "12px" : "20px" }}>
                {messages.map((m: any) => {
                  const isMine = m.senderId === myId;
                  const isSticker = m.stickers && m.stickers.length > 0;
                  return (
                    <div key={m._id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", marginBottom: "6px" }}>
                      <div style={{ maxWidth: isMobile ? "85%" : "65%", background: isSticker ? "transparent" : (isMine ? "#dcf8c6" : (darkMode ? "#334155" : "white")), color: isMine ? "#000" : textColor, padding: isSticker ? "0" : "8px 12px", borderRadius: isMine ? "12px 12px 2px 12px" : "12px 12px 12px 2px", boxShadow: isSticker ? "none" : "0 1px 1px rgba(0,0,0,0.08)" }}>
                        {!isMine && !isSticker && <p style={{ fontSize: "11px", fontWeight: "bold", color: "#075e54", marginBottom: "3px" }}>{m.senderName}</p>}
                        {isSticker ? (
                          <div>
                            {m.stickers.map((s: any, i: number) => (
                              s.type === "gif" ? <img key={i} src={s.content} alt="gif" style={{ maxWidth: "180px", borderRadius: "12px" }} /> : <p key={i} style={{ fontSize: "72px", lineHeight: 1, margin: 0 }}>{s.content}</p>
                            ))}
                            <p style={{ fontSize: "10px", opacity: "0.6", textAlign: isMine ? "right" : "left", marginTop: "3px", color: textColor }}>
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {isMine && <span style={{ marginLeft: "4px" }}>✓✓</span>}
                            </p>
                          </div>
                        ) : (
                          <>
                            <p style={{ fontSize: "14px", lineHeight: "1.4", wordBreak: "break-word" }}>{m.text}</p>
                            <p style={{ fontSize: "10px", opacity: "0.6", marginTop: "3px", textAlign: "right" }}>
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {isMine && <span style={{ marginLeft: "4px" }}>✓✓</span>}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {showStickers && (
                <div style={{ background: darkMode ? "#1e293b" : "white", borderTop: "1px solid " + borderColor, maxHeight: "300px", overflowY: "auto" }}>
                  <div style={{ display: "flex", gap: "8px", padding: "10px 15px", overflowX: "auto", borderBottom: "1px solid " + borderColor }}>
                    {STICKER_PACKS.map((pack, i) => (
                      <button key={i} onClick={() => setStickerPack(i)} style={{ padding: "6px 12px", borderRadius: "20px", border: "none", background: stickerPack === i ? "#3b82f6" : (darkMode ? "#334155" : "#f1f5f9"), color: stickerPack === i ? "white" : textColor, cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap", fontWeight: "600" }}>{pack.name}</button>
                    ))}
                    <button onClick={() => { setShowGifs(true); setShowStickers(false); }} style={{ padding: "6px 12px", borderRadius: "20px", border: "none", background: darkMode ? "#334155" : "#f1f5f9", color: textColor, cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap", fontWeight: "600" }}>🎬 GIFs</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "5px", padding: "10px 15px" }}>
                    {STICKER_PACKS[stickerPack].stickers.map((s, i) => (
                      <button key={i} onClick={() => sendSticker(s, "emoji")} style={{ background: "none", border: "none", fontSize: "28px", cursor: "pointer", padding: "4px", borderRadius: "6px" }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {showGifs && (
                <div style={{ background: darkMode ? "#1e293b" : "white", borderTop: "1px solid " + borderColor, maxHeight: "300px", overflowY: "auto" }}>
                  <div style={{ display: "flex", gap: "8px", padding: "10px 15px", borderBottom: "1px solid " + borderColor }}>
                    <button onClick={() => { setShowStickers(true); setShowGifs(false); }} style={{ padding: "6px 12px", borderRadius: "20px", border: "none", background: darkMode ? "#334155" : "#f1f5f9", color: textColor, cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>😀 Emoji</button>
                    <button style={{ padding: "6px 12px", borderRadius: "20px", border: "none", background: "#3b82f6", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>🎬 GIFs</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", padding: "10px 15px" }}>
                    {GIF_STICKERS.map((gif, i) => (
                      <button key={i} onClick={() => sendSticker(gif, "gif")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, borderRadius: "8px", overflow: "hidden" }}>
                        <img src={gif} alt="gif" style={{ width: "100%", borderRadius: "8px" }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ padding: isMobile ? "8px" : "12px 15px", background: darkMode ? "#1e293b" : "#f0f0f0", display: "flex", gap: "8px", alignItems: "center" }}>
                <button onClick={() => { setShowStickers(!showStickers); setShowGifs(false); }} style={{ background: showStickers ? "#3b82f6" : "transparent", color: showStickers ? "white" : textColor, border: "none", borderRadius: "50%", width: "42px", height: "42px", cursor: "pointer", fontSize: "22px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>😀</button>
                <input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "none", background: darkMode ? "#334155" : "white", color: textColor, fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
                <button onClick={sendMessage} style={{ background: "#25d366", color: "white", border: "none", borderRadius: "50%", width: "46px", height: "46px", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>➤</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
