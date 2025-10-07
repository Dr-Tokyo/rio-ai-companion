import { useState, useEffect } from "react";

export function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkIsIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      const isIOSSafari = /safari/.test(userAgent) && /version/.test(userAgent);
      
      // Check for iOS 13+ on iPad which reports as desktop
      const isMacLike = /(macintosh|macintel|macppc|mac68k|macos)/i.test(userAgent);
      const isTouch = navigator.maxTouchPoints > 1;
      
      setIsIOS(isIOSDevice || (isMacLike && isTouch) || isIOSSafari);
    };
    
    checkIsIOS();
  }, []);

  return isIOS;
}
