import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cuelinksScript = `
    var cId = '245924';
    var cuelinksRun = [];
    window.runCuelinks = function() {
      if (typeof window.cuelinks?.js?.run === 'function') {
        window.cuelinks.js.run();
      } else {
        cuelinksRun.push(1);
      }
    };
    (function(d, t) {
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = (document.location.protocol == 'https:' ? 'https://cdn0.cuelinks.com/js/' : 'http://cdn0.cuelinks.com/js/')  + 'cuelinksv2.js';
      s.onload = function() {
        if (cuelinksRun.length > 0) {
           if (typeof window.cuelinks?.js?.run === 'function') {
             window.cuelinks.js.run();
           }
        }
      };
      document.getElementsByTagName('body')[0].appendChild(s);
    }());
  `;

  return (
    <html lang="en">
      <head />
      <body>
        {children}
        <script type="text/javascript" dangerouslySetInnerHTML={{ __html: cuelinksScript }} />
      </body>
    </html>
  );
}
