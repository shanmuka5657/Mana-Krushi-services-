
"use client";

import { useEffect, useState } from 'react';
import { onAdsEnabledChange, getSetting } from '@/lib/storage';

const AdScriptLoader = () => {
  const [areAdsEnabled, setAreAdsEnabled] = useState(false);

  useEffect(() => {
    const checkInitialStateAndSubscribe = async () => {
      // 1. Fetch the initial state when the component mounts
      const initialState = await getSetting('areAdsEnabled');
      setAreAdsEnabled(initialState || false);

      // 2. Subscribe to subsequent changes
      const unsubscribe = onAdsEnabledChange(setAreAdsEnabled);
      return unsubscribe;
    };

    const unsubscribePromise = checkInitialStateAndSubscribe();

    // Cleanup function
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, []);

  useEffect(() => {
    const scriptId = 'monetag-ad-script';
    
    // Find any existing script
    const existingScript = document.getElementById(scriptId);

    if (areAdsEnabled) {
      // If ads are enabled and the script doesn't exist, create and add it.
      if (!existingScript) {
        const s = document.createElement('script');
        s.id = scriptId;
        s.async = true;
        s.innerHTML = `(function(s){s.dataset.zone='9915521',s.src='https://al5sm.com/tag.min.js'})(document.body.appendChild(document.createElement('script')))`;
        document.body.appendChild(s);
      }
    } else {
      // If ads are disabled and the script exists, remove it.
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    }
    
    // The cleanup function for this effect will run if the component unmounts
    // while ads are enabled, ensuring the script is removed.
    return () => {
      // Check if ads were enabled to decide if cleanup is needed.
      // This avoids trying to remove a script that wasn't there.
      if (areAdsEnabled) {
         const scriptToRemove = document.getElementById(scriptId);
         if (scriptToRemove && scriptToRemove.parentNode === document.body) {
             document.body.removeChild(scriptToRemove);
         }
      }
    };

  }, [areAdsEnabled]);

  return null; // This component does not render anything itself.
};

export default AdScriptLoader;
