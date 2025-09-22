"use client";

import { useEffect } from 'react';

const AdScriptLoader = () => {
  useEffect(() => {
    // This code will only run on the client side, after hydration is complete.
    const s = document.createElement('script');
    s.async = true;
    s.innerHTML = `(function(s){s.dataset.zone='9915521',s.src='https://al5sm.com/tag.min.js'})(document.body.appendChild(document.createElement('script')))`;
    document.body.appendChild(s);

    // Cleanup the script when the component unmounts
    return () => {
      if (document.body.contains(s)) {
        document.body.removeChild(s);
      }
    };
  }, []); // The empty dependency array ensures this runs only once per page load.

  return null; // This component does not render anything itself.
};

export default AdScriptLoader;
