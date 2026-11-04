// Dummy digital literacy percentages for tooltips
const digitalLiteracyPercent: Record<string, number> = {
  Gauteng: 92,
  WesternCape: 88,
  KwaZuluNatal: 41,
  EasternCape: 65,
  FreeState: 38,
  NorthWest: 90,
  Mpumalanga: 85,
  NorthernCape: 33,
  Limpopo: 80,
};
// Dummy digital literacy percentages for tooltips
import React, { useState } from 'react';
// @ts-ignore
import provincesGeoJsonRaw from './provinces.geojson?raw';
import { GeoJSON } from 'react-leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// Dummy digital literacy percentages for tooltips
const digitalLiteracyPercentToolTip: Record<string, number> = {
  'Gauteng': 92,
  'Western Cape': 88,
  'KwaZulu-Natal': 41,
  'Eastern Cape': 65,
  'Free State': 38,
  'North West': 90,
  'Mpumalanga': 85,
  'Northern Cape': 33,
  'Limpopo': 80,
};

type User = { name: string; coords: [number, number] };

type UsersByProvince = {
  [province: string]: User[];
};

const usersByProvince: UsersByProvince = {
    'Gauteng': [
  { name: 'User 1', coords: [-26.2041, 28.0473] },
  { name: 'User 2', coords: [-25.7479, 28.2293] },
  { name: 'User 3', coords: [-26.2708, 28.1123] },
  { name: 'User 4', coords: [-26.1776, 27.9726] },
  { name: 'User 5', coords: [-25.8656, 29.2241] },
  { name: 'User 6', coords: [-26.1445, 28.0457] },
  { name: 'User 7', coords: [-26.2185, 27.8616] },
  { name: 'User 8', coords: [-26.1628, 28.2293] },
  { name: 'User 9', coords: [-26.1982, 28.0457] },
  { name: 'User 10', coords: [-26.3201, 28.1502] },
  { name: 'User 11', coords: [-25.8325, 28.1806] },
  { name: 'User 12', coords: [-25.8652, 27.9931] },
  { name: 'User 13', coords: [-26.0046, 28.2536] },
  { name: 'User 14', coords: [-26.3803, 27.2871] },
  { name: 'User 15', coords: [-26.6714, 27.9279] },
  { name: 'User 16', coords: [-26.6644, 27.8574] },
  { name: 'User 17', coords: [-25.9110, 28.1628] },
  { name: 'User 18', coords: [-26.4236, 28.4837] },
  { name: 'User 19', coords: [-25.7719, 27.9405] },
  { name: 'User 20', coords: [-26.3655, 28.1224] },
  { name: 'User 21', coords: [-26.2000, 28.1000] },
  { name: 'User 22', coords: [-26.2100, 28.1100] },
  { name: 'User 23', coords: [-26.2200, 28.1200] },
  { name: 'User 24', coords: [-26.2300, 28.1300] },
  { name: 'User 25', coords: [-26.2400, 28.1400] },
  { name: 'User 26', coords: [-26.2500, 28.1500] },
  { name: 'User 27', coords: [-26.2600, 28.1600] },
  { name: 'User 28', coords: [-26.2700, 28.1700] },
  { name: 'User 29', coords: [-26.2800, 28.1800] },
  { name: 'User 30', coords: [-26.2900, 28.1900] },
],

     'Western Cape': [
  { name: 'User 1', coords: [-33.9180, 18.4232] },
  { name: 'User 2', coords: [-34.0362, 18.3502] },
  { name: 'User 3', coords: [-33.9289, 18.4174] },
  { name: 'User 4', coords: [-33.8311, 18.6469] },
  { name: 'User 5', coords: [-33.9189, 18.4233] },
  { name: 'User 6', coords: [-33.9183, 18.4231] },
  { name: 'User 7', coords: [-34.1075, 18.4726] },
  { name: 'User 8', coords: [-34.0487, 18.6239] },
  { name: 'User 9', coords: [-33.9068, 18.4205] },
  { name: 'User 10', coords: [-34.1688, 22.1310] },
  { name: 'User 11', coords: [-33.8121, 19.8966] },
  { name: 'User 12', coords: [-34.1718, 22.1277] },
  { name: 'User 13', coords: [-33.6487, 19.4401] },
  { name: 'User 14', coords: [-32.9922, 18.0000] },
  { name: 'User 15', coords: [-32.9818, 18.5126] },
],

 'KwaZulu-Natal': [
  { name: 'User 1', coords: [-29.8587, 31.0218] },
  { name: 'User 2', coords: [-28.7435, 31.8900] },
  { name: 'User 3', coords: [-29.6168, 30.3928] },
  { name: 'User 4', coords: [-28.5337, 32.0836] },
  { name: 'User 5', coords: [-29.7784, 30.7958] },
  { name: 'User 6', coords: [-28.7834, 30.4332] },
  { name: 'User 7', coords: [-29.8230, 30.8901] },
  { name: 'User 8', coords: [-30.0037, 30.6586] },
  { name: 'User 9', coords: [-29.6922, 30.5811] },
  { name: 'User 10', coords: [-29.0215, 31.2547] },
],

 'Eastern Cape': [
  { name: 'User 1', coords: [-32.2968, 26.4194] },
  { name: 'User 2', coords: [-33.0153, 27.9116] },
  { name: 'User 3', coords: [-33.9611, 25.6144] },
  { name: 'User 4', coords: [-32.9833, 27.8667] },
  { name: 'User 5', coords: [-32.8684, 27.3976] },
  { name: 'User 6', coords: [-31.8927, 26.8744] },
  { name: 'User 7', coords: [-31.5900, 28.7855] },
  { name: 'User 8', coords: [-31.8958, 29.2763] },
  { name: 'User 9', coords: [-31.4333, 27.6833] },
  { name: 'User 10', coords: [-32.1466, 25.6228] },
  { name: 'User 11', coords: [-32.1500, 24.5333] },
],

  'Free State': [
  { name: 'User 1', coords: [-28.4541, 26.7968] },
  { name: 'User 2', coords: [-29.0852, 26.1596] },
  { name: 'User 3', coords: [-27.9774, 26.7333] },
  { name: 'User 4', coords: [-28.4096, 27.0836] },
  { name: 'User 5', coords: [-28.3206, 27.4869] },
  { name: 'User 6', coords: [-28.2192, 28.2995] },
  { name: 'User 7', coords: [-30.0310, 26.3189] },
  { name: 'User 8', coords: [-28.6642, 27.0935] },
  { name: 'User 9', coords: [-29.0850, 27.6167] },
  { name: 'User 10', coords: [-29.0586, 26.4728] },
  { name: 'User 11', coords: [-29.2087, 27.4803] },
],

 'North West': [
  { name: 'User 1', coords: [-25.6702, 27.2416] },
  { name: 'User 2', coords: [-25.8597, 25.6419] },
  { name: 'User 3', coords: [-26.6639, 25.2986] },
  { name: 'User 4', coords: [-26.2044, 27.9396] },
  { name: 'User 5', coords: [-25.3848, 26.6486] },
  { name: 'User 6', coords: [-26.3123, 26.5211] },
  { name: 'User 7', coords: [-25.7756, 27.0932] },
],

  'Mpumalanga': [
  { name: 'User 1', coords: [-25.4563, 30.9991] },
  { name: 'User 2', coords: [-25.0960, 30.4597] },
  { name: 'User 3', coords: [-26.2485, 30.4663] },
  { name: 'User 4', coords: [-25.7751, 29.4648] },
  { name: 'User 5', coords: [-25.6853, 29.2335] },
],
 'Northern Cape': [
  { name: 'User 1', coords: [-28.7282, 24.7498] },
  { name: 'User 2', coords: [-29.6769, 22.7476] },
  { name: 'User 3', coords: [-30.7183, 25.0968] },
],

 'Limpopo': [
  { name: 'User 1', coords: [-23.9045, 29.4689] },
  { name: 'User 2', coords: [-24.8807, 28.2905] },
],

};

