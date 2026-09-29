"""
VAJRA Meteorological Data Schemas & API Pydantic Models
SIH26072 — Ministry of Earth Sciences / IMD
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class DownstreamArrival(BaseModel):
    location: str
    distance_km: float
    eta_minutes: int
    risk_probability: float
    recommended_action: str

class ShapAttribution(BaseModel):
    radar_reflectivity: float = Field(..., description="SHAP attribution % for Radar core reflectivity")
    lightning_flash_rate: float = Field(..., description="SHAP attribution % for Lightning flash rate")
    satellite_cloud_cooling: float = Field(..., description="SHAP attribution % for INSAT TIR cloud cooling")
    surface_cape: float = Field(..., description="SHAP attribution % for IMD AWS CAPE / moisture")
    bulk_wind_shear: float = Field(..., description="SHAP attribution % for ERA5 vertical wind shear")

class StormCell(BaseModel):
    cell_id: str
    name: str
    latitude: float
    longitude: float
    max_reflectivity_dbz: float
    speed_kmh: float
    direction: str
    bearing_degrees: float
    growth_rate_pct: str
    cloud_top_temp_celsius: float
    lightning_rate_flashes_min: int
    lightning_risk_pct: int
    confidence_rating: float
    status: str
    downstream_impacts: List[DownstreamArrival]
    shap_explainability: ShapAttribution

class DataFeedStatus(BaseModel):
    feed_name: str
    provider: str
    parameters: str
    operational_role: str
    status: str  # ONLINE, DELAYED, OFFLINE
    latency_minutes: int

class NowcastResponse(BaseModel):
    timestamp_utc: str
    forecast_horizon_minutes: int
    active_storm_cells_count: int
    high_risk_zones_count: int
    peak_risk_probability_pct: int
    adaptive_mode: str
    confidence_score_pct: int
    storm_cells: List[StormCell]
    data_health: List[DataFeedStatus]

class VerificationMetric(BaseModel):
    model_name: str
    pod_probability_of_detection: float
    far_false_alarm_ratio: float
    csi_critical_success_index: float

class CapAlertRequest(BaseModel):
    target_region: str
    hazard_type: str
    severity: str
    lead_time_minutes: int
    affected_population_estimate: int
    advisory_actions: List[str]
