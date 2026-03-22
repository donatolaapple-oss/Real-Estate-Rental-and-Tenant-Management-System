import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ✅ HEATMAP: Sentiment-based heatmap analytics
const SentimentHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showPins, setShowPins] = useState(true);
  const [loading, setLoading] = useState(true);

  // ✅ DATA OUTPUT: Fetch heatmap data from API
  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        setLoading(true);
        
        // ✅ API ENDPOINT: GET /api/analytics/heatmap
        const response = await fetch('/api/analytics/heatmap');
        const data = await response.json();
        
        if (data.heatmapData) {
          setHeatmapData(data.heatmapData);
        } else {
          // ✅ FALLBACK: Generate sample data around Tupi coordinates
          setHeatmapData([
            { lat: 6.331, lng: 124.951, intensity: 0.9 },
            { lat: 6.332, lng: 124.950, intensity: 0.4 },
            { lat: 6.330, lng: 124.952, intensity: 0.7 },
            { lat: 6.333, lng: 124.949, intensity: 0.6 },
            { lat: 6.329, lng: 124.953, intensity: 0.8 },
            { lat: 6.334, lng: 124.948, intensity: 0.3 },
            { lat: 6.328, lng: 124.954, intensity: 0.5 },
            { lat: 6.335, lng: 124.947, intensity: 0.7 },
            { lat: 6.327, lng: 124.955, intensity: 0.4 },
            { lat: 6.336, lng: 124.946, intensity: 0.9 }
          ]);
        }
      } catch (error) {
        console.error('Heatmap data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, []);

  // ✅ COLOR RULES: Green > 0.75, Yellow 0.5-0.75, Red < 0.5
  const getColor = (intensity) => {
    if (intensity > 0.75) return '#10b981'; // 🟢 Green
    if (intensity >= 0.5) return '#f59e0b'; // 🟡 Yellow
    return '#ef4444'; // 🔴 Red
  };

  // ✅ HEATMAP OVERLAY: Custom component for sentiment visualization
  const HeatmapOverlay = () => {
    const map = useMap();
    
    useEffect(() => {
      if (!showHeatmap) return;
      
      // Create heatmap layer
      const heatmapLayer = L.layerGroup();
      
      heatmapData.forEach(point => {
        const circle = L.circle([point.lat, point.lng], {
          radius: 500 * point.intensity, // Size based on intensity
          fillColor: getColor(point.intensity),
          fillOpacity: 0.4,
          color: getColor(point.intensity),
          weight: 2
        });
        
        heatmapLayer.addLayer(circle);
      });
      
      heatmapLayer.addTo(map);
      
      return () => {
        map.removeLayer(heatmapLayer);
      };
    }, [map, heatmapData, showHeatmap]);
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100">
        <div className="text-lg">🔥 Loading sentiment heatmap...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ✅ TOGGLE OPTIONS: Pins only, Heatmap only, Both */}
      <div className="flex space-x-4 p-4 bg-white rounded-lg shadow">
        <button
          onClick={() => { setShowPins(true); setShowHeatmap(false); }}
          className={`px-4 py-2 rounded ${showPins && !showHeatmap ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          📍 Pins Only
        </button>
        <button
          onClick={() => { setShowPins(false); setShowHeatmap(true); }}
          className={`px-4 py-2 rounded ${!showPins && showHeatmap ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          🔥 Heatmap Only
        </button>
        <button
          onClick={() => { setShowPins(true); setShowHeatmap(true); }}
          className={`px-4 py-2 rounded ${showPins && showHeatmap ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          📍🔥 Both
        </button>
      </div>

      {/* ✅ MAP WITH HEATMAP: Center at Tupi, South Cotabato */}
      <div className="w-full h-96 rounded-lg overflow-hidden">
        <MapContainer
          center={[6.331, 124.951]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* ✅ HEATMAP OVERLAY: Dynamic sentiment visualization */}
          {showHeatmap && <HeatmapOverlay />}
          
          {/* ✅ MARKERS: Property pins when enabled */}
          {showPins && heatmapData.map((point, index) => (
            <CircleMarker
              key={index}
              center={[point.lat, point.lng]}
              radius={10}
              pathOptions={{
                fillColor: getColor(point.intensity),
                color: getColor(point.intensity),
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.6
              }}
            />
          ))}
        </MapContainer>
      </div>
      
      {/* ✅ LEGEND: Color rules explanation */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h4 className="font-semibold mb-2">🎨 Sentiment Color Rules</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2" />
            <span>Green &gt; sentimentScore &gt; 0.75</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2" />
            <span>Yellow &gt; 0.5–0.75</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2" />
            <span>Red &gt; &lt; 0.5</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentHeatmap;
