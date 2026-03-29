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
    <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', flex: 1, minWidth: '280px', border: '1px solid rgba(212, 163, 115, 0.15)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 10px rgba(212, 163, 115, 0.2))' }}>{icon}</div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#5c4d3c' }}>{title}</h3>
      <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>{desc}</p>
    </div>
  );

  return (
    <div style={{ width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#fdfbf9', color: '#4a3f35' }}>
      {/* Decorative Tulle Elements */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(212, 163, 115, 0.12) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: -100, left: -100, width: 500, height: 500, background: 'radial-gradient(circle, rgba(232, 215, 200, 0.4) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}></div>

      {/* Header / Navbar */}
      <nav style={{ padding: '2rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
           <img 
             src="/logo.png" 
             alt="Düğün Dernek Logo" 
             style={{ height: '60px', width: 'auto', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }} 
           />
        </div>
        <button 
          className="btn-secondary" 
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          style={{ fontSize: '0.95rem', padding: '12px 28px', background: '#fff', border: '1px solid #d4a373', color: '#d4a373', borderRadius: '30px' }}
        >
          Giriş Yap
        </button>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '6rem 5% 10rem', 
        textAlign: 'center', 
        maxWidth: '1100px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 5
      }} className="animate-fade-in">
        <h1 className="hero-text" style={{ fontSize: '4.2rem', marginBottom: '2rem', color: '#3d352e' }}>
          En Özel Gününüz İçin <br />
          <span className="gradient-text" style={{ color: '#d4a373' }}>Dijital Bir Anı Defteri</span>
        </h1>
        <p style={{ fontSize: '1.35rem', color: '#8c7b70', marginBottom: '3.5rem', maxWidth: '750px', lineHeight: '1.6' }}>
          Düğününüzü misafirlerinizin kalbinden dökülen anılarla taçlandırın. Modern, zarif ve tamamen dijital bir deneyim.
        </p>
        
        <button 
          className="btn-primary" 
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          style={{ padding: '20px 52px', fontSize: '1.25rem', borderRadius: '60px', background: '#d4a373', color: '#fff', border: 'none' }}
        >
          Düğün Projesi Oluştur ✨
        </button>
        
        <p style={{ marginTop: '1.8rem', fontSize: '1rem', color: '#b5a395', fontStyle: 'italic' }}>
          Zarafet ve teknolojinin buluştuğu nokta.
        </p>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '6rem 5%', background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(212, 163, 115, 0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '5rem', color: '#4a3f35' }}>
            Aşkınızı Bilgeliğe <span className="gradient-text" style={{ color: '#d4a373' }}>Dönüştürün</span>
          </h2>
          
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <FeatureCard 
              icon="🕊️" 
              title="Dijital Takı Defteri" 
              desc="Misafirlerinizden gelen sevgi gösterilerini modern ve güvenli bir şekilde kabul edin."
            />
            <FeatureCard 
              icon="💍" 
              title="Sonsuz Anı Duvarı" 
              desc="Her bir dilek, her bir kare sonsuza kadar dijital defterinizde yaşasın."
            />
            <FeatureCard 
              icon="🌹" 
              title="Zarif Çelenk & Çiçek" 
              desc="Misafirleriniz için salonunuza çiçek göndermeyi tek tıkla en klas hale getirin."
            />
          </div>
        </div>
      </section>

      {/* Call to Action Bottom */}
      <section style={{ padding: '10rem 5%', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto', background: '#d4a373', padding: '5rem 2rem', borderRadius: '40px' }}>
           <h2 style={{ color: '#fff', fontSize: '3rem', marginBottom: '2rem' }}>Hayallerinizi Bizimle Dijitalleştirin.</h2>
           <button 
             className="btn-secondary" 
             onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
             style={{ background: '#fff', color: '#d4a373', border: 'none', padding: '18px 56px', fontSize: '1.2rem', borderRadius: '50px' }}
           >
             Hemen Başla
           </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '5rem 5%', textAlign: 'center', color: '#a6968a', fontSize: '0.95rem', borderTop: '1px solid rgba(212, 163, 115, 0.1)' }}>
        <p>© 2026 Düğün Dernek | Zarafetin Dijital Hali</p>
      </footer>
    </div>
  );
}
