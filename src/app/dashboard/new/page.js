"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("brideName", e.target.brideName.value);
    formData.append("groomName", e.target.groomName.value);
    formData.append("welcomeMessage", e.target.welcomeMessage.value);

    const mediaInput = e.target.media;
    if (mediaInput && mediaInput.files && mediaInput.files.length > 0) {
      const file = mediaInput.files[0];
      const safeExt = file.name.split('.').pop() || 'jpg';
      // iOS Safari blob bypass
      formData.append("media", file, `media-${Date.now()}.${safeExt}`);
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Bir hata oluştu");
      }
      
      router.push(`/dashboard/project/${data.project.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h2>Yeni Düğün Projesi</h2>
        <Link href="/dashboard" className="btn-secondary" style={{ padding: '6px 15px', fontSize: '0.9rem' }}>İptal</Link>
      </div>

      {error && <div style={{ color: '#ef9a9a', marginBottom: '1rem', padding: '10px', background: 'rgba(239, 154, 154, 0.1)', borderRadius: '8px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Kadın İsmi (Gelin)</label>
            <input type="text" name="brideName" className="form-control" required placeholder="Örn: Ayşe" />
          </div>
          
          <div className="form-group">
            <label>Erkek İsmi (Damat)</label>
            <input type="text" name="groomName" className="form-control" required placeholder="Örn: Ahmet" />
          </div>
        </div>

        <div className="form-group">
          <label>Karşılama Notu</label>
          <textarea 
            name="welcomeMessage" 
            className="form-control" 
            required 
            placeholder="Misafirlerinizi karşılayacak güzel bir mesaj yazın..."
          ></textarea>
        </div>

        <div className="form-group">
          <label>Karşılama Fotoğrafı/Videosu (Opsiyonel)</label>
          <input type="file" name="media" accept="image/*,video/*" className="form-control" style={{ background: 'rgba(255,255,255,0.2)' }} />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? "Oluşturuluyor..." : "Projeyi Kaydet"}
        </button>
      </form>
    </div>
  );
}
