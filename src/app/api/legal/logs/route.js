import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 5651 Sayılı Kanun — Yasal Otorite Log Sorgulama
 * 
 * GET /api/legal/logs?userId=X&from=2024-01-01&to=2024-12-31
 * Header: x-legal-secret: <LEGAL_API_SECRET>
 */
export async function GET(req) {
  const secret = req.headers.get("x-legal-secret");
  const expectedSecret = process.env.LEGAL_API_SECRET || "dugundernek-legal-2024";

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const userEmail = searchParams.get("email");
  const projectId = searchParams.get("projectId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where = {};
  if (userId) where.userId = userId;
  if (userEmail) where.userEmail = userEmail;
  if (projectId) where.projectId = projectId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  try {
    const logs = await prisma.legalLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json({
      count: logs.length,
      law: "5651",
      logs,
    });
  } catch (err) {
    console.error("[5651] Log sorgulama hatası:", err);
    return NextResponse.json({ error: "Log sorgulanamadı" }, { status: 500 });
  }
}
