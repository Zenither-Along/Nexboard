"use client"

import { useState, useEffect } from 'react';

/**
 * Hook to detect if user is on a small mobile device (phone)
 * Tablets and large screens are allowed through
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Only block small phones (< 640px)
      // Tablets (768px+) and large phones in landscape are allowed
      const isSmallScreen = window.innerWidth < 640;
      
      // Check user agent for small mobile devices only
      const userAgent = navigator.userAgent.toLowerCase();
      const isPhone = (
        (userAgent.includes('iphone') || 
         userAgent.includes('android') && userAgent.includes('mobile') ||
         userAgent.includes('windows phone')) &&
        window.innerWidth < 640
      );
      
      // Block only if it's a small screen AND a phone
      setIsMobile(isSmallScreen && isPhone);
    };

    checkMobile();
    
    // Re-check on resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/**
 * Hook to detect if device has touch capability
 */
export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch(hasTouch);
  }, []);

  return isTouch;
}
