import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
export const metadata = { title: { default: "Bons médicaux · Grand Tambour", template: "%s · Grand Tambour" }, description: "Espace d'assistance médicale du CCAPAC, Centre Culturel Grand Tambour à Kinshasa." };
export default function RootLayout({ children }) {
  return <html lang="fr" className={jakarta.variable}><body><a className="skip-link" href="#contenu">Aller au contenu</a>{children}</body></html>;
}