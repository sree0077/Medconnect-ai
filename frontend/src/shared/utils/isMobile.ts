/**
 * Utility function to detect mobile devices
 * @returns {boolean} True if the device is mobile, false otherwise
 */
export const isMobileDevice = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Check user agent for mobile indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android',
    'webos',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'mobile',
    'tablet'
  ];

  const isMobileUserAgent = mobileKeywords.some(keyword => 
    userAgent.includes(keyword)
  );

  // Check screen size (mobile-like dimensions)
  const isMobileScreen = window.innerWidth <= 768 || window.innerHeight <= 768;

  // Check for touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Return true if any mobile indicator is present
  return isMobileUserAgent || (isMobileScreen && isTouchDevice);
};

export default isMobileDevice;
