import Iyzipay from 'iyzipay';

/**
 * iyzico Client'ını ihtiyaç duyulduğunda (lazy) başlatan fonksiyondur.
 * Bu sayede Next.js derleme (build) sırasında API anahtarları eksik olsa bile hata vermez.
 */
const getIyzipay = () => {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const uri = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

  if (!apiKey || !secretKey) {
    console.warn("⚠️ IYZICO_API_KEY veya IYZICO_SECRET_KEY eksik. Ödeme işlemleri çalışmayacaktır.");
    // Derleme (build) sırasında hata vermemesi için boş bir obje dönebiliriz 
    // veya hata yönetimini çağrıldığı yerde yapabiliriz.
  }

  return new Iyzipay({
    apiKey: apiKey || 'dummy-key',
    secretKey: secretKey || 'dummy-secret',
    uri
  });
};

/**
 * iyzico Checkout Form başlatma (Initialize)
 */
export const createCheckoutForm = (data) => {
  const iyzipay = getIyzipay();
  return new Promise((resolve, reject) => {
    iyzipay.checkoutFormInitialize.create(data, (err, result) => {
      if (err) {
        console.error("Iyzico Create Error:", err);
        return reject(err);
      }
      resolve(result);
    });
  });
};

/**
 * Ödeme sonucunu doğrulama (Retrieve)
 */
export const getPaymentResult = (data) => {
  const iyzipay = getIyzipay();
  return new Promise((resolve, reject) => {
    iyzipay.checkoutForm.retrieve(data, (err, result) => {
      if (err) {
        console.error("Iyzico Retrieve Error:", err);
        return reject(err);
      }
      resolve(result);
    });
  });
};

export default getIyzipay;
