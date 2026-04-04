import { prisma } from "./prisma";
import { hasProfanity } from "./filter";

/**
 * 5651 Sayılı Kanun Uyumlu Yasal Log Kaydı
 * 
 * Her yorum, takı, giriş işlemi için:
 * - IP Adresi
 * - User-Agent (terminal/tarayıcı bilgisi)
 * - Kullanıcı kimliği (Google Auth)
 * - Orijinal içerik
 * - Zaman damgası
 */
export async function createLegalLog({
  action,        // POST_MESSAGE | POST_GIFT | LOGIN
  userId,
  userName,
  userEmail,
  ipAddress,
  userAgent,
  projectId,
  originalContent,
  filteredContent,
  resourceId,
  resourceType,
  metadata,
}) {
  try {
    await prisma.legalLog.create({
      data: {
        action,
        userId: userId || null,
        userName: userName || null,
        userEmail: userEmail || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        projectId: projectId || null,
        originalContent: originalContent || null,
        filteredContent: filteredContent || null,
        hadProfanity: originalContent ? hasProfanity(originalContent) : false,
        resourceId: resourceId || null,
        resourceType: resourceType || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      }
    });
  } catch (err) {
    console.error("[5651] Legal log yazılamadı:", err);
  }
}

/**
 * Request'ten IP ve User-Agent bilgilerini çıkar
 */
export function extractRequestInfo(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}
