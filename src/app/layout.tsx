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

  const popunderScript = `
    // Popunder script
    (function() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//exportseats.com/8d/62/5f/8d625f6c0ee1cd63f181069e4d8bab94.js';
        document.head.appendChild(script);
    })();
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
        <script type="text/javascript" dangerouslySetInnerHTML={{ __html: popunderScript }} />
      </body>
    </html>
  );
}
