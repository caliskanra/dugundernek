import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendNotificationEmail = async (projectData, guestName, message) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("E-posta ayarları (EMAIL_USER, EMAIL_PASS) bulunamadı. Bildirim gönderilmedi.");
    return;
  }

  // Get project owner's email from the included user relation
  const ownerEmail = projectData.user?.email;
  if (!ownerEmail) {
    console.warn("Proje sahibinin e-posta adresi bulunamadı.");
    return;
  }

  const mailOptions = {
    from: `"Düğün Dernek" <${process.env.EMAIL_USER}>`,
    to: ownerEmail,
    subject: `Yeni Anı/Mesaj: ${projectData.brideName} & ${projectData.groomName} Düğünü`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #d4a373;">Yeni Bir Anı Bırakıldı!</h2>
        <p>Merhaba, <strong>${projectData.brideName} & ${projectData.groomName}</strong> düğün sayfanıza yeni bir misafir mesaj bıraktı.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #606c38; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Misafir:</strong> ${guestName}</p>
          <p style="margin: 0; font-style: italic; color: #555;">"${message}"</p>
        </div>

        <p>Bu mesaj şu an <strong>Onay Bekliyor</strong> durumundadır. Yayınlanması için panele gidip onaylamanız gerekmektedir.</p>
        
        <a href="${process.env.NEXTAUTH_URL}/dashboard/project/${projectData.id}" 
           style="display: inline-block; background-color: #d4a373; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
           Panele Git ve Onayla
        </a>

        <p style="margin-top: 30px; font-size: 12px; color: #999;">Düğün Dernek SaaS Platformu</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email başarıyla gönderildi:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email gönderme hatası:", error);
    return false;
  }
};
