/**
 * Haversine formula calculates distance between two pairs of coordinates in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

export const checkImpossibleTravel = (lastLog, currentLoc) => {
    if (!lastLog || !lastLog.payload?.latitude || !currentLoc.latitude) return null;

    const lastLoc = lastLog.payload;
    const distanceKm = calculateDistance(lastLoc.latitude, lastLoc.longitude, currentLoc.latitude, currentLoc.longitude);
    
    const timeDiffHrs = Math.abs(new Date() - new Date(lastLog.created_at)) / (1000 * 60 * 60);

    if (timeDiffHrs === 0) return null;

    const requiredSpeedKmh = distanceKm / timeDiffHrs;
    const commercialFlightSpeedKmh = 900; // Human threshold limit

    if (requiredSpeedKmh > commercialFlightSpeedKmh && distanceKm > 50) {
        return {
            distanceKm: Math.round(distanceKm),
            timeDiffHrs: parseFloat(timeDiffHrs.toFixed(2)),
            requiredSpeedKmh: Math.round(requiredSpeedKmh)
        };
    }
    return null;
};