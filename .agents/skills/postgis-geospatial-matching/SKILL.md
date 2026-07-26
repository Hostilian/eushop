---
name: postgis-geospatial-matching
description: PostGIS spatial corridor geometry & origin-destination distance algorithms (postgis-community). Protected designation of origin (PDO) spatial matching and distance filtering.
---

# PostGIS Geospatial Spatial Corridor Engine

This skill implements spatial corridor geometry and distance calculation logic for regional food mapping.

## Standards
1. **Spatial Queries**: Use `ST_DWithin` and `ST_Distance` for geographic coordinate matching.
2. **Fallback Coordinates**: Fallback to country centroid ISO2 lookup when precise GPS coordinates are missing.
