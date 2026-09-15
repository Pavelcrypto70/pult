import type { Metadata } from "next";
import { Geologica, Onest } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const onest = Onest({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const geologica = Geologica({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Пульт — операционка салона дверей",
  description:
    "Сделки, витрина, замеры, конфигуратор и монтаж для магазина дверей. Без комбайна и конструктора компаний.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${onest.variable} ${geologica.variable} h-full antialiased`}
    >
      <body className="min-h-full font-[family-name:var(--font-body)] text-[var(--pult-ink)]">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
