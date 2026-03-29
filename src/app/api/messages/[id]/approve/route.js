import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.redirect(new URL('/', req.url));

  try {
    const message = await prisma.guestMessage.findUnique({
      where: { id: params.id },
      include: { project: true }
    });

    if (!message || message.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.guestMessage.update({
      where: { id: params.id },
      data: { status: "approved" }
    });

    revalidatePath(`/dashboard/project/${message.projectId}`);
    return NextResponse.redirect(new URL(`/dashboard/project/${message.projectId}`, req.url));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
