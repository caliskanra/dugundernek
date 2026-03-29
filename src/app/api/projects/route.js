import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.email === "caliskanra@gmail.com";
  const where = isAdmin ? {} : { userId: session.user.id };

  const projects = await prisma.weddingProject.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ projects });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const brideName = formData.get("brideName");
    const groomName = formData.get("groomName");
    const welcomeMessage = formData.get("welcomeMessage");
    const venueAddress = formData.get("venueAddress");
    const weddingDate = formData.get("weddingDate");
    const media = formData.get("media");

    let mediaUrl = null;
    if (media && media.size > 0 && media.name) {
      try {
        const bytes = await media.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${media.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        
        // Ensure directory exists
        await fs.mkdir(uploadDir, { recursive: true });
        
        await fs.writeFile(path.join(uploadDir, filename), buffer);
        mediaUrl = `/uploads/${filename}`;
      } catch (uploadError) {
        console.warn("Vercel dosya yazma hatası atlandı (Sadece yerel test içindir):", uploadError.message);
        mediaUrl = null;
      }
    }

    // Generate slug: kadinismi-erkekismiGGAAYYYY
    const now = new Date();
    const gg = String(now.getDate()).padStart(2, '0');
    const aa = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const rawSlug = `${brideName.toLowerCase()}-${groomName.toLowerCase()}${gg}${aa}${yyyy}`;
    
    // Turkish character map
    const charMap = { 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c' };
    let slug = rawSlug.replace(/[ğüşıöç]/g, match => charMap[match] || match);
    
    // clean slug (remove spaces, specifically just keep letters, numbers and -)
    slug = slug.replace(/[^a-z0-9-]/gi, '');
    
    // Ensure unique if identical somehow matches
    let finalSlug = slug;
    let counter = 1;
    while(await prisma.weddingProject.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const project = await prisma.weddingProject.create({
      data: {
        userId: session.user.id,
        brideName,
        groomName,
        welcomeMessage,
        venueAddress: venueAddress || "Belirtilmedi",
        weddingDate: weddingDate ? new Date(weddingDate) : null,
        mediaUrl,
        slug: finalSlug
      }
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Projeyi oluştururken hata oluştu" }, { status: 500 });
  }
}