type ProvinceCenters = {
  [province: string]: { center: [number, number]; zoom: number };
};

const provinceCenters: ProvinceCenters = {
  Gauteng: { center: [-26.2708, 28.1123], zoom: 9 },
  'Western Cape': { center: [-33.9180, 18.4232], zoom: 9 },
  'KwaZulu-Natal': { center: [-29.8587, 31.0218], zoom: 8 },
  'Eastern Cape': { center: [-32.2968, 26.4194], zoom: 7 },
  'Free State': { center: [-28.4541, 26.7968], zoom: 8 },
  'North West': { center: [-25.6702, 27.2416], zoom: 8 },
  'Mpumalanga': { center: [-25.4563, 30.9991], zoom: 8 },
  'Northern Cape': { center: [-28.7282, 24.7498], zoom: 7 },
  'Limpopo': { center: [-23.9045, 29.4689], zoom: 7 },
};

const mapDefault = { center: [-29.0, 24.0] as [number, number], zoom: 5.5 };

// Helper component to change map view on province select
function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface UserInsightsMapProps {
  isDarkMode?: boolean;
}

// Calculate digital literacy levels from percentages
// Normalize province names for consistent mapping
function normalizeProvinceName(name: string): string {
  // Remove spaces, dashes, and make lowercase for matching
  return name.replace(/[-\s]/g, '').toLowerCase();
}

