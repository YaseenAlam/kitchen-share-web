import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ListingsMap from '../components/common/ListingsMap';

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [viewMode, setViewMode] = useState('split');
  const [selectedListing, setSelectedListing] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('all');
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [maxDistance, setMaxDistance] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState('');
  
  const cuisineOptions = [
    { value: 'all', label: 'All Cuisines' },
    { value: 'american', label: 'American' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'italian', label: 'Italian' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'indian', label: 'Indian' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'other', label: 'Other' },
  ];

  const dietaryOptions = [
    { value: '', label: 'Any Dietary' },
    { value: 'Vegetarian', label: 'Vegetarian' },
    { value: 'Vegan', label: 'Vegan' },
    { value: 'Gluten-Free', label: 'Gluten-Free' },
    { value: 'Dairy-Free', label: 'Dairy-Free' },
    { value: 'Halal', label: 'Halal' },
    { value: 'Kosher', label: 'Kosher' },
  ];

  useEffect(() => {
    getUserLocation();
  }, []);

 useEffect(() => {
    if (userLocation || locationError) {
      fetchListings();
    }
  }, [userLocation, locationError, maxDistance, cuisine, selectedDietary, priceRange]);
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userLocation || locationError) {
        fetchListings();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError('Location access denied. Showing all listings.');
        }
      );
    } else {
      setLocationError('Geolocation not supported. Showing all listings.');
    }
  };

  const fetchListings = async () => {
    try {
      let params = new URLSearchParams();
      
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
        params.append('distance', maxDistance);
      }
      if (search) params.append('search', search);
      if (cuisine && cuisine !== 'all') params.append('cuisine', cuisine);
      if (selectedDietary.length > 0) {
        selectedDietary.forEach(d => params.append('dietary', d));
      }
      if(priceRange) params.append('max_price', priceRange);
      
      const response = await api.get(`/listings/?${params.toString()}`);
      setListings(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCuisine('all');
    setSelectedDietary([]);
    setMaxDistance(10);
    setPriceRange('');
  };

  const hasActiveFilters = search || cuisine !== 'all' || selectedDietary.length > 0 || maxDistance !== 10 || priceRange;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🍳</div>
          <p className="text-lg font-medium" style={{ color: 'var(--color-dark)' }}>Finding dishes near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-cream)' }}>
{/* Header */}
      <div className="bg-white border-b sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search Bar */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 Search for tacos, pasta, curry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              )}
            </button>
          </div>

          {/* Filter Row */}
          {showFilters && (
            <div className="pb-4 space-y-4 animate-fadeInUp">
              {/* Cuisine Chips */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-gray-600)' }}>Cuisine</p>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setCuisine(cuisine === opt.value ? 'all' : opt.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        cuisine === opt.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Chips - Multi-select */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-gray-600)' }}>Dietary</p>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.filter(opt => opt.value).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (selectedDietary.includes(opt.value)) {
                          setSelectedDietary(selectedDietary.filter(d => d !== opt.value));
                        } else {
                          setSelectedDietary([...selectedDietary, opt.value]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedDietary.includes(opt.value)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-gray-600)' }}>Price</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Under $10', value: '10' },
                    { label: 'Under $20', value: '20' },
                    { label: 'Under $30', value: '30' },
                    { label: 'Under $50', value: '50' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        value={option.value}
                        checked={priceRange === option.value}
                        onChange={() => setPriceRange(option.value)}
                        className="accent-orange-500"
                      />
                      <span className="text-sm" style={{ color: 'var(--color-gray-600)' }}>{option.label}</span>
                    </label>
                  ))}
                  {priceRange && (
                    <button
                      onClick={() => setPriceRange('')}
                      className="text-xs text-orange-500 hover:text-orange-600 text-left underline mt-1"
                    >
                      Clear price filter
                    </button>
                  )}
               </div>
              </div>

              {/* Distance Slider */}
              {userLocation && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-gray-600)' }}>
                    Distance: <span className="text-orange-600">{maxDistance} miles</span>
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-gray-400)' }}>
                    <span>1 mi</span>
                    <span>50 mi</span>
                  </div>
                </div>
              )}

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Results & View Toggle */}
          <div className="flex justify-between items-center">
            <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>
              {listings.length} {listings.length === 1 ? 'dish' : 'dishes'} found
              {search && <span> for "<strong>{search}</strong>"</span>}
            </p>
            
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-full p-1">
              {[
                { id: 'list', icon: '☰' },
                { id: 'split', icon: '◧' },
                { id: 'map', icon: '🗺️' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    viewMode === mode.id 
                      ? 'bg-white shadow text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {mode.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {locationError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            {locationError}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'split' ? (
          <div className="flex gap-6 h-[calc(100vh-280px)]">
            <div className="w-full md:w-2/5 overflow-y-auto pr-2 space-y-4">
              {listings.length === 0 ? (
                <EmptyState search={search} onClear={clearFilters} />
              ) : (
                listings.map((listing) => (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing} 
                    isSelected={selectedListing?.id === listing.id}
                    onClick={() => setSelectedListing(listing)}
                  />
                ))
              )}
            </div>
            <div className="hidden md:block w-3/5 h-full">
              <ListingsMap 
                listings={listings} 
                userLocation={userLocation} 
                selectedListing={selectedListing}
                onSelectListing={setSelectedListing}
              />
            </div>
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-[calc(100vh-280px)] rounded-2xl overflow-hidden">
            <ListingsMap 
              listings={listings} 
              userLocation={userLocation}
              selectedListing={selectedListing}
              onSelectListing={setSelectedListing}
            />
          </div>
        ) : (
          <>
            {listings.length === 0 ? (
              <EmptyState search={search} onClear={clearFilters} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing, index) => (
                  <Link
                    key={listing.id}
                    to={`/listings/${listing.id}`}
                    className="card group animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                  <div className="relative overflow-hidden">
                    {listing.image ? (
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                        <span className="text-5xl">🍽️</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="badge badge-primary">${listing.price}</span>
                    </div>
                    {listing.distance !== null && (
                      <div className="absolute top-3 left-3">
                        <span className="badge badge-success">{listing.distance} mi</span>
                      </div>
                    )}
                    {/* Rating Badge */}
                    {listing.cook_rating > 0 && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-white text-sm font-bold">{listing.cook_rating}</span>
                      </div>
                    )}
                  </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-display text-xl" style={{ color: 'var(--color-dark)' }}>
                          {listing.title}
                        </h3>
                        <span className="badge text-xs" style={{ backgroundColor: 'var(--color-cream)' }}>
                          {listing.cuisine_type}
                        </span>
                      </div>
                      <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-gray-600)' }}>
                        {listing.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-sm">👨‍🍳</span>
                          </div>
                          <Link 
                            to={`/cook/${listing.cook_name}`} 
                            className="text-sm font-medium hover:underline"
                            style={{ color: 'var(--color-primary)' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {listing.cook_name}
                          </Link>
                        </div>
                        <span className="text-sm" style={{ color: 'var(--color-gray-500)' }}>
                          ⏱️ {listing.prep_time} min
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-orange-500 shadow-lg' : ''
      }`}
    >
      <div className="flex gap-4 p-4">
        <div className="relative flex-shrink-0">
          {listing.image ? (
            <img
              src={listing.image}
              alt={listing.title}
              className="w-24 h-24 rounded-xl object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
              <span className="text-3xl">🍽️</span>
            </div>
          )}
          {/* Rating Badge on Image */}
          {listing.cook_rating > 0 && (
            <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-sm">
              <span className="text-yellow-400 text-xs">★</span>
              <span className="text-white text-xs font-bold">{listing.cook_rating}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display text-lg truncate" style={{ color: 'var(--color-dark)' }}>
              {listing.title}
            </h3>
            <span className="font-bold flex-shrink-0" style={{ color: 'var(--color-primary)' }}>
              ${listing.price}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-gray-600)' }}>
              {listing.cuisine_type}
            </span>
            {listing.cook_total_orders > 0 && (
              <span className="text-xs" style={{ color: 'var(--color-gray-400)' }}>
                {listing.cook_total_orders} orders
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-gray-500)' }}>
            <span>👨‍🍳</span>
            <Link
              to={`/cook/${listing.cook_name}`}
              className="hover:underline font-medium"
              style={{ color: 'var(--color-primary)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {listing.cook_name}
            </Link>
            <span>•</span>
            <span>⏱️ {listing.prep_time} min</span>
            {listing.distance !== null && (
              <>
                <span>•</span>
                <span className="font-medium" style={{ color: 'var(--color-success)' }}>
                  {listing.distance} mi
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <Link
        to={`/listings/${listing.id}`}
        className="block w-full py-3 text-center font-semibold border-t transition-colors hover:bg-orange-50"
        style={{ color: 'var(--color-primary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        View Details →
      </Link>
    </div>
  );
}

function EmptyState({ search, onClear }) {
  return (
    <div className="bg-white p-12 rounded-2xl shadow text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="font-display text-2xl mb-2" style={{ color: 'var(--color-dark)' }}>
        {search ? `No dishes found for "${search}"` : 'No dishes nearby'}
      </h3>
      <p className="mb-6" style={{ color: 'var(--color-gray-600)' }}>
        {search 
          ? 'Try a different search or adjust your filters'
          : 'Try increasing the distance or check back later!'
        }
      </p>
      <button onClick={onClear} className="btn-primary">
        Clear filters
      </button>
    </div>
  );
}

export default Listings;