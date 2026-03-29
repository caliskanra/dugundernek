import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCheckoutForm } from "@/lib/iyzico";
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

    if (!projectId || !senderNameRaw || !type || !value) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const senderName = cleanProfanity(senderNameRaw);
    const message = messageRaw ? cleanProfanity(messageRaw) : null;
    const finalValue = parseFloat(value);

    // 1. Veritabanında bekleyen (pending) gift oluştur
    const gift = await prisma.gift.create({
      data: {
        projectId,
        senderName,
        type,
        subtype,
        quantity: parseInt(quantity) || 1,
        currency,
        amount: parseFloat(amount) || 0,
        message,
        value: finalValue,
        status: "pending"
      }
    });

    // 2. Iyzico isteğini hazırla
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;

    const request = {
      locale: 'tr',
      conversationId: gift.id,
      price: finalValue.toFixed(2),
      paidPrice: finalValue.toFixed(2),
      currency: 'TRY',
      basketId: gift.id,
      paymentGroup: 'PRODUCT',
      callbackUrl: `${baseUrl}/api/gifts/callback`,
      enabledInstallments: [1],
      buyer: {
        id: 'GUEST',
        name: senderName.split(' ')[0] || 'Misafir',
        surname: senderName.split(' ').slice(1).join(' ') || 'GUEST',
        gsmNumber: '+905555555555',
        email: 'guest@dugundernek.com',
        identityNumber: '11111111111',
        lastLoginDate: '2023-01-01 00:00:00',
        registrationDate: '2023-01-01 00:00:00',
        registrationAddress: 'Dugundernek Guest Address',
        ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34000'
      },
      shippingAddress: {
        contactName: senderName,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Dugundernek Guest Address',
        zipCode: '34000'
      },
      billingAddress: {
        contactName: senderName,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Dugundernek Guest Address',
        zipCode: '34000'
      },
      basketItems: [
        {
          id: 'GIFT',
          name: `${type} Hediyesi`,
          category1: 'GIFT',
          itemType: 'VIRTUAL',
          price: finalValue.toFixed(2)
        }
      ]
    };

    // 3. Iyzico Checkout Formunu başlat
    const result = await createCheckoutForm(request);

    if (result.status === 'success') {
      // 4. Token'ı kaydet
      await prisma.gift.update({
        where: { id: gift.id },
        data: { paymentToken: result.token }
      });

      return NextResponse.json({ 
        success: true, 
        token: result.token, 
        checkoutFormContent: result.checkoutFormContent 
      });
    } else {
      console.error("Iyzico Fail:", result.errorMessage);
      return NextResponse.json({ error: result.errorMessage }, { status: 400 });
    }
  } catch (err) {
    console.error("Gifts Pay Error:", err);
    return NextResponse.json({ error: "Ödeme başlatılamadı" }, { status: 500 });
  }
}
