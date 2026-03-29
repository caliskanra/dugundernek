"use client";

import { useState } from "react";

const goldPrices = { "çeyrek": 1600, "yarım": 3200, "tam": 6400 };
const BRACELET_PRICE = 8500;
const CURRENCY_SYMBOLS = { TRY: "₺", USD: "$", EUR: "€" };

const TYPE_META = {
  gold:     { label: "Altın",   detail: "22 Ayar",  note: "Çeyrek · Yarım · Tam", badge: "G", bg: "#FAEEDA", text: "#633806" },
  bracelet: { label: "Bilezik", detail: "22 Ayar",  note: "8.500 ₺ / adet",       badge: "B", bg: "#FBEAF0", text: "#72243E" },
  money:    { label: "Para",    detail: "Nakit",    note: "TL / USD / EUR",        badge: "₺", bg: "#EAF3DE", text: "#3B6D11" },
  wish:     { label: "Mesaj",   detail: "Dilek",    note: "Ücretsiz",             badge: "M", bg: "#E6F1FB", text: "#185FA5" },
};

function TypeBadge({ type, size = 32 }) {
  const m = TYPE_META[type];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: m.bg, color: m.text, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.round(size * 0.4), fontWeight: 500,
    }}>{m.badge}</div>
  );
}

export default function GiftRegistry({ projectId }) {
  const [step, setStep] = useState(1);
  const [selType, setSelType] = useState(null);
  const [subtype, setSubtype] = useState("çeyrek");
  const [qty, setQty] = useState(1);
  const [currency, setCurrency] = useState("TRY");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [payMethod, setPayMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [checkoutForm, setCheckoutForm] = useState(null); // iyzico Script content

  function computeValue() {
    if (selType === "gold") return (goldPrices[subtype] || 0) * qty;
    if (selType === "money") return parseFloat(amount) || 0;
    if (selType === "bracelet") return BRACELET_PRICE * qty;
    return 0;
  }

  async function handleSend() {
    setProcessing(true);
    setError("");
    
    try {
      // Eğer ödeme yöntemi Kredi Kartı ise iyzico'yu başlat
      if (selType !== "wish" && payMethod === "card") {
        const res = await fetch("/api/gifts/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            senderName: name,
            type: selType,
            subtype,
            quantity: qty,
            currency,
            amount: parseFloat(amount) || 0,
            message: msg,
            value: computeValue(),
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ödeme başlatılamadı");

        // iyzico formunu ekrana ver
        setCheckoutForm(data.checkoutFormContent);
        return; // Redirect iyzico frame'i içinde olacak
      }

      // Diğer durumlar (Mesaj veya Havale - manuel onay gerektirir)
      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          senderName: name,
          type: selType,
          subtype,
          quantity: qty,
          currency,
          amount: parseFloat(amount) || 0,
          message: msg,
          value: computeValue(),
          status: payMethod === "transfer" ? "pending_transfer" : "pending"
        })
      });

      if (!res.ok) throw new Error("Gönderim sırasında hata oluştu");

      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  function resetForm() {
    setStep(1); setSelType(null); setSubtype("çeyrek"); setQty(1);
    setCurrency("TRY"); setAmount(""); setName(""); setMsg("");
    setProcessing(false); setError(""); setCheckoutForm(null);
  }

  const canStep2 = !!selType;
  const canStep3 = name.trim().length >= 2 && (selType === "wish" || computeValue() > 0);
  const canPay = selType === "wish"
    || payMethod === "transfer"
    || payMethod === "card";

  const dotStyle = (n) => ({
    height: 8,
    width: step === n ? 24 : 8,
    borderRadius: 4,
    background: step > n ? "#1D9E75" : step === n ? "var(--primary)" : "rgba(0,0,0,0.1)",
    transition: "all 0.3s",
  });

  const selCardStyle = (active) => ({
    background: active ? "rgba(212, 163, 115, 0.1)" : "rgba(255, 255, 255, 0.5)",
    border: active ? "2px solid var(--primary)" : "1px solid rgba(255, 255, 255, 0.7)",
    borderRadius: "16px",
    padding: "1rem",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  const pillStyle = (active) => ({
    padding: "6px 14px",
    borderRadius: "20px",
    border: active ? "1.5px solid var(--primary)" : "1px solid rgba(0,0,0,0.1)",
    background: active ? "var(--primary)" : "transparent",
    color: active ? "#fff" : "var(--text-dark)",
    cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400,
    transition: "all 0.15s",
  });

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      {step < 4 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: "1.5rem" }}>
          {[1, 2, 3].map(n => <div key={n} style={dotStyle(n)} />)}
        </div>
      )}

      {error && (
        <div style={{ background: '#ffcdd2', padding: '12px', borderRadius: '10px', color: '#b71c1c', marginBottom: '20px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* STEP 1: SELECT TYPE */}
      {step === 1 && (
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-light)' }}>Ne göndermek isterseniz?</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {Object.entries(TYPE_META).map(([type, meta]) => (
              <div key={type} style={selCardStyle(selType === type)} onClick={() => setSelType(type)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: meta.bg, color: meta.text,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 600,
                  }}>{meta.badge}</div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{meta.label}</p>
                    <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>{meta.detail}</p>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>{meta.note}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className={canStep2 ? "btn-primary" : "btn-secondary"}
              style={{ padding: '10px 24px', opacity: canStep2 ? 1 : 0.5, cursor: canStep2 ? 'pointer' : 'not-allowed' }}
              onClick={() => canStep2 && setStep(2)}
            >İlerle →</button>
          </div>
        </div>
      )}

      {/* STEP 2: DETAILS */}
      {step === 2 && (
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
             <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-light)' }}>Detaylar</h3>
             
             {selType === "gold" && (
                <div className="form-group">
                  <label>Altın Türü</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
                    {["çeyrek", "yarım", "tam"].map(st => (
                      <button key={st} style={pillStyle(subtype === st)} onClick={() => setSubtype(st)}>
                        {st.charAt(0).toUpperCase() + st.slice(1)} ({goldPrices[st].toLocaleString("tr-TR")} ₺)
                      </button>
                    ))}
                  </div>
                  <label>Adet</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                     <div style={{ display: "flex", alignItems: "center", gap: 10, background: 'rgba(255,255,255,0.3)', padding: '5px 15px', borderRadius: '30px' }}>
                        <button style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                        <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                        <button style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }} onClick={() => setQty(qty + 1)}>+</button>
                     </div>
                     <p style={{ marginLeft: "auto", fontWeight: 700, color: "var(--primary)", fontSize: '1.2rem' }}>
                        {computeValue().toLocaleString("tr-TR")} ₺
                     </p>
                  </div>
                </div>
             )}

             {selType === "bracelet" && (
                <div className="form-group">
                  <label>Bilezik Adeti (22 Ayar)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                     <div style={{ display: "flex", alignItems: "center", gap: 10, background: 'rgba(255,255,255,0.3)', padding: '5px 15px', borderRadius: '30px' }}>
                        <button style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                        <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                        <button style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }} onClick={() => setQty(qty + 1)}>+</button>
                     </div>
                     <p style={{ marginLeft: "auto", fontWeight: 700, color: "var(--primary)", fontSize: '1.2rem' }}>
                        {computeValue().toLocaleString("tr-TR")} ₺
                     </p>
                  </div>
                </div>
             )}

             {selType === "money" && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Tutar</label>
                    <input type="number" className="form-control" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label>Döviz</label>
                    <select className="form-control" value={currency} onChange={e => setCurrency(e.target.value)} style={{ cursor: 'pointer' }}>
                      <option value="TRY">₺ TRY</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                    </select>
                  </div>
                </div>
             )}

             <div className="form-group">
                <label>İsminiz *</label>
                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Adınız Soyadınız" />
             </div>

             <div className="form-group">
                <label>Mesajınız (Opsiyonel)</label>
                <textarea className="form-control" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Çiftimiz için güzel bir not bırakın..." style={{ minHeight: '80px' }} />
             </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="btn-secondary" style={{ padding: '10px 24px' }} onClick={() => setStep(1)}>← Geri</button>
            <button
              className={canStep3 ? "btn-primary" : "btn-secondary"}
              style={{ padding: '10px 24px', opacity: canStep3 ? 1 : 0.5 }}
              onClick={() => canStep3 && (selType === "wish" ? handleSend() : setStep(3))}
              disabled={processing}
            >
              {selType === "wish" ? (processing ? "Gönderiliyor..." : "Mesajı Gönder") : "Ödemeye Geç →"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PAYMENT */}
      {step === 3 && (
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-light)' }}>Ödeme Tamamlama</h3>
          
          <div style={{ background: 'rgba(0,0,0,0.05)', padding: '15px', borderRadius: '15px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selType === "money" ? `${amount} ${currency}` : `${qty} adet ${selType === "gold" ? subtype : "bilezik"}`}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>Gönderen: {name}</p>
               </div>
               <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)', fontSize: '1.3rem' }}>{computeValue().toLocaleString("tr-TR")} ₺</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
            <button style={{ ...pillStyle(payMethod === "card"), flex: 1 }} onClick={() => setPayMethod("card")}>Kredi Kartı</button>
            <button style={{ ...pillStyle(payMethod === "transfer"), flex: 1 }} onClick={() => setPayMethod("transfer")}>Havale/EFT</button>
          </div>

          {payMethod === "card" ? (
            <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '15px' }}>
               <p style={{ margin: 0, fontSize: '13px', opacity: 0.7 }}>Kredi kartı bilgileriniz iyzico güvenli ödeme altyapısı ile korunmaktadır.</p>
               {checkoutForm && (
                 <div style={{ marginTop: '20px' }}>
                    <div id="iyzipay-checkout-form" className="responsive" dangerouslySetInnerHTML={{ __html: checkoutForm }} />
                 </div>
               )}
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.4)', padding: '15px', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '13px', lineHeight: '1.6' }}>
               <p><strong>Ziraat Bankası</strong><br />
               IBAN: TR00 0000 0000 0000 0000 0000 00<br />
               Alıcı: Düğün Sahipleri<br />
               Açıklama: {name}</p>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="btn-secondary" style={{ padding: '10px 24px' }} onClick={() => setStep(2)}>← Geri</button>
            <button
              className={canPay ? "btn-primary" : "btn-secondary"}
              style={{ padding: '10px 24px', opacity: canPay ? 1 : 0.5 }}
              onClick={() => canPay && !processing && handleSend()}
              disabled={processing}
            >
              {processing ? "İşleniyor..." : "Takıyı Gönder"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 4 && (
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#dcedc8", color: "#33691e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 1.5rem" }}>✓</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-light)' }}>Teşekkürler!</h2>
          <p style={{ opacity: 0.8, marginBottom: '2rem' }}>Takınız ve güzel dilekleriniz başarıyla ulaştırıldı.</p>
          <button className="btn-primary" onClick={resetForm}>Yeni Bir Takı Gönder</button>
        </div>
      )}
    </div>
  );
}
