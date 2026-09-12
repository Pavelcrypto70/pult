import type { Metadata } from "next";
import { Onest, Unbounded } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const onest = Onest({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const unbounded = Unbounded({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Пульт — CRM и задачи без боли Битрикса",
  description:
    "Упрощённый аналог Битрикса для студий и малого бизнеса: клиенты, воронка, задачи и современная админка.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${onest.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="min-h-full font-[family-name:var(--font-body)] text-[var(--pult-ink)]">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
