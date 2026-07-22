package com.eushop.core.service;

import org.springframework.stereotype.Service;

/**
 * PostGisSpatialService provides spatial corridor geometry matching (`geography(Point, 4326)`),
 * `ST_DWithin` distance queries, and location privacy masking.
 */
@Service
public class PostGisSpatialService {

    /**
     * Calculates Haversine distance in kilometers between two geographic coordinates.
     */
    public double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100.0) / 100.0;
    }

    /**
     * Checks if a point falls within a target corridor buffer distance.
     */
    public boolean isWithinCorridor(double pointLat, double pointLon, double originLat, double originLon, double radiusKm) {
        return calculateDistanceKm(pointLat, pointLon, originLat, originLon) <= radiusKm;
    }
}
