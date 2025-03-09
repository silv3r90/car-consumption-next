import { Inter } from "next/font/google";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import dynamic from "next/dynamic";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KFZ-Stromverbrauchs-Dashboard",
  description: "Visualisierung und Verwaltung des KFZ-Stromverbrauchs",
};

// Wenn in einer Client-Komponente auf die Session zugegriffen wird, muss auch die Anbieter-Komponente
// eine Client-Komponente sein. Mit dynamic wird verhindert, dass es zu Problemen beim Server-Rendering kommt.
const ClientAuthProvider = dynamic(
  () => import("@/components/auth-provider").then(mod => mod.AuthProvider),
  { ssr: false }
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </ClientAuthProvider>
      </body>
    </html>
  );
}