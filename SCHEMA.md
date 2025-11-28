# Data Schema & ER Diagram

## Current Implementation (Client-Side Only)

The application currently uses local React state. There is no database or persistent storage.

### State Structure

```typescript
// Map View State
interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

// Drawn Features (AOIs)
interface DrawnFeatures {
  [featureId: string]: GeoJSON.Feature;
}

// Layer Control
interface LayerState {
  showWMS: boolean;
}
```

---

## Recommended Production Schema

For a production system with a backend database:

```
┌─────────────────┐
│     User        │
├─────────────────┤
│ id (PK)         │
│ email           │
│ name            │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│      AOI        │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ name            │
│ geometry        │◄─── GeoJSON (Point, LineString, Polygon)
│ properties      │◄─── JSON (metadata)
│ created_at      │
│ updated_at      │
│ deleted_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│      Tag        │
├─────────────────┤
│ id (PK)         │
│ aoi_id (FK)     │
│ key             │
│ value           │
└─────────────────┘
```

### Entity Descriptions

#### User

- **Purpose:** Store user authentication and profile data
- **Key Fields:**
  - `id`: UUID primary key
  - `email`: User email (unique)
  - `name`: Display name
  - `created_at`: Account creation timestamp

#### AOI (Area of Interest)

- **Purpose:** Store geographic features drawn by users
- **Key Fields:**
  - `id`: UUID primary key
  - `user_id`: Reference to owning user
  - `name`: Human-readable name for the AOI
  - `geometry`: GeoJSON geometry (stored as JSON or PostGIS geometry type)
  - `properties`: Additional metadata (JSON)
  - `created_at`, `updated_at`: Audit timestamps
  - `deleted_at`: Soft delete support

#### Tag

- **Purpose:** Flexible metadata tagging system for AOIs
- **Key Fields:**
  - `id`: UUID primary key
  - `aoi_id`: Reference to AOI
  - `key`: Tag category (e.g., "type", "priority")
  - `value`: Tag value (e.g., "agricultural", "high")

### Database Recommendations

**PostgreSQL with PostGIS** is highly recommended for this application because:

- Native support for geographic data types and spatial indexing (GiST indexes)
- Powerful geospatial queries (intersections, buffers, distance calculations)
- JSONB support for flexible metadata storage
- Industry standard for GIS applications

### Example Queries

```sql
-- Find all AOIs within a bounding box
SELECT * FROM aoi
WHERE ST_Intersects(
  geometry::geometry,
  ST_MakeEnvelope(west, south, east, north, 4326)
);

-- Get all user's AOIs with total area
SELECT user_id, name, ST_Area(geometry::geography) as area_m2
FROM aoi
WHERE user_id = :userId AND deleted_at IS NULL;

-- Search AOIs by tag
SELECT a.* FROM aoi a
JOIN tag t ON a.id = t.aoi_id
WHERE t.key = 'category' AND t.value = 'industrial';
```

### Indexing Strategy

```sql
-- Spatial index for fast geometry queries
CREATE INDEX idx_aoi_geometry ON aoi USING GIST (geometry);

-- User lookup
CREATE INDEX idx_aoi_user_id ON aoi (user_id);

-- Tag searches
CREATE INDEX idx_tag_aoi_id ON tag (aoi_id);
CREATE INDEX idx_tag_key_value ON tag (key, value);

-- Soft delete support
CREATE INDEX idx_aoi_deleted_at ON aoi (deleted_at);
```

### Migration Path from Current Implementation

1. Set up PostgreSQL with PostGIS extension
2. Create schema with above tables
3. Implement backend API (see API.md)
4. Add authentication (JWT or session-based)
5. Migrate from `localStorage` persistence to API calls
6. Add real-time collaboration with WebSockets (optional)
