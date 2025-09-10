export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              var cId = '245924';
              (function(d, t) {
                var s = d.createElement('script');
                s.type = 'text/javascript';
                s.async = true;
                s.src = (d.location.protocol == 'https:' ? 'https://cdn0.cuelinks.com/js/' : 'http://cdn0.cuelinks.com/js/')  + 'cuelinksv2.js';
                d.getElementsByTagName('body')[0].appendChild(s);
              }());
            `,
          }}
        />
      </body>
    </html>
  );
}