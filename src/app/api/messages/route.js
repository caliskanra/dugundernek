import fs from "fs/promises";
import path from "path";
import { sendNotificationEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const projectId = formData.get("projectId");
    const guestNameRaw = formData.get("guestName");
    const messageRaw = formData.get("message");
    const media = formData.get("media");

    if (!projectId || !guestNameRaw) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    // Profanity Check
    if (hasProfanity(guestNameRaw) || hasProfanity(messageRaw)) {
      // You can either reject entirely or clean it. We will clean it and flag it.
      // But the requirement says "uygunsa kayıt edilecek", so we just clean it and save it as pending
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
        console.warn("Vercel dosya yazma hatası atlandı:", uploadError.message);
        mediaUrl = null;
      }
    }

    const newMsg = await prisma.guestMessage.create({
      data: {
        projectId,
        guestName,
        message,
        mediaUrl,
        status: "pending" // Always requires host approval
      }
    });

    // Send Notification Email (Async - don't wait for it to finish to respond to user)
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
