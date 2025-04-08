
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner"
import './globals.css'


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
      <body>
        {children}
        <Toaster />
      </body>
      </AuthProvider>
    </html>
  );
}
