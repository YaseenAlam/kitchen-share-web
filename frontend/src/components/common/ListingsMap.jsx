import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { useState, useEffect } from 'react';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom user location icon (pulsing blue dot)
const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #3B82F6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 10px rgba(59, 130, 246, 0.5);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: -8px;
        left: -8px;
        width: 36px;
        height: 36px;
        background: rgba(59, 130, 246, 0.2);
        border-radius: 50%;
        animation: pulse 2s infinite;
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Custom food marker icon
const createFoodIcon = (price) => L.divIcon({
  className: 'food-marker',
  html: `
    <div style="
      background: white;
      padding: 8px 12px;
      border-radius: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
      font-weight: 600;
      font-size: 14px;
      color: #E85D04;
      white-space: nowrap;
      border: 2px solid #E85D04;
      cursor: pointer;
      transition: all 0.2s;
    ">
      $${price}
    </div>
  `,
  iconSize: [60, 36],
  iconAnchor: [30, 36],
  popupAnchor: [0, -40],
});

// Component to fly to selected listing
function FlyToLocation({ selectedListing }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedListing && selectedListing.latitude && selectedListing.longitude) {
      map.flyTo([parseFloat(selectedListing.latitude), parseFloat(selectedListing.longitude)], 15, {
        duration: 0.8
      });
    }
  }, [selectedListing, map]);
  
  return null;
}

function ListingsMap({ listings, userLocation, selectedListing, onSelectListing }) {
  const [hoveredId, setHoveredId] = useState(null);

  if (!userLocation) {
    return (
      <div className="h-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center rounded-2xl">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="font-display text-xl mb-2" style={{ color: 'var(--color-dark)' }}>
            Enable location
          </h3>
          <p style={{ color: 'var(--color-gray-600)' }}>
            Allow location access to see dishes near you on the map
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full rounded-2xl overflow-hidden shadow-lg relative">
      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          min-width: 250px !important;
        }
        .leaflet-popup-tip {
          display: none;
        }
        .food-marker:hover > div {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(232, 93, 4, 0.3);
        }
      `}</style>
      
      <MapContainer
        
        center={[userLocation.lat, userLocation.lng]}
        zoom={14}
        className="h-full w-full"
        zoomControl={false}
      >
        {/* Prettier map tiles - CartoDB Voyager */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <FlyToLocation selectedListing={selectedListing} />
        
        {/* User location marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="p-4 text-center">
              <div className="text-2xl mb-2">📍</div>
              <p className="font-semibold">You are here</p>
            </div>
          </Popup>
        </Marker>

        {/* Listing markers */}
        {listings.map((listing) => (
          listing.latitude && listing.longitude && (
            <Marker
              key={listing.id}
              position={[parseFloat(listing.latitude), parseFloat(listing.longitude)]}
              icon={createFoodIcon(listing.price)}
              eventHandlers={{
                click: () => onSelectListing && onSelectListing(listing),
                mouseover: () => setHoveredId(listing.id),
                mouseout: () => setHoveredId(null),
              }}
            >
              <Popup>
                <div className="w-64">
                  {listing.image ? (
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-dark)' }}>
                      {listing.title}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>
                        ${listing.price}
                      </span>
                      {listing.distance !== null && (
                        <span className="text-sm px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-success)' }}>
                          {listing.distance} mi
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--color-gray-600)' }}>
                      <span>👨‍🍳 {listing.cook_name}</span>
                      <span>•</span>
                      <span>⏱️ {listing.prep_time} min</span>
                    </div>
                    <Link
                      to={`/listings/${listing.id}`}
                      className="block w-full text-center py-2 rounded-full font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-3 z-[1000]">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span style={{ color: 'var(--color-gray-600)' }}>You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>$</div>
            <span style={{ color: 'var(--color-gray-600)' }}>Dishes</span>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <button 
          onClick={() => document.querySelector('.leaflet-container')._leaflet_map?.zoomIn()}
          className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button 
          onClick={() => document.querySelector('.leaflet-container')._leaflet_map?.zoomOut()}
          className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ListingsMap;