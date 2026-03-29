import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const project = await prisma.weddingProject.findUnique({
      where: { id: params.id, userId: session.user.id }
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    await prisma.weddingProject.update({
      where: { id: params.id },
      data: { isGiftEnabled: !project.isGiftEnabled }
    });

    // In a real app with forms, you might redirect back to the page.
    // For Next.js Server Actions or simple forms, a redirect is common.
    return NextResponse.redirect(new URL(`/dashboard/project/${params.id}`, req.url), 303);
  } catch (err) {
    console.error("Toggle Gift Error:", err);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