const digitalLiteracyLevels: Record<string, 'low' | 'mid' | 'high'> = {};
Object.keys(digitalLiteracyPercentToolTip).forEach((prov) => {
  const percent = digitalLiteracyPercentToolTip[prov];
  digitalLiteracyLevels[normalizeProvinceName(prov)] =
    percent >= 75 ? 'high' : percent >= 50 ? 'mid' : 'low';
});

const digitalLiteracyColors: Record<'low' | 'mid' | 'high', string> = {
  low: '#e3342f',    // red (matches legend)
  mid: '#f59e42',    // amber (matches legend)
  high: '#38a169',   // green (matches legend)
};

const UserInsightsMap: React.FC<UserInsightsMapProps> = ({ isDarkMode }) => {
  // No heatmap data needed for province fill overlay
  // Parse GeoJSON if imported as string
  const provincesGeoJson = typeof provincesGeoJsonRaw === 'string' ? JSON.parse(provincesGeoJsonRaw) : provincesGeoJsonRaw;
  const [selectedProvince, setSelectedProvince] = useState<string>('All Provinces');
  const [selectedDistribution, setSelectedDistribution] = useState<'User Count' | 'Digital Literacy'>('User Count');

  // Show province-level circles if 'All Provinces' is selected
  const provinceData = Object.keys(usersByProvince).map((prov) => ({
  name: prov,
  coords: provinceCenters[prov].center,
  users: usersByProvince[prov].length,
  color: selectedDistribution === 'User Count' ? '#e3342f' : digitalLiteracyColors[digitalLiteracyLevels[normalizeProvinceName(prov)]],
  literacyLevel: digitalLiteracyLevels[normalizeProvinceName(prov)],
  }));

  // Style function for GeoJSON polygons
  const geoJsonStyle = (feature: any) => {
    const provinceName = feature.properties.name;
    const literacy = digitalLiteracyLevels[normalizeProvinceName(provinceName)] || 'low';
    return {
      fillColor: selectedDistribution === 'Digital Literacy' ? digitalLiteracyColors[literacy] : '#e3342f',
      color: '#333',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.5,
    };
  };

  // For selected province, show user-level circles
  const userCircles = selectedProvince !== 'All Provinces' && usersByProvince[selectedProvince]
    ? usersByProvince[selectedProvince]
    : [];

  // Map center/zoom logic
  const mapView = selectedProvince !== 'All Provinces' && provinceCenters[selectedProvince]
    ? provinceCenters[selectedProvince]
    : mapDefault;

  return (
    <div className={isDarkMode ? 'w-full max-w-4xl mx-auto rounded-md shadow-md p-6 mb-8' : 'w-full max-w-7xl mx-auto bg-white rounded-md shadow-md p-6 mb-8'}
         style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)' } : {}}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <h2 className="text-lg font-medium mb-2 md:mb-0">Distribution Map</h2>
        <div className="flex gap-4 items-center">
          <div>
            <label htmlFor="province-select" className="mr-2 font-medium text-sm">Filter by Province:</label>
            <select
              id="province-select"
              className={`border rounded px-3 py-1 text-sm ${selectedDistribution === 'Digital Literacy' ? 'bg-gray-200 cursor-not-allowed opacity-60' : ''}`}
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              disabled={selectedDistribution === 'Digital Literacy'}
            >
              <option>All Provinces</option>
              {Object.keys(usersByProvince).map((prov) => (
                <option key={prov}>{prov}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="distribution-select" className="mr-2 font-medium text-sm">Distribution:</label>
            <select
              id="distribution-select"
              className="border rounded px-3 py-1 text-sm"
              value={selectedDistribution}
              onChange={(e) => setSelectedDistribution(e.target.value as 'User Count' | 'Digital Literacy')}
            >
              <option value="User Count">User Count</option>
              <option value="Digital Literacy">Digital Literacy</option>
            </select>
          </div>
        </div>
      </div>
      
      <MapContainer
        center={mapView.center as [number, number]}
        zoom={mapView.zoom}
        style={{ height: '450px', width: '100%', borderRadius: '12px', zIndex: 0 }}
        scrollWheelZoom={false}
      >
        {/* Province-level digital literacy distribution (large, soft circles, weather-map style) */}
        {selectedProvince === 'All Provinces' && selectedDistribution === 'Digital Literacy' && (
          <>
            {Object.keys(provinceCenters).map((prov, idx) => {
              const coords = provinceCenters[prov].center;
              let percent = digitalLiteracyPercentToolTip[prov];
              if (percent === undefined) percent = digitalLiteracyPercentToolTip[prov.replace(/([A-Z])/g, ' $1').trim()];
              if (percent === undefined) percent = digitalLiteracyPercentToolTip[prov.replace(/([A-Z])/g, '-$1').trim()];
              if (percent === undefined) percent = digitalLiteracyPercentToolTip[prov.replace(/([A-Z])/g, ' $1').toLowerCase().trim()];
              if (percent === undefined) percent = digitalLiteracyPercentToolTip[prov.replace(/([A-Z])/g, '-$1').toLowerCase().trim()];
              if (percent === undefined) percent = digitalLiteracyPercentToolTip[prov.toLowerCase()];
              const level = digitalLiteracyLevels[normalizeProvinceName(prov)];
              // Base radius for solid center
              const baseRadius = Math.max(20, Math.min(30, percent / 3));
              // Number of gradient rings
              const rings = [
                { r: baseRadius, opacity: 0.7 },
                { r: baseRadius + 15, opacity: 0.35 },
                { r: baseRadius + 30, opacity: 0.15 },
              ];
              return (
                <>
                  {rings.map((ring, ringIdx) => (
                    <CircleMarker
                      key={prov + idx + '-ring-' + ringIdx}
                      center={coords as [number, number]}
                      pathOptions={{
                        radius: ring.r,
                        color: digitalLiteracyColors[level],
                        fillColor: digitalLiteracyColors[level],
                        fillOpacity: ring.opacity,
                        weight: 0,
                        opacity: 0,
                      }}
                    />
                  ))}
                  {/* Tooltip only on the innermost circle */}
                  <CircleMarker
                    key={prov + idx + '-tooltip'}
                    center={coords as [number, number]}
                    pathOptions={{
                      radius: baseRadius,
                      color: digitalLiteracyColors[level],
                      fillColor: digitalLiteracyColors[level],
                      fillOpacity: 0,
                      weight: 0,
                      opacity: 0,
                    }}
                  >
                    <LeafletTooltip>
                      <div className="text-xs font-semibold">
                        {prov}: {percent}% digital literacy
                        {level === 'low' && (
                          <span className="ml-2 text-red-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03-9-9-9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                            Needs Attention
                          </span>
                        )}
                      </div>
                    </LeafletTooltip>
                  </CircleMarker>
                </>
              );
            })}
          </>
        )}
        <ChangeMapView center={mapView.center as [number, number]} zoom={mapView.zoom} />
        {/* @ts-ignore: Suppress type errors for react-leaflet v5 props */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
  {/* Removed province fill overlay for weather-map style */}
        {/* Province circles for User Count (All Provinces) */}
        {selectedProvince === 'All Provinces' && selectedDistribution === 'User Count' && (
          <>
              {Object.keys(usersByProvince).map((prov, idx) => {
                const center = provinceCenters[prov].center;
                const userCount = usersByProvince[prov].length;
                // CircleMarker radius is in pixels, scale for visibility
                const radius = Math.max(18, Math.min(40, userCount * 0.8));
                return (
                  <CircleMarker
                    key={prov + idx}
                    center={center as [number, number]}
                    pathOptions={{
                      radius: radius,
                      color: '#e3342f',
                      fillColor: '#e3342f',
                      fillOpacity: 0.7,
                      weight: 1,
                    }}
                  >
                    <LeafletTooltip>
                      <div className="text-xs font-semibold">{prov}<br />Users: {userCount}</div>
                    </LeafletTooltip>
                  </CircleMarker>
                );
              })}
          </>
        )}
        {/* User circles for selected province */}
        {selectedProvince !== 'All Provinces' && userCircles.map((user, idx) => (
            <CircleMarker
              key={user.name + idx}
              center={user.coords as [number, number]}
              pathOptions={{
                color: '#e3342f',
                fillColor: '#e3342f',
                fillOpacity: 0.7,
                weight: 1,
                radius: 14,
              }}
            >
              <LeafletTooltip>
                <div className="text-xs font-semibold">{user.name}</div>
              </LeafletTooltip>
            </CircleMarker>
        ))}
      </MapContainer>
      <div className="mt-4 text-xs text-gray-500">
        <span>Map data: &copy; OpenStreetMap contributors | Circles represent user locations (dummy data).<br/>For real data, use OpenCage Geocoder API key in code comments.</span>
        {selectedDistribution === 'Digital Literacy' && (
          <div className="mt-4 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full" style={{ background: digitalLiteracyColors.low }}></span>
              <span className="font-semibold">Low</span>
              <span className="text-xs text-red-600 ml-2">Needs Attention</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full" style={{ background: digitalLiteracyColors.mid }}></span>
              <span className="font-semibold">Mid</span>
              <span className="text-xs text-yellow-600 ml-2">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full" style={{ background: digitalLiteracyColors.high }}></span>
              <span className="font-semibold">High</span>
              <span className="text-xs text-green-600 ml-2">Good</span>
            </div>
          </div>
        )}
      </div>
      {/* Manage Users button below map and legend */}
      <div className="flex justify-center mt-6">
        <button
          className="px-6 py-2 rounded-lg font-semibold text-white shadow-md"
          style={{ background: '#e67012' }}
          onClick={() => window.location.hash = '#/manage-users'}
        >
          Manage Users
        </button>
      </div>
    </div>
  );
}
// Removed stray closing brace and duplicate legend JSX


// HeatmapLayer component for leaflet.heat integration
function HeatmapLayer({ heatmapData }: { heatmapData: [number, number, number][] }) {
  const map = useMap();
  useEffect(() => {
    let heatLayer: any = null;
    if (map && (window as any)._literacyHeatLayer) {
      map.removeLayer((window as any)._literacyHeatLayer);
      (window as any)._literacyHeatLayer = null;
    }
    if (map && heatmapData.length > 0) {
      heatLayer = (L as any).heatLayer(heatmapData, {
        radius: 70,
        blur: 40,
        maxZoom: 10,
        minOpacity: 0.3,
        gradient: {
          0.1: '#b91c1c',   // low - dark red
          0.3: '#b91c1c',   // low - dark red
          0.5: '#b45309',   // mid - dark amber
          0.7: '#b45309',   // mid - dark amber
          0.8: '#15803d',   // high - dark green
          1.0: '#15803d',   // high - dark green
        },
      }).addTo(map);
      (window as any)._literacyHeatLayer = heatLayer;
    }
    return () => {
      if (heatLayer) map.removeLayer(heatLayer);
    };
  }, [map, heatmapData]);
  return null;
}

export default UserInsightsMap;