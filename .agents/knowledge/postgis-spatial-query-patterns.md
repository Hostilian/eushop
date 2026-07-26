# PostGIS Spatial Query Optimization Patterns

## Overview
EUshop uses PostGIS for origin-based product search and PDO/PGI boundary matching.

## Index Requirements
Always use `GIST` spatial indexes:
```sql
CREATE INDEX CONCURRENTLY idx_products_origin_geo
ON products USING GIST (origin_geometry);
```

## Distance Query Pattern (CORRECT)
```sql
-- Use ST_DWithin for index-accelerated distance queries
SELECT * FROM products
WHERE ST_DWithin(origin_geometry, ST_MakePoint($lon, $lat)::geography, $radius_meters);
```

## Anti-Pattern (AVOID)
```sql
-- ST_Distance in WHERE clause does NOT use index
WHERE ST_Distance(origin_geometry, ST_MakePoint($lon, $lat)) < $radius
```

## PDO/PGI Boundary Check
```sql
SELECT p.*, pdo.name as designation
FROM products p
JOIN pdo_boundaries pdo ON ST_Within(p.origin_point, pdo.boundary)
WHERE p.id = $product_id;
```

## Coordinate System
- Store in `EPSG:4326` (WGS84)
- Distance in metres using `::geography` cast
- Index on `::geometry` for faster spatial ops
