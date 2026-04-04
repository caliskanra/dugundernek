import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasProfanity, cleanProfanity } from "@/lib/filter";
import { createLegalLog, extractRequestInfo } from "@/lib/legalLog";
import fs from "fs/promises";
import path from "path";
import { sendNotificationEmail } from "@/lib/email";

export async function POST(req) {
  try {
    // 5651: Session kontrolü — Google ile giriş zorunlu
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Yorum yapmak için Google ile giriş yapmalısınız." },
        { status: 401 }
      );
    }

    // 5651: IP ve User-Agent bilgilerini al
    const { ipAddress, userAgent } = extractRequestInfo(req);

    const formData = await req.formData();
    const projectId = formData.get("projectId");
    const guestNameRaw = formData.get("guestName");
    const messageRaw = formData.get("message");
    const media = formData.get("media");

    if (!projectId || !guestNameRaw) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const guestName = cleanProfanity(guestNameRaw);
    const message = cleanProfanity(messageRaw);

    let mediaUrl = null;
    if (media && media.size > 0 && media.name) {
      try {
        const bytes = await media.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `msg-${Date.now()}-${media.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, filename), buffer);
        mediaUrl = `/uploads/${filename}`;
      } catch (uploadError) {
        console.warn("Dosya yazma hatası:", uploadError.message);
        mediaUrl = null;
      }
    }

    const newMsg = await prisma.guestMessage.create({
      data: {
        projectId,
        guestName,
        guestUserId: session.user.id || null,
        guestEmail: session.user.email || null,
        message,
        mediaUrl,
        status: "pending"
      }
    });

    // 5651: Yasal log kaydı
    await createLegalLog({
      action: "POST_MESSAGE",
      userId: session.user.id,
      userName: session.user.name || guestNameRaw,
      userEmail: session.user.email,
      ipAddress,
      userAgent,
      projectId,
      originalContent: `İsim: ${guestNameRaw} | Mesaj: ${messageRaw}`,
      filteredContent: `İsim: ${guestName} | Mesaj: ${message}`,
      resourceId: newMsg.id,
      resourceType: "message",
    });

    // E-posta bildirimi
    const project = await prisma.weddingProject.findUnique({
      where: { id: projectId },
      include: { user: true }
    });
    if (project) {
      sendNotificationEmail(project, guestName, message).catch(err => console.error("Email notification failed:", err));
    }

    return NextResponse.json({ success: true, newMsg });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Mesaj gönderilemedi" }, { status: 500 });
  }
}
