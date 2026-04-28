import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IntegrationProvider } from "../src/features/home/integration-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zac",
  description: "Climb Life OS",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <IntegrationProvider>{children}</IntegrationProvider>
      </body>
    </html>
  );
}
