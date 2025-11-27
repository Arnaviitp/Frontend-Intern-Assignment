# API Documentation

This application is a client-side only application and does not have a backend API. All functionality is handled in the browser.

## Map WMS Service

**External Service:** NRW Digital Orthophotos WMS

**Base URL:** `https://www.wms.nrw.de/geobasis/wms_nw_dop`

### Get Map Tiles
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
  - `layers`: `nw_dop_rgb` (RGB color orthophotos)

**Example Request:**
```
https://www.wms.nrw.de/geobasis/wms_nw_dop?bbox=830000,6650000,831000,6651000&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=nw_dop_rgb
```

**Response:** PNG image tile

## Client-Side State

The application manages the following state locally:

### Map View State
```typescript
{
  longitude: number,  // Center longitude
  latitude: number,   // Center latitude
  zoom: number        // Zoom level
}
```

### Drawn Features
```typescript
Record<string, GeoJSON.Feature>
```
Features are stored in browser memory with their IDs as keys. Can be extended to use `localStorage` for persistence.

### Layer Visibility
```typescript
{
  showWMS: boolean  // Toggle satellite imagery layer
}
```

## Future Backend API (Recommended for Production)

For production, consider implementing:

### POST /api/aoi
Create a new Area of Interest
```json
{
  "name": "My AOI",
  "geometry": { /* GeoJSON */ },
  "metadata": { "created": "ISO8601", "tags": ["tag1"] }
}
```

### GET /api/aoi/:id
Retrieve an AOI by ID

### GET /api/aoi
List all AOIs with pagination and filtering

### DELETE /api/aoi/:id  
Delete an AOI

### PUT /api/aoi/:id
Update an existing AOI
