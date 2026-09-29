-- VAJRA PostgreSQL + PostGIS Schema Definition
-- SIH26072: Ministry of Earth Sciences / IMD

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Storm Cells Table (Convective tracking)
CREATE TABLE IF NOT EXISTS storm_cells (
    id SERIAL PRIMARY KEY,
    cell_identifier VARCHAR(50) NOT NULL UNIQUE,
    cell_name VARCHAR(255) NOT NULL,
    max_reflectivity_dbz NUMERIC(5, 2) NOT NULL,
    speed_kmh NUMERIC(5, 2) NOT NULL,
    bearing_degrees NUMERIC(5, 2) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    cloud_top_temp_c NUMERIC(5, 2) NOT NULL,
    lightning_rate_fl_min INT NOT NULL,
    risk_probability_pct INT NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Hazard Prediction Polygons Table (Grid-level nowcast)
CREATE TABLE IF NOT EXISTS hazard_polygons (
    id SERIAL PRIMARY KEY,
    cell_identifier VARCHAR(50) REFERENCES storm_cells(cell_identifier) ON DELETE CASCADE,
    forecast_horizon_min INT NOT NULL,
    risk_level VARCHAR(20) NOT NULL, -- LOW, MODERATE, HIGH, EXTREME
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Data Source Feed Health Table
CREATE TABLE IF NOT EXISTS data_source_feeds (
    id SERIAL PRIMARY KEY,
    feed_key VARCHAR(50) NOT NULL UNIQUE,
    provider VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL, -- ONLINE, DELAYED, OFFLINE
    latency_minutes INT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for high-performance spatial queries
CREATE INDEX IF NOT EXISTS idx_storm_cells_geom ON storm_cells USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_hazard_polygons_geom ON hazard_polygons USING GIST (geom);

-- Initial Data Source Seeding
INSERT INTO data_source_feeds (feed_key, provider, status, latency_minutes)
VALUES 
    ('radar', 'MOSDAC / ISRO TERLS DWR Radar', 'ONLINE', 3),
    ('satellite', 'MOSDAC – INSAT-3DS', 'ONLINE', 0),
    ('lightning', 'IITM Lightning Location Network', 'ONLINE', 1),
    ('aws', 'IMD AWS / ARG Network', 'ONLINE', 5),
    ('nwp', 'Copernicus ERA5 / Operational NWP', 'ONLINE', 0)
ON CONFLICT (feed_key) DO NOTHING;
