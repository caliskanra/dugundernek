import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanProfanity } from "@/lib/filter";
import { createLegalLog, extractRequestInfo } from "@/lib/legalLog";

export async function POST(req) {
  try {
    // 5651: Session kontrolü — Google ile giriş zorunlu
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Takı göndermek için Google ile giriş yapmalısınız." },
        { status: 401 }
      );
    }

    const { ipAddress, userAgent } = extractRequestInfo(req);

    const data = await req.json();
    const { 
      projectId, 
      senderName: senderNameRaw, 
      type, 
      subtype, 
      quantity, 
      currency, 
      amount, 
      message: messageRaw, 
      value 
    } = data;

    if (!projectId || !senderNameRaw || !type) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const senderName = cleanProfanity(senderNameRaw);
    const message = messageRaw ? cleanProfanity(messageRaw) : null;

    const newGift = await prisma.gift.create({
      data: {
        projectId,
        senderName,
        senderUserId: session.user.id || null,
        senderEmail: session.user.email || null,
        type,
        subtype,
        quantity: parseInt(quantity) || 1,
        currency,
        amount: parseFloat(amount) || 0,
        message,
        value: parseFloat(value) || 0,
        status: "pending"
      }
    });

    // 5651: Yasal log kaydı
    await createLegalLog({
      action: "POST_GIFT",
      userId: session.user.id,
      userName: session.user.name || senderNameRaw,
      userEmail: session.user.email,
      ipAddress,
      userAgent,
      projectId,
      originalContent: `Gönderen: ${senderNameRaw} | Tip: ${type} | Mesaj: ${messageRaw || '-'}`,
      filteredContent: `Gönderen: ${senderName} | Tip: ${type} | Mesaj: ${message || '-'}`,
      resourceId: newGift.id,
      resourceType: "gift",
      metadata: { type, subtype, quantity, currency, amount, value },
    });

    return NextResponse.json({ success: true, gift: newGift });
  } catch (err) {
    console.error("Gift API Error:", err);
    return NextResponse.json({ error: "Takı gönderilemedi" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Project ID gerekli" }, { status: 400 });
    }

    const gifts = await prisma.gift.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ gifts });
  } catch (err) {
    console.error("Gift GET Error:", err);
    return NextResponse.json({ error: "Takılar getirilemedi" }, { status: 500 });
  }
}
