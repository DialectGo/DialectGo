import axios from 'axios';

export const geoLookup = async (ip) => {
  try {
    let targetIp = ip;

    // Clean up IPv6 loopback or IPv4-mapped IPv6 loopback strings
    if (
      !targetIp || 
      targetIp === '127.0.0.1' || 
      targetIp === '::1' || 
      targetIp.includes('127.0.0.1') || 
      targetIp.includes('::ffff:')
    ) {
      // FOR LOCAL TESTING ONLY: Replace with your active Windscribe IP
      targetIp = ''; 
    }

    const { data } = await axios.get(`http://ip-api.com/json/${targetIp}`);

    return {
      country: data.countryCode || 'UNKNOWN',
      city: data.city || 'UNKNOWN',
      lat: data.lat || 0,
      lon: data.lon || 0,
      isp: data.isp || 'UNKNOWN',
      ip: targetIp // Return the resolved IP back to your application!
    };
  } catch {
    return {
      country: 'UNKNOWN',
      city: 'UNKNOWN',
      lat: 0,
      lon: 0,
      isp: 'UNKNOWN',
      ip: ip
    };
  }
};