/**
 * Calculate the bearing between two coordinates.
 * @param startLat
 * @param startLng
 * @param destLat
 * @param destLng
 * @returns {number}
 */

const calculateBearing = (startLat, startLng, destLat, destLng) => {
    const lat1 = parseFloat(startLat);
    const lng1 = parseFloat(startLng);
    const lat2 = parseFloat(destLat);
    const lng2 = parseFloat(destLng);

    if ([lat1, lng1, lat2, lng2].some(isNaN)) {
        console.error('Invalid coordinates:', { startLat, startLng, destLat, destLng });
        return 0; // Default value
    }

    const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
};

export default calculateBearing;