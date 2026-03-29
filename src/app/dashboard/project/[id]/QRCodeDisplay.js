"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";

export default function QRCodeDisplay({ url, project }) {
  const canvasRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#333333",
          light: "#ffffff"
        }
      });
      
      QRCode.toDataURL(url, { width: 500, margin: 2 }).then(setQrDataUrl);
    }
  }, [url]);

  const downloadPDF = () => {
    if (!qrDataUrl) return;
    
    // Create new A4 PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Add Title
    pdf.setFontSize(22);
    pdf.setTextColor(50, 50, 50);
    pdf.text(`${project.brideName} & ${project.groomName}`, 105, 30, { align: 'center' });
    
    // Add Subtitle
    pdf.setFontSize(14);
    pdf.text("Dijital Anı Defterimize Hoş Geldiniz", 105, 40, { align: 'center' });
    pdf.text("Mesaj bırakmak veya fotoğraf yüklemek için kodu okutun", 105, 48, { align: 'center' });

    // Add QR Image
    pdf.addImage(qrDataUrl, 'PNG', 55, 60, 100, 100);

    // Save
    pdf.save(`${project.slug}-karekod.pdf`);
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '15px', textAlign: 'center', position: 'sticky', top: '20px' }}>
      <h3 style={{ marginBottom: '15px', color: 'var(--text-light)' }}>Misafirler İçin Karekod</h3>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <canvas ref={canvasRef}></canvas>
      </div>

      <button onClick={downloadPDF} className="btn-primary" style={{ width: '100%' }}>
        PDF Olarak İndir
      </button>
      
      <p style={{ marginTop: '15px', fontSize: '0.85rem', opacity: 0.7 }}>
        Bu karekodu masalara yerleştirerek davetlilerinizin mesaj bırakmasını sağlayabilirsiniz.
      </p>
    </div>
  );
}
