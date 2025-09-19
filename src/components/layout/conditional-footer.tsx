'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const [showFooter, setShowFooter] = React.useState(false);

  React.useEffect(() => {
    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isBookingPage = pathname.startsWith('/book/');
    setShowFooter(!isAuthPage && !isBookingPage);
  }, [pathname]);

  if (!showFooter) {
    return null;
  }

  return (
    <footer className="h-32 flex-shrink-0 border-t bg-background">
      {/* Video players removed */}
    </footer>
  );
}
