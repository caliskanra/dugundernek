"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects", { cache: "no-store", headers: { 'Cache-Control': 'no-cache' } })
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="glass-panel" style={{ minHeight: '60vh' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h2>Projelerim</h2>
        <Link href="/dashboard/new" className="btn-primary">
          + Yeni Proje Oluştur
        </Link>
      </div>

      {loading ? (
        <p>Projeler yükleniyor...</p>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.7 }}>
          <p>Henüz bir düğün projesi oluşturmadınız.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {projects.map(proj => (
            <div key={proj.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.6)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.8)' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>{proj.brideName} & {proj.groomName}</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>Oluşturulma: {new Date(proj.createdAt).toLocaleDateString("tr-TR")}</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link href={`/${proj.slug}`} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} target="_blank">Sayfaya Git</Link>
                <Link href={`/dashboard/project/${proj.id}`} className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Mesajları Yönet</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
