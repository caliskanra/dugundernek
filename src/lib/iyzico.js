import Iyzipay from 'iyzipay';

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
});

/**
 * iyzico Checkout Form başlatma (Initialize)
 */
export const createCheckoutForm = (data) => {
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

export default iyzipay;
