import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Düğün Dernek | Dijital Anı Defteri",
  description: "Düğününüz için dijital, modern bir anı defteri ve misafir karşılama ekranı.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <Providers>
          <div className="app-container">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
