
"use client";

import { useEffect, useState } from 'react';
import { onAdsEnabledChange } from '@/lib/storage';

const AdScriptLoader = () => {
  const [areAdsEnabled, setAreAdsEnabled] = useState(false);

  useEffect(() => {
    // Subscribe to changes in the ad setting from storage
    const unsubscribe = onAdsEnabledChange(setAreAdsEnabled);
    return () => unsubscribe();
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
      if (areAdsEnabled) {
         const scriptToRemove = document.getElementById(scriptId);
         if (scriptToRemove) {
             document.body.removeChild(scriptToRemove);
         }
      }
    };

  }, [areAdsEnabled]);

  return null; // This component does not render anything itself.
};

export default AdScriptLoader;
