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
      <div className="auth-wrapper">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="glass-panel auth-card">
        <h1>Düğün Dernek</h1>
        <p>En özel gününüzü, sevdiklerinizin bıraktığı anılarla ölümsüzleştirin. Mobil uyumlu dijital karşılama ekranınız ve anı defteriniz.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            className="btn-primary" 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Google ile Başla
          </button>

          <div style={{ borderTop: "1px solid rgba(0,0,0,0.1)", margin: "10px 0" }}></div>

          <button 
            className="btn-secondary" 
            onClick={() => signIn("credentials", { username: "demo", password: "demo", callbackUrl: "/dashboard" })}
          >
            Demo Hesabı ile Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}
