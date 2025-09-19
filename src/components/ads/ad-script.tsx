
"use client";

import React, { useEffect } from 'react';

const AdScript: React.FC = () => {
  useEffect(() => {
    const scriptContent = `
      (function(s){
        s.dataset.zone='9892058';
        s.src='https://al5sm.com/tag.min.js';
      })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')));
    `;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = scriptContent;
    script.async = true;

    const adContainer = document.getElementById('ad-container');
    if (adContainer) {
      adContainer.appendChild(script);
    }

    return () => {
      // Cleanup the script when the component is unmounted
      if (adContainer && adContainer.contains(script)) {
        adContainer.removeChild(script);
      }
    };
  }, []);

  return <div id="ad-container" />;
};

export default AdScript;
