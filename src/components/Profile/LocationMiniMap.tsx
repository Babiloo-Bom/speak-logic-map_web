import React from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import ICON_LOCATION from '@/assets/icons/location-icon.png';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });

type Props = {
  locationName: string;
  height?: number;
};

// Marker icon is created on client after Leaflet loads

const LocationMiniMap: React.FC<Props> = ({ locationName, height = 180 }) => {
  const [coords, setCoords] = React.useState<[number, number] | null>(null);
  const [error, setError] = React.useState<string>('');
  const [markerIcon, setMarkerIcon] = React.useState<any>(null);

  React.useEffect(() => {
    // Load Leaflet on client to avoid window reference during SSR
    let cancelled = false;
    (async () => {
      if (typeof window === 'undefined') return;
      const L = (await import('leaflet')).default;
      if (!cancelled) {
        setMarkerIcon(L.icon({
          iconUrl: ICON_LOCATION.src,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    let aborted = false;
    const fetchCoords = async () => {
      if (!locationName) return;
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(locationName)}`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        if (!aborted && Array.isArray(data) && data.length > 0) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (e) {
        if (!aborted) setError('Cannot locate this place');
      }
    };
    fetchCoords();
    return () => { aborted = true; };
  }, [locationName]);

  if (!locationName) return null;

  if (!coords) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', color: '#8E8E93' }}>
        {error || 'Locating on map...'}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height, borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer
        center={coords}
        zoom={6}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markerIcon ? <Marker position={coords} icon={markerIcon} /> : null}
      </MapContainer>
    </div>
  );
};

export default LocationMiniMap;


