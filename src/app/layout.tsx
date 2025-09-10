import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Mana Krushi Services",
  description: "Travel Agent Management System",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        {/* Favicon (Browser Tab Icon) */}
        <link rel="icon" href="https://i.ibb.co/LdbdX3Dp/file-00000000dad0622f92ca201d38c47e43.png" type="image/png" />
      </head>
      <body>
        {children}
        <Toaster />
        <Script type="text/javascript" id="infolinks-config">
          {`var infolinks_pid = 3439958; var infolinks_wsid = 0;`}
        </Script>
        <Script type="text/javascript" src="//resources.infolinks.com/js/infolinks_main.js" strategy="afterInteractive"></Script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var cId = '245924';
              (function(d, t) {
                var s = d.createElement(t);
                s.type = 'text/javascript';
                s.async = true;
                s.src = (d.location.protocol == 'https:' ? 'https://cdn0.cuelinks.com/js/' : 'http://cdn0.cuelinks.com/js/') + 'cuelinksv2.js';
                d.getElementsByTagName('body')[0].appendChild(s);
              }());
            `,
          }}
        />
      </body>
    </html>
  );
}
