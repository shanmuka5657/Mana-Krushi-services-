
"use client";

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { onAdsEnabledChange, getSetting } from '@/lib/storage';

const AdScriptLoader = () => {
  const [areAdsEnabled, setAreAdsEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkInitialStateAndSubscribe = async () => {
      const initialState = await getSetting('areAdsEnabled');
      setAreAdsEnabled(initialState || false);

      const unsubscribe = onAdsEnabledChange(setAreAdsEnabled);
      return unsubscribe;
    };

    const unsubscribePromise = checkInitialStateAndSubscribe();

    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, []);

  if (!isMounted || !areAdsEnabled) {
    return null;
  }

  return (
    <>
      <Script
        id="monetag-ad-script-1"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='9915521',s.src='https://al5sm.com/tag.min.js'})(document.body.appendChild(document.createElement('script')))`
        }}
      />
      <Script
        id="monetag-ad-script-2"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='9918780',s.src='https://groleegni.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
        }}
      />
    </>
  );
};

export default AdScriptLoader;
