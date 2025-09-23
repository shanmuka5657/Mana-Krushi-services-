
"use client";

import { useEffect, useState } from 'react';
import { onAdsEnabledChange, getSetting } from '@/lib/storage';

const AdScriptLoader = () => {
  const [areAdsEnabled, setAreAdsEnabled] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    const scriptConfigs = [
      {
        id: 'monetag-ad-script-1',
        innerHTML: `(function(s){s.dataset.zone='9915521',s.src='https://al5sm.com/tag.min.js'})(document.body.appendChild(document.createElement('script')))`
      },
      {
        id: 'monetag-ad-script-2',
        innerHTML: `(function(s){s.dataset.zone='9918780',s.src='https://groleegni.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
      }
    ];

    if (areAdsEnabled) {
      scriptConfigs.forEach(config => {
        if (!document.getElementById(config.id)) {
          const s = document.createElement('script');
          s.id = config.id;
          s.async = true;
          s.innerHTML = config.innerHTML;
          document.body.appendChild(s);
        }
      });
    } else {
      scriptConfigs.forEach(config => {
        const script = document.getElementById(config.id);
        if (script) {
          document.body.removeChild(script);
        }
      });
    }

    return () => {
      if (areAdsEnabled) {
        scriptConfigs.forEach(config => {
          const script = document.getElementById(config.id);
          if (script && script.parentNode === document.body) {
            document.body.removeChild(script);
          }
        });
      }
    };
  }, [areAdsEnabled]);

  return null;
};

export default AdScriptLoader;
