# API Documentation

This application is primarily a client-side application with enhanced local state management. All core functionality is handled in the browser with localStorage persistence.

## External APIs

### 1. Map WMS Service

**Provider:** NRW Digital Orthophotos WMS  
**Base URL:** `https://www.wms.nrw.de/geobasis/wms_nw_dop`

#### Get Map Tiles
- **Method:** GET
- **Parameters:**
  - `bbox`: Bounding box in EPSG:3857 format
  - `format`: `image/png`
  - `service`: `WMS`
  - `version`: `1.1.1`
  - `request`: `GetMap`
  - `srs`: `EPSG:3857`
  - `transparent`: `true`
  - `width`: `256`
  - `height`: `256`
  - `layers`: `nw_dop_rgb` (RGB) or `nw_dop_cir` (Infrared)

**Example Request:**
```
https://www.wms.nrw.de/geobasis/wms_nw_dop?bbox=830000,6650000,831000,6651000&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=nw_dop_rgb
```

**Response:** PNG image tile

**Available Layers:**
- `nw_dop_rgb` - Standard RGB color orthophotos
- `nw_dop_cir` - Color Infrared orthophotos

### 2. Geocoding Service

**Provider:** Nominatim (OpenStreetMap)  
**Base URL:** `https://nominatim.openstreetmap.org`

#### Search for Location
- **Method:** GET
- **Endpoint:** `/search`
- **Parameters:**
  - `format`: `json`
  - `q`: Search query (city, address, etc.)
  - `limit`: Number of results (default: 5)

**Example Request:**
```
https://nominatim.openstreetmap.org/search?format=json&q=Berlin&limit=5
```

**Response:**
```json
[
  {
    "display_name": "Berlin, Deutschland",
    "lat": "52.5200066",
    "lon": "13.404954",
    "boundingbox": ["52.3382448", "52.6755087", "13.0883450", "13.7611609"]
  }
]
```

**Rate Limits:** 1 request per second (Nominatim policy)

## Client-Side State Management

The application manages the following state locally:

### Map View State
```typescript
{
  longitude: number,  // Center longitude (default: 7.4653)
  latitude: number,   // Center latitude (default: 51.5136)
  zoom: number        // Zoom level (default: 10)
}
```

### Drawn Features
```typescript
Record<string, MapGeoJSONFeature>
```
Features are stored in browser memory and persisted to localStorage with their IDs as keys.

**localStorage Key:** `aoi-features`

**Example Structure:**
```json
{
  "feature-uuid-1": {
    "type": "Feature",
    "id": "feature-uuid-1",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[...]]]
    },
    "properties": {}
  }
}
```

### Layer Visibility
```typescript
{
  showWMS: boolean,    // Toggle satellite imagery layer
  wmsLayer: 'nw_dop_rgb' | 'nw_dop_cir'  // Selected WMS layer
}
```

### Active Tab
```typescript
{
  activeTab: 'define' | 'saved' | 'export'  // Current sidebar tab
}
```

### Recent Searches
```typescript
string[]  // Array of recent search queries
```
Stored in localStorage for quick access.

## Component Props API

### MapComponent Props
```typescript
interface MapComponentProps {
  onFeaturesUpdate?: (features: Record<string, MapGeoJSONFeature>) => void;
  selectedLocation?: { 
    lat: number; 
    lon: number; 
    bbox?: number[] 
  } | null;
}
```

### Sidebar Props
```typescript
interface SidebarProps {
  onLocationSelect: (lat: number, lon: number, bbox?: number[]) => void;
}
```

### GeocodingSearch Props
```typescript
interface GeocodingSearchProps {
  onLocationSelect: (lat: number, lon: number, bbox?: number[]) => void;
}
```

## Future Backend API (Recommended for Production)

For production deployment, implement the following REST API:

### Authentication

#### POST /api/auth/register
Register a new user
```json
Request:
{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "John Doe"
}

Response:
{
  "user": { "id": "uuid", "email": "...", "name": "..." },
  "token": "jwt_token"
}
```

#### POST /api/auth/login
User login
```json
Request:
{
  "email": "user@example.com",
  "password": "secure_password"
}

Response:
{
  "user": { "id": "uuid", "email": "...", "name": "..." },
  "token": "jwt_token"
}
```

### Areas of Interest (AOI)

#### POST /api/aoi
Create a new Area of Interest
```json
Request:
{
  "name": "Downtown District",
  "description": "Urban area for object detection",
  "geometry": { /* GeoJSON Geometry */ },
  "tags": ["urban", "residential"]
}

Response:
{
  "id": "uuid",
  "name": "Downtown District",
  "geometry": { /* GeoJSON */ },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "user_id": "uuid",
  "feature_count": 1
}
```

#### GET /api/aoi
List all AOIs for the authenticated user
```
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- tags: string[] (filter by tags)
- search: string (search in name/description)

Response:
{
  "data": [{ /* AOI objects */ }],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### GET /api/aoi/:id
Retrieve a specific AOI
```json
Response:
{
  "id": "uuid",
  "name": "Downtown District",
  "description": "...",
  "geometry": { /* GeoJSON */ },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "user_id": "uuid",
  "tags": ["urban"],
  "feature_count": 1
}
```

#### PUT /api/aoi/:id
Update an existing AOI
```json
Request:
{
  "name": "Updated Name",
  "description": "Updated description",
  "tags": ["new", "tags"]
}

Response:
{
  "id": "uuid",
  /* Updated AOI object */
}
```

#### DELETE /api/aoi/:id
Delete an AOI
```
Response: 204 No Content
```

### Export

#### GET /api/aoi/:id/export
Export AOI in various formats
```
Query Parameters:
- format: 'geojson' | 'shapefile' | 'kml'

Response:
- GeoJSON: application/json
- Shapefile: application/zip
- KML: application/vnd.google-earth.kml+xml
```

#### POST /api/aoi/batch-export
Export multiple AOIs
```json
Request:
{
  "aoi_ids": ["uuid1", "uuid2"],
  "format": "geojson"
}

Response:
{
  "type": "FeatureCollection",
  "features": [/* All AOI features */]
}
```

### Analytics

#### GET /api/analytics/summary
Get user analytics
```json
Response:
{
  "total_aois": 45,
  "total_features": 234,
  "total_area_km2": 123.45,
  "recent_activity": [/* Recent AOI modifications */]
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* Optional additional details */ }
  }
}
```

**Common Error Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

Proposed rate limits for production:
- Authentication: 5 requests/minute
- AOI CRUD: 100 requests/minute
- Export: 10 requests/minute
- Analytics: 30 requests/minute

## Database Schema

See `SCHEMA.md` for detailed database design using PostgreSQL with PostGIS extension.
