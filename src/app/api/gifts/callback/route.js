import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentResult } from "@/lib/iyzico";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const token = formData.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 1. Iyzico'dan sonucu doğrula
    const result = await getPaymentResult({
      locale: 'tr',
      token: token
    });

    // 2. İlgili hediyeyi bul
    const gift = await prisma.gift.findUnique({
      where: { paymentToken: token },
      include: { project: true }
    });

    if (!gift) {
      console.error("Callback: Hediyye bulunamadı. Token:", token);
      return NextResponse.redirect(new URL("/", req.url));
    }

    const redirectUrl = new URL(`/${gift.project.slug}`, req.url);

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      // 3. Ödeme BAŞARILI
      await prisma.gift.update({
        where: { id: gift.id },
        data: { 
          status: "paid",
          paymentId: result.paymentId 
        }
      });
      
      redirectUrl.searchParams.set("payment", "success");
      return NextResponse.redirect(redirectUrl);
    } else {
      // 4. Ödeme BAŞARISIZ
      await prisma.gift.update({
        where: { id: gift.id },
        data: { status: "failed" }
      });

      redirectUrl.searchParams.set("payment", "failed");
      if (result.errorMessage) {
          redirectUrl.searchParams.set("error", result.errorMessage);
      }
      return NextResponse.redirect(redirectUrl);
    }
  } catch (err) {
    console.error("Iyzico Callback Error:", err);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
