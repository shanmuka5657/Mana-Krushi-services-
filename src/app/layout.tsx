import './globals.css';
import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cuelinksScript = `
    var cId =  "245979";
    (function(d, t) {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = (document.location.protocol == "https:" ? "https://cdn0.cuelinks.com/js/" : "http://cdn0.cuelinks.com/js/")  + "cuelinksv2.js";
      document.getElementsByTagName("body")[0].appendChild(s);
    }());
  `;

  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4057664444308456"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body>
        {children}
        <script type="text/javascript" dangerouslySetInnerHTML={{ __html: cuelinksScript }} />
        <script type='text/javascript' src='//exportseats.com/18/6e/e8/186ee8d3ed422373beaa184909e3545c.js'></script>
        <script type='text/javascript' src='//exportseats.com/8d/62/5f/8d625f6c0ee1cd63f181069e4d8bab94.js'></script>
      </body>
    </html>
  );
}
