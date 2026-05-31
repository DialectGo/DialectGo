/**
 * Haversine formula calculates distance between two coordinates in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371; // Earth radius in KM

    const dLat =
        (lat2 - lat1) * Math.PI / 180;

    const dLon =
        (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}

export const checkImpossibleTravel = (
    lastLog,
    currentLoc
) => {

    /**
     * VALIDATION GUARD
     */
    if (
        !lastLog ||
        !lastLog.payload ||
        !lastLog.payload.latitude ||
        !lastLog.payload.longitude ||
        !currentLoc.latitude ||
        !currentLoc.longitude
    ) {
        return null;
    }

    const lastLoc = lastLog.payload;

    /**
     * CALCULATE DISTANCE
     */
    const distanceKm = calculateDistance(
        lastLoc.latitude,
        lastLoc.longitude,
        currentLoc.latitude,
        currentLoc.longitude
    );

    /**
     * CALCULATE TIME DIFFERENCE
     */
    const timeDiffHrs =
        Math.abs(
            new Date() - new Date(lastLog.created_at)
        ) / (1000 * 60 * 60);

    if (timeDiffHrs <= 0) {
        return null;
    }

    /**
     * REQUIRED TRAVEL SPEED
     */
    const requiredSpeedKmh =
        distanceKm / timeDiffHrs;

    /**
     * HUMAN REALISTIC THRESHOLD
     */
    const commercialFlightSpeedKmh = 750;

    /**
     * COUNTRY CHANGE DETECTION
     */
    const countryChanged =
        lastLoc.country &&
        currentLoc.country &&
        lastLoc.country !== currentLoc.country;

    /**
     * ISP / ASN CHANGE DETECTION
     */
    const ispChanged =
        lastLoc.isp &&
        currentLoc.isp &&
        lastLoc.isp !== currentLoc.isp;

    /**
     * VPN / TOR / PROXY DETECTION
     */
    const suspiciousVpn =

        currentLoc.isp?.toLowerCase().includes('vpn') ||

        currentLoc.isp?.toLowerCase().includes('proxy') ||

        currentLoc.isp?.toLowerCase().includes('hosting') ||

        currentLoc.isp?.toLowerCase().includes('tor') ||

        currentLoc.isp?.toLowerCase().includes('datacenter');

    /**
     * FINAL DECISION ENGINE
     */
    const isImpossibleTravel =

        requiredSpeedKmh > commercialFlightSpeedKmh &&

        distanceKm > 50 &&

        (
            countryChanged ||
            ispChanged ||
            suspiciousVpn
        );

    if (isImpossibleTravel) {

        return {

            detected: true,

            distanceKm:
                Math.round(distanceKm),

            timeDiffHrs:
                parseFloat(
                    timeDiffHrs.toFixed(2)
                ),

            requiredSpeedKmh:
                Math.round(requiredSpeedKmh),

            indicators: {

                countryChanged,

                ispChanged,

                suspiciousVpn
            }
        };
    }

    return null;
};