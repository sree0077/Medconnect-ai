const geoip = require('geoip-lite');

/**
 * Get location information from IP address
 * @param {string} ip - IP address to lookup
 * @param {string} userRole - User role (admin, doctor, patient)
 * @returns {string} - Formatted location string
 */
const getLocationFromIP = (ip, userRole = null) => {
  try {
    // For admin users, always show "Local Machine" regardless of IP
    if (userRole === 'admin') {
      return 'Local Machine';
    }

    // Clean up IPv6-mapped IPv4 addresses first
    let cleanIP = ip;
    if (ip && ip.startsWith('::ffff:')) {
      cleanIP = ip.substring(7);
    }

    // For non-admin users, show actual IP and location info
    if (!ip || ip === '127.0.0.1' || ip === 'localhost' || ip === '::1' || ip === '::ffff:127.0.0.1') {
      return `Localhost (${cleanIP || ip})`;
    }

    // Handle private network IPs - show actual IP
    if (cleanIP.startsWith('192.168.') || cleanIP.startsWith('10.') || cleanIP.startsWith('172.')) {
      return `Private Network (${cleanIP})`;
    }
    
    // Lookup geographic information
    const geo = geoip.lookup(cleanIP);

    if (geo) {
      // Format: City, Region, Country
      let location = '';

      if (geo.city) {
        location += geo.city;
      }

      if (geo.region && geo.region !== geo.city) {
        if (location) location += ', ';
        location += geo.region;
      }

      if (geo.country) {
        if (location) location += ', ';
        location += geo.country;
      }

      // Add IP address for non-admin users for better tracking
      if (location) {
        location += ` (${cleanIP})`;
      }

      return location || `Unknown Location (${cleanIP})`;
    }

    return `Unknown Location (${cleanIP})`;
  } catch (error) {
    console.error('Error getting location from IP:', error);
    return `Unknown (${ip})`;
  }
};

/**
 * Get detailed location information from IP address
 * @param {string} ip - IP address to lookup
 * @param {string} userRole - User role (admin, doctor, patient)
 * @returns {object} - Detailed location object
 */
const getDetailedLocationFromIP = (ip, userRole = null) => {
  try {
    // For admin users, always show "Local Machine" regardless of IP
    if (userRole === 'admin') {
      return {
        ip: ip,
        city: 'Local',
        region: 'Machine',
        country: 'Local',
        timezone: 'Local',
        coordinates: null,
        formatted: 'Local Machine'
      };
    }

    // Clean up IPv6-mapped IPv4 addresses first
    let cleanIP = ip;
    if (ip && ip.startsWith('::ffff:')) {
      cleanIP = ip.substring(7);
    }

    // Handle localhost and private IPs for non-admin users - show actual IP
    if (!ip || ip === '127.0.0.1' || ip === 'localhost' || ip === '::1' || ip === '::ffff:127.0.0.1') {
      return {
        ip: cleanIP || ip,
        city: 'Localhost',
        region: 'Local',
        country: 'Local',
        timezone: 'Local',
        coordinates: null,
        formatted: `Localhost (${cleanIP || ip})`
      };
    }
    
    // Handle private network IPs - show actual IP
    if (cleanIP.startsWith('192.168.') || cleanIP.startsWith('10.') || cleanIP.startsWith('172.')) {
      return {
        ip: cleanIP,
        city: 'Private',
        region: 'Network',
        country: 'Internal',
        timezone: 'Local',
        coordinates: null,
        formatted: `Private Network (${cleanIP})`
      };
    }

    // Lookup geographic information
    const geo = geoip.lookup(cleanIP);

    if (geo) {
      const formatted = getLocationFromIP(ip, userRole);

      return {
        ip: cleanIP,
        city: geo.city || 'Unknown',
        region: geo.region || 'Unknown',
        country: geo.country || 'Unknown',
        timezone: geo.timezone || 'Unknown',
        coordinates: geo.ll ? { lat: geo.ll[0], lon: geo.ll[1] } : null,
        formatted: formatted
      };
    }

    return {
      ip: cleanIP,
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown',
      timezone: 'Unknown',
      coordinates: null,
      formatted: `Unknown Location (${cleanIP})`
    };
  } catch (error) {
    console.error('Error getting detailed location from IP:', error);
    return {
      ip: ip,
      city: 'Error',
      region: 'Error',
      country: 'Error',
      timezone: 'Error',
      coordinates: null,
      formatted: `Error (${ip})`
    };
  }
};

/**
 * Extract real IP address from request
 * @param {object} req - Express request object
 * @returns {string} - Real IP address
 */
const getRealIP = (req) => {
  // Check various headers for the real IP
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = req.headers['cf-connecting-ip'];
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to connection remote address
  return req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.ip || 
         '127.0.0.1';
};

module.exports = {
  getLocationFromIP,
  getDetailedLocationFromIP,
  getRealIP
};
