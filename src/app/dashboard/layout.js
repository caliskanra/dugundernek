"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return <div className="auth-wrapper"><p>Yükleniyor...</p></div>;
  }

  return (
    <div>
      <nav className="navbar">
        <Link href="/dashboard" className="brand">Düğün Dernek</Link>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>{session?.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            Çıkış Yap
          </button>
        </div>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
}
