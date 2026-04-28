import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminIntegrationProvider } from "../src/features/admin/integration-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zac Admin",
  description: "Zac operations console",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AdminIntegrationProvider>{children}</AdminIntegrationProvider>
      </body>
    </html>
  );
}
