import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/lib/i18n";
import Chrome from "@/components/Chrome";

export const metadata: Metadata = {
  title: "HerCare+ — Your Health. Your Safety. Your Care.",
  description:
    "Multilingual women's healthcare, safety and wellness companion for India — find verified doctors, track your health, and stay safe in your own language.",
};

export const viewport: Viewport = {
  themeColor: "#d05a78",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppProviders>
          <Chrome>{children}</Chrome>
        </AppProviders>
      </body>
    </html>
  );
}
