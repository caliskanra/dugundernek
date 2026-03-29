import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import GuestClientPage from "./GuestClientPage";

export default async function PublicGuestPage({ params }) {
  const project = await prisma.weddingProject.findUnique({
    where: { slug: params.slug },
    include: {
      messages: {
        where: { status: 'approved' },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!project) {
    return (
      <div className="auth-wrapper">
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h2>Sayfa Bulunamadı</h2>
          <p>Harika bir düğün sayfası arıyordunuz ama bu bağlantı geçersiz.</p>
        </div>
      </div>
    );
  }

  return <GuestClientPage project={project} />;
}
