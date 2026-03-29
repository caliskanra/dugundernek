import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import QRCodeDisplay from "./QRCodeDisplay";
import Link from "next/link";

export default async function ProjectDetail({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const project = await prisma.weddingProject.findUnique({
    where: { id: params.id, userId: session.user.id },
    include: {
      messages: { orderBy: { createdAt: 'desc' } },
      gifts: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!project) return <div className="glass-panel">Proje bulunamadı.</div>;

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  // Ensure appUrl ends without slash to avoid double slashes
  const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
  const projectUrl = `${baseUrl}/${project.slug}`;

  const pendingCount = project.messages.filter(m => m.status === 'pending').length;
  const totalGiftValue = project.gifts.reduce((sum, g) => sum + g.value, 0);

  return (
    <div className="glass-panel" style={{ minHeight: '60vh' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{project.brideName} & {project.groomName}</h2>
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>{project.slug}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <form action={`/api/projects/${project.id}/toggle-gifts`} method="POST">
             <button type="submit" className="btn-secondary" style={{ padding: '8px 15px', fontSize: '0.85rem' }}>
                {project.isGiftEnabled ? "Takı Defterini Kapat" : "Takı Defterini Aç"}
             </button>
          </form>
          <Link href="/dashboard" className="btn-secondary" style={{ padding: '8px 15px', fontSize: '0.85rem' }}>Geri Dön</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        <div>
          {/* MISAFIR BAGLANTISI */}
          <div style={{ background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '20px', marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--text-light)', fontSize: '1.2rem' }}>Misafir Bağlantısı</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
               <input readOnly value={projectUrl} className="form-control" style={{ flex: 1, background: 'rgba(255,255,255,0.6)' }} />
               <a href={projectUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>Sayfayı Aç</a>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
             <div style={{ background: 'rgba(212, 163, 115, 0.1)', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Toplam Takı</p>
                <h4 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--primary)' }}>{totalGiftValue.toLocaleString("tr-TR")} ₺</h4>
             </div>
             <div style={{ background: 'rgba(96, 108, 56, 0.1)', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Toplam Mesaj</p>
                <h4 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-light)' }}>{project.messages.length} Adet</h4>
             </div>
          </div>

          {/* TAKILAR */}
          <div style={{ background: 'rgba(255,255,255,0.4)', padding: '25px', borderRadius: '24px', marginBottom: '30px' }}>
             <h3 style={{ marginBottom: '20px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>💰</span> Gelen Takılar
             </h3>
             {project.gifts.length === 0 ? (
               <p style={{ opacity: 0.6, fontStyle: 'italic' }}>Henüz takı gönderilmemiş.</p>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {project.gifts.map(gift => (
                   <div key={gift.id} style={{ background: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '1rem' }}>{gift.senderName}</strong>
                          <span style={{ 
                             fontSize: '0.7rem', 
                             background: gift.type === 'gold' ? '#FAEEDA' : gift.type === 'bracelet' ? '#FBEAF0' : '#EAF3DE', 
                             color: '#333', 
                             padding: '2px 8px', 
                             borderRadius: '10px',
                             fontWeight: 600
                          }}>
                             {gift.type === 'gold' ? `${gift.quantity}× ${gift.subtype} altın` : gift.type === 'bracelet' ? `${gift.quantity}× bilezik` : `${gift.amount} ${gift.currency}`}
                          </span>
                       </div>
                       {gift.message && <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7, fontStyle: 'italic' }}>"{gift.message}"</p>}
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>{gift.value.toLocaleString("tr-TR")} ₺</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.5 }}>{new Date(gift.createdAt).toLocaleDateString("tr-TR")}</p>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* MESAJLAR */}
          <div style={{ background: 'rgba(255,255,255,0.4)', padding: '25px', borderRadius: '24px' }}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h3 style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <span style={{ fontSize: '1.4rem' }}>💌</span> Gelen Mesajlar
              </h3>
              {pendingCount > 0 && <span style={{ background: '#e57373', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{pendingCount} Onay Bekliyor</span>}
            </div>
            
            {project.messages.length === 0 ? (
              <p style={{ opacity: 0.6, fontStyle: 'italic' }}>Henüz hiç mesaj mesaj yok.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {project.messages.map(msg => (
                  <div key={msg.id} style={{ background: 'rgba(255,255,255,0.8)', padding: '18px', borderRadius: '15px' }}>
                    <div className="flex-between" style={{ marginBottom: '12px' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{msg.guestName}</strong>
                      <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(msg.createdAt).toLocaleDateString("tr-TR")}</span>
                    </div>
                    
                    <p style={{ fontSize: '1rem', marginBottom: '15px', lineHeight: '1.5' }}>{msg.message}</p>
                    
                    {msg.mediaUrl && (
                      <div style={{ marginBottom: '15px' }}>
                        {msg.mediaUrl.match(/\.(mp4|webm)$/i) ? (
                            <video src={msg.mediaUrl} controls style={{ width: '100%', borderRadius: '12px' }}></video>
                        ) : (
                            <img src={msg.mediaUrl} alt="Medya" style={{ width: '100%', borderRadius: '12px' }} />
                        )}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {msg.status === 'pending' && (
                        <>
                          <form action={`/api/messages/${msg.id}/approve`} method="POST">
                            <button type="submit" className="btn-primary" style={{ padding: '6px 15px', fontSize: '0.8rem', background: '#81c784', boxShadow: 'none' }}>Onayla</button>
                          </form>
                          <form action={`/api/messages/${msg.id}/reject`} method="POST">
                            <button type="submit" className="btn-secondary" style={{ padding: '6px 15px', fontSize: '0.8rem', background: '#e57373', color: '#fff', border: 'none' }}>Reddet</button>
                          </form>
                        </>
                      )}
                      {msg.status === 'approved' && <span style={{ color: '#81c784', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>✓ Yayında</span>}
                      {msg.status === 'rejected' && <span style={{ color: '#e57373', fontSize: '0.85rem', fontWeight: 600 }}>✕ Reddedildi</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
           <div style={{ position: 'sticky', top: '20px' }}>
             <QRCodeDisplay url={projectUrl} project={project} />
           </div>
        </div>
      </div>
    </div>
  );
}
