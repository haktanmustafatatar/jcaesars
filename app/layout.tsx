import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "J.Caesar Agent - AI Chatbots for Modern Businesses",
  description:
    "Build AI chatbots trained on your website content, documents, and knowledge base. Deploy in minutes, scale forever.",
  keywords: [
    "AI chatbot",
    "customer support",
    "chatbot builder",
    "AI assistant",
    "business automation",
  ],
  authors: [{ name: "J.Caesar Agent" }],
  openGraph: {
    title: "J.Caesar Agent - AI Chatbots for Modern Businesses",
    description:
      "Build AI chatbots trained on your website content, documents, and knowledge base.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#e25b31",
          colorBackground: "#ffffff",
          colorText: "#000000",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${fraunces.variable} font-sans antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="bottom-right" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
