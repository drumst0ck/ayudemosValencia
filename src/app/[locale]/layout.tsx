import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { locales } from "@/i18n";

export const metadata: Metadata = {
  title: "Puntos de Donación DANA Valencia",
  description: "Mapa interactivo que muestra todos los puntos de recogida de donaciones para ayudar a las personas afectadas por la DANA en Valencia. Encuentra el punto más cercano y conoce qué tipo de donaciones aceptan.",
  keywords: "DANA Valencia, donaciones, ayuda humanitaria, puntos de recogida, Valencia, inundaciones",
  authors: [{ name: "Comunidad Valenciana Solidaria" }],
  openGraph: {
    title: "Puntos de Donación DANA Valencia",
    description: "Encuentra puntos de recogida de donaciones para ayudar a los afectados por la DANA en Valencia",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Puntos de Ayuda DANA Valencia",
    description: "Encuentra puntos de recogida de donaciones para ayudar a los afectados por la DANA en Valencia",
  },
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) notFound();

  return (
    <html lang={locale} className={`${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
} 