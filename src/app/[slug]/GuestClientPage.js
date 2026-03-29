"use client";

import { useState } from "react";
import GiftRegistry from "@/components/GiftRegistry";

export default function GuestClientPage({ project }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("message");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.target);
    formData.append("projectId", project.id);
    
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu");
      
      setSuccess(true);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = (active) => ({
    padding: '12px 24px',
    borderRadius: '50px',
    border: 'none',
    background: active ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
    color: active ? '#fff' : 'var(--text-dark)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flex: 1,
    boxShadow: active ? '0 4px 15px rgba(212, 163, 115, 0.3)' : 'none'
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {/* Welcome Hero */}
      <div className="glass-panel" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>
          {project.brideName} & {project.groomName}
        </h1>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          {project.welcomeMessage}
        </p>

        {project.mediaUrl && (
          <div style={{ marginBottom: '1rem' }}>
            {project.mediaUrl.match(/\.(mp4|webm)$/i) ? (
                <video src={project.mediaUrl} controls autoPlay loop muted playsInline style={{ maxWidth: '100%', borderRadius: '15px' }}></video>
            ) : (
                <img src={project.mediaUrl} alt="Hoş Geldiniz" style={{ maxWidth: '100%', borderRadius: '15px', maxHeight: '400px', objectFit: 'cover' }} />
            )}
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      {project.isGiftEnabled && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.3)', padding: '5px', borderRadius: '50px' }}>
          <button style={tabStyle(activeTab === "message")} onClick={() => setActiveTab("message")}>Anı Bırak</button>
          <button style={tabStyle(activeTab === "gift")} onClick={() => setActiveTab("gift")}>Takı Gönder</button>
        </div>
      )}

      {/* Content Area */}
      {activeTab === "message" ? (
        /* Guest Form */
        <div className="glass-panel" style={{ marginBottom: '3rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-light)' }}>Anı Bırakın</h2>
          
          {success && (
            <div style={{ background: '#dcedc8', padding: '15px', borderRadius: '10px', color: '#33691e', marginBottom: '20px', textAlign: 'center' }}>
              <strong>Mesajınız gönderildi!</strong> Çiftimiz tarafından onaylandıktan sonra anı duvarında görünecektir.
            </div>
          )}
          {error && (
            <div style={{ background: '#ffcdd2', padding: '15px', borderRadius: '10px', color: '#b71c1c', marginBottom: '20px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>İsminiz</label>
              <input type="text" name="guestName" className="form-control" required placeholder="İsminiz ve Soyisminiz" />
            </div>
            <div className="form-group">
              <label>Mesajınız</label>
              <textarea name="message" className="form-control" required placeholder="Çiftimiz için güzel dileklerinizi yazın..."></textarea>
            </div>
            <div className="form-group">
              <label>Fotoğraf / Video (Opsiyonel)</label>
              <input type="file" name="media" accept="image/*,video/*" className="form-control" style={{ background: 'rgba(255,255,255,0.2)' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }} disabled={loading}>
              {loading ? "Gönderiliyor..." : "Mesajı Gönder"}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ marginBottom: '3rem' }}>
          <GiftRegistry projectId={project.id} />
        </div>
      )}

      {/* Guestbook / Anı Duvarı */}
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-light)', fontFamily: 'Playfair Display, serif' }}>Anı Duvarı</h2>
      
      {project.messages.length === 0 ? (
        <p style={{ textAlign: 'center', opacity: 0.6 }}>Henüz anı paylaşılmamış. İlk mesajı siz bırakın!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {project.messages.map(msg => (
            <div key={msg.id} className="glass-panel" style={{ padding: '20px' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '1.2rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>{msg.guestName}</h4>
              <p style={{ marginBottom: '15px', fontStyle: 'italic', lineHeight: '1.5' }}>"{msg.message}"</p>
              
              {msg.mediaUrl && (
                <div style={{ marginTop: 'auto' }}>
                  {msg.mediaUrl.match(/\.(mp4|webm)$/i) ? (
                      <video src={msg.mediaUrl} controls playsInline style={{ width: '100%', borderRadius: '10px' }}></video>
                  ) : (
                      <img src={msg.mediaUrl} alt="Anı Fotoğrafı" style={{ width: '100%', borderRadius: '10px' }} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
