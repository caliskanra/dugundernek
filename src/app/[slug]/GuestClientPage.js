"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import GiftRegistry from "@/components/GiftRegistry";

export default function GuestClientPage({ project }) {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const paymentError = searchParams.get("error");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(paymentStatus ? "gift" : "message");
  const [copied, setCopied] = useState(false);

  // Eğer ödeme başarılıysa sekmeyi "Takı Gönder"e sabitleyip bir süre sonra query'i temizleyebiliriz
  // Şimdilik sadece mesaj tabından başlatmamak yeterli.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("projectId", project.id);
    formData.append("guestName", e.target.guestName.value);
    formData.append("message", e.target.message.value);

    const mediaInput = e.target.media;
    if (mediaInput && mediaInput.files && mediaInput.files.length > 0) {
      const file = mediaInput.files[0];
      const safeExt = file.name.split('.').pop() || 'jpg';
      // iOS Safari için dosya adını güvenli karakterlere çevirip doğrudan Blob olarak ekle
      formData.append("media", file, `media-${Date.now()}.${safeExt}`);
    }

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
    padding: '12px 20px',
    borderRadius: '50px',
    border: active ? '1px solid var(--primary)' : '1px solid rgba(212,163,115,0.1)',
    background: active ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.6)',
    color: active ? '#fff' : 'var(--text-dark)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flex: 1,
    fontSize: '0.9rem',
    boxShadow: active ? '0 4px 15px rgba(212, 163, 115, 0.2)' : 'none'
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(project.venueAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {/* Payment Feedback */}
      {paymentStatus === "success" && (
        <div style={{ background: '#dcedc8', padding: '15px', borderRadius: '15px', color: '#33691e', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 600 }}>
          Takınız başarıyla ulaştırıldı. Teşekkür ederiz!
        </div>
      )}
      {paymentStatus === "failed" && (
        <div style={{ background: '#ffcdd2', padding: '15px', borderRadius: '15px', color: '#b71c1c', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 600 }}>
          Ödeme başarısız oldu: {paymentError || "Lütfen tekrar deneyin."}
        </div>
      )}

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
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.3)', padding: '5px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.5)' }}>
        <button style={tabStyle(activeTab === "message")} onClick={() => setActiveTab("message")}>Anı Bırak</button>
        {project.isGiftEnabled && <button style={tabStyle(activeTab === "gift")} onClick={() => setActiveTab("gift")}>Takı Gönder</button>}
        <button style={tabStyle(activeTab === "flower")} onClick={() => setActiveTab("flower")}>Çiçek / Çelenk</button>
      </div>

      {/* Content Area */}
      {activeTab === "message" ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Guestbook Card */}
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#5c4d3c' }}>Anı Duvarı</h2>
            {project.messages.length === 0 ? (
              <p style={{ textAlign: 'center', opacity: 0.5 }}>Henüz anı paylaşılmamış. İlk mesajı siz bırakın!</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {project.messages.map(msg => (
                  <div key={msg.id} className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.9)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '1.2rem', borderBottom: '1px solid rgba(212,163,115,0.1)', paddingBottom: '10px' }}>{msg.guestName}</h4>
                    <p style={{ marginBottom: '15px', fontStyle: 'italic', lineHeight: '1.5', color: 'var(--text-dark)' }}>"{msg.message}"</p>
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

          {/* Form Card */}
          <div className="glass-panel" style={{ marginBottom: '3rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Anı Bırakın</h2>
            {success && (
              <div style={{ background: 'rgba(112, 230, 80, 0.1)', border: '1px solid #70e650', padding: '15px', borderRadius: '10px', color: '#70e650', marginBottom: '20px', textAlign: 'center' }}>
                <strong>Mesajınız gönderildi!</strong> Onaylandıktan sonra anı duvarında görünecektir.
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>İsminiz</label>
                <input type="text" name="guestName" className="form-control" required autoComplete="off" />
              </div>
              <div className="form-group">
                <label>Mesajınız</label>
                <textarea name="message" className="form-control" required></textarea>
              </div>
              <div className="form-group">
                <label>Fotoğraf / Video</label>
                <input type="file" name="media" className="form-control" accept="image/*,video/*" />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? "Gönderiliyor..." : "Mesajı Paylaş ✨"}
              </button>
            </form>
          </div>
        </div>
      ) : activeTab === "gift" ? (
        <div style={{ marginBottom: '3rem' }}>
          <GiftRegistry projectId={project.id} />
        </div>
      ) : (
        <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Çiçek & Çelenk Gönder</h2>
          <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>Çiftimize tebriklerinizi bir çiçek veya çelenk ile iletmek isterseniz aşağıdaki seçenekleri kullanabilirsiniz.</p>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-gray)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Düğün / Nikah Salonu Adresi</h3>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>{project.venueAddress || "Adres belirtilmemiş."}</p>
            <button className="btn-secondary" onClick={handleCopy} style={{ fontSize: '0.9rem', gap: '8px' }}>
              {copied ? "✅ Adres Kopyalandı" : "📋 Adresi Kopyala"}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
            <a href="https://www.ciceksepeti.com/celenk" target="_blank" className="btn-primary" style={{ background: '#00af66' }}>
              🌸 ÇiçekSepeti ile Gönder
            </a>
            <a href="https://www.tev.org.tr/bagis/tr/toren-urun-listesi/1" target="_blank" className="btn-primary" style={{ background: '#1c315e' }}>
              🎓 TEV Bağış Çelenki Gönder
            </a>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-gray)' }}>
               * Adresi kopyalayıp ödeme adımında "Teslimat Adresi" olarak yapıştırabilirsiniz.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
