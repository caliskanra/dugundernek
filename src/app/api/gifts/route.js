import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanProfanity } from "@/lib/filter";

export async function POST(req) {
  try {
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
        type,
        subtype,
        quantity: parseInt(quantity) || 1,
        currency,
        amount: parseFloat(amount) || 0,
        message,
        value: parseFloat(value) || 0,
        status: "pending" // Payment simulator
      }
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
