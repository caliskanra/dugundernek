"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-gray)' }}>
        <p>Deneyim Hazırlanıyor...</p>
      </div>
    );
  }

  const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', flex: 1, minWidth: '280px' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1.25rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: '#fff' }}>{title}</h3>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-gray)', lineHeight: '1.6' }}>{desc}</p>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      {/* Header / Navbar */}
      <nav style={{ padding: '2rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <img 
             src="/dugundernek_logo_mockup_1774810307008.png" 
             alt="Logo" 
             style={{ height: '50px', width: 'auto' }} 
           />
        </div>
        <button 
          className="btn-secondary" 
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          style={{ fontSize: '0.9rem', padding: '10px 24px' }}
        >
          Giriş Yap
        </button>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '4rem 5% 8rem', 
        textAlign: 'center', 
        maxWidth: '1000px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }} className="animate-fade-in">
        <h1 className="hero-text">
          En Özel Gününüz İçin <br />
          <span className="gradient-text">Dijital Bir Anı Defteri</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-gray)', marginBottom: '3rem', maxWidth: '700px', lineHeight: '1.5' }}>
          Dugundernek.com ile misafirlerinizin anılarını ölümsüzleştirin, takılarınızı güvenle yönetin ve her anı dijital dünyada koruyun.
        </p>
        
        <button 
          className="btn-primary" 
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          style={{ padding: '18px 48px', fontSize: '1.2rem' }}
        >
          Düğün Projesi Oluştur ✨
        </button>
        
        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', opacity: 0.5 }}>
          Kurulum sadece 2 dakika sürer. Hemen şimdi başlayın.
        </p>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '4rem 5%', backgroundColor: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.25rem', marginBottom: '4rem' }}>
            Neden <span className="gradient-text">Düğün Dernek?</span>
          </h2>
          
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <FeatureCard 
              icon="🎁" 
              title="Dijital Takı Defteri" 
              desc="Kredi kartı veya havale ile misafirlerinizden takıları güvenle kabul edin. iyzico korumalı altyapı ile."
            />
            <FeatureCard 
              icon="✍️" 
              title="Sonsuz Anı Duvarı" 
              desc="Misafirleriniz fotoğraf, video ve mesaj bıraksın. Sizin onayınızdan sonra anı duvarında yayınlansın."
            />
            <FeatureCard 
              icon="🌸" 
              title="Çelenk & Çiçek" 
              desc="Düğününüz için çelenk veya çiçek gönderimini misafirlerinize tek tıkla kolaylaştırın."
            />
          </div>
        </div>
      </section>

      {/* Call to Action Bottom */}
      <section style={{ padding: '8rem 5%', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', background: 'var(--primary-gradient)' }}>
           <h2 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Haydi, Hayallerini Dijitallere Taşı.</h2>
           <button 
             className="btn-secondary" 
             onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
             style={{ background: '#fff', color: '#000', border: 'none', padding: '16px 48px' }}
           >
             Hemen Başla
           </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 5%', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-gray)', fontSize: '0.9rem' }}>
        <p>© 2026 Düğün Dernek. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
