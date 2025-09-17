
'use client';

import { useEffect } from 'react';

const VignetteAd = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.dataset.cfasync = 'false';
    script.type = 'text/javascript';
    
    const scriptContent = `
      (function(s){
        s.dataset.zone='9892027';
        s.src='https://groleegni.net/vignette.min.js';
      })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
    `;
    
    script.appendChild(document.createTextNode(scriptContent));
    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return null; // This component doesn't render anything itself
};

export default VignetteAd;
