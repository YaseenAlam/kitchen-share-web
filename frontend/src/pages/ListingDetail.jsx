import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { usePageTitle } from '../hooks/usePageTitle';

function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState(null);
  usePageTitle(listing?.title);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Order state
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [pickupTime, setPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await api.get(`/listings/${id}/`);
      setListing(response.data);
      
      // Initialize required options
      const initialOptions = {};
      (response.data.customization_options || []).forEach(opt => {
        if (opt.required && opt.options.length > 0) {
          initialOptions[opt.name] = opt.options[0];
        }
      });
      setSelectedOptions(initialOptions);

      // Fetch reviews for this cook
      if (response.data.cook_name) {
        setLoadingReviews(true);
        try {
          const reviewsRes = await api.get(`/auth/cook/${response.data.cook_name}/reviews/`);
          setReviews(reviewsRes.data || []);
        } catch (err) {
          console.log('No reviews found');
        } finally {
          setLoadingReviews(false);
        }
      }
    } catch (err) {
      setError('Listing not found');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!listing) return 0;
    
    let total = parseFloat(listing.price) * quantity;
    
    // Add option prices
    Object.values(selectedOptions).forEach(option => {
      if (option?.price) total += option.price * quantity;
    });
    
    // Add add-on prices
    selectedAddOns.forEach(addon => {
      total += addon.price * quantity;
    });
    
    return total.toFixed(2);
  };

  const handleOptionSelect = (optionName, choice) => {
    setSelectedOptions({ ...selectedOptions, [optionName]: choice });
  };

  const handleAddOnToggle = (addon) => {
    if (selectedAddOns.find(a => a.name === addon.name)) {
      setSelectedAddOns(selectedAddOns.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const handleOrder = async () => {
    if (!pickupTime) {
      setError('Please select a pickup time');
      return;
    }

    setOrdering(true);
    setError('');

    // Debug - log what we're sending
    const orderData = {
      listing: id,
      quantity,
      pickup_time: pickupTime,
      notes,
      selected_options: selectedOptions,
      selected_add_ons: selectedAddOns,
    };
    console.log('Sending order:', orderData);

    try {
      const response = await api.post('/orders/', orderData);
      
      // Redirect to order confirmation page
      navigate(`/order/${response.data.id}`);
    } catch (err) {
      console.error('Order error:', err.response?.data);
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="text-6xl animate-bounce">🍽️</div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-500">{error}</p>
          <Link to="/" className="btn-primary mt-4">Back to Browse</Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === listing.cook;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="card overflow-hidden">
              {listing.image ? (
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-80 object-cover"
                />
              ) : (
                <div className="w-full h-80 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                  <span className="text-8xl">🍽️</span>
                </div>
              )}
            </div>

            {/* Title & Cook */}
            <div className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="font-display text-3xl mb-2" style={{ color: 'var(--color-dark)' }}>
                    {listing.title}
                  </h1>
                  <Link to={`/cook/${listing.cook_name}`} className="flex items-center gap-3 hover:opacity-80 transition-all">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                      {listing.cook_image ? (
                        <img src={listing.cook_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">👨‍🍳</span>
                      )}
                    </div>
                    

                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-dark)' }}>{listing.cook_name}</p>
                      <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>
                        {listing.cook_rating > 0 ? `⭐ ${listing.cook_rating}` : 'Home Cook'}
                        {listing.cook_total_orders > 0 && ` • ${listing.cook_total_orders} orders`}
                      </p>
                    </div>
                  </Link>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl" style={{ color: 'var(--color-primary)' }}>
                    ${listing.price}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>
                    {listing.servings} serving{listing.servings > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {listing.cook_bio && (
                <p className="text-sm italic mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-gray-600)' }}>
                  "{listing.cook_bio}"
                </p>
              )}

              <p className="mb-4" style={{ color: 'var(--color-gray-700)' }}>
                {listing.description}
              </p>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="badge" style={{ backgroundColor: 'var(--color-cream)' }}>
                  ⏱️ {listing.prep_time} min
                </span>
                <span className="badge" style={{ backgroundColor: 'var(--color-cream)' }}>
                  🍽️ {listing.cuisine_type}
                </span>
                {listing.spice_level && (
                  <span className="badge" style={{ backgroundColor: 'var(--color-cream)' }}>
                    {listing.spice_level === 'none' && '🌱 Not Spicy'}
                    {listing.spice_level === 'mild' && '🌶️ Mild'}
                    {listing.spice_level === 'medium' && '🌶️🌶️ Medium'}
                    {listing.spice_level === 'hot' && '🌶️🌶️🌶️ Hot'}
                    {listing.spice_level === 'extra_hot' && '🔥 Extra Hot'}
                  </span>
                )}
                {listing.calories && (
                  <span className="badge" style={{ backgroundColor: 'var(--color-cream)' }}>
                    🔥 {listing.calories} cal
                  </span>
                )}
              </div>

              {/* Accepted Payments */}
              {listing.accepted_payments?.length > 0 && (
                <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--color-gray-200)' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                    💳 Accepted Payments
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {listing.accepted_payments.map(payment => (
                      <span key={payment} className="badge badge-primary">
                        {payment === 'cash' && '💵 Cash'}
                        {payment === 'venmo' && '📱 Venmo'}
                        {payment === 'zelle' && '📱 Zelle'}
                        {payment === 'paypal' && '💳 PayPal'}
                        {payment === 'cashapp' && '📱 Cash App'}
                        {payment === 'apple_pay' && '🍎 Apple Pay'}
                        {payment === 'card' && '💳 Card'}
                      </span>
                    ))}
                  </div>
                  {listing.payment_notes && (
                    <p className="text-sm mt-2" style={{ color: 'var(--color-gray-500)' }}>
                      {listing.payment_notes}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Pickup Instructions */}
            {listing.pickup_instructions && (
              <div className="card p-6">
                <h3 className="font-display text-xl mb-3" style={{ color: 'var(--color-dark)' }}>
                  📍 Pickup Instructions
                </h3>
                <p style={{ color: 'var(--color-gray-700)' }}>{listing.pickup_instructions}</p>
              </div>
            )}

            {/* Dietary & Allergens */}
            {(listing.dietary_tags?.length > 0 || listing.allergens?.length > 0) && (
              <div className="card p-6">
                {listing.dietary_tags?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>Dietary</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.dietary_tags.map(tag => (
                        <span key={tag} className="badge badge-success">✓ {tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {listing.allergens?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>Allergen Warning</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.allergens.map(allergen => (
                        <span key={allergen} className="badge bg-red-100 text-red-700">⚠️ {allergen}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ingredients */}
            {listing.ingredients && (
              <div className="card p-6">
                <h3 className="font-display text-xl mb-3" style={{ color: 'var(--color-dark)' }}>
                  Ingredients
                </h3>
                <p style={{ color: 'var(--color-gray-700)' }}>{listing.ingredients}</p>
              </div>
            )}

            {/* Reviews Section */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl" style={{ color: 'var(--color-dark)' }}>
                  Customer Reviews
                </h3>
                {listing.cook_rating > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                    <span className="text-xl">⭐</span>
                    <span className="font-bold text-lg">{listing.cook_rating}</span>
                    <span className="text-sm opacity-80">({listing.cook_total_orders} orders)</span>
                  </div>
                )}
              </div>

              {loadingReviews ? (
                <div className="text-center py-8">
                  <div className="text-4xl animate-bounce">⭐</div>
                  <p style={{ color: 'var(--color-gray-500)' }}>Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
                  <div className="text-5xl mb-3">🌟</div>
                  <p className="font-medium" style={{ color: 'var(--color-dark)' }}>No reviews yet</p>
                  <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>
                    Be the first to try this dish and leave a review!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Review Stats Bar */}
                  {reviews.length >= 3 && (
                    <div className="grid grid-cols-5 gap-2 p-4 rounded-xl mb-4" style={{ backgroundColor: 'var(--color-cream)' }}>
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length;
                        const percentage = (count / reviews.length) * 100;
                        return (
                          <div key={star} className="flex flex-col items-center">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-sm font-medium">{star}</span>
                              <span className="text-xs">⭐</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: star >= 4 ? '#22c55e' : star === 3 ? '#eab308' : '#ef4444'
                                }}
                              />
                            </div>
                            <span className="text-xs mt-1" style={{ color: 'var(--color-gray-500)' }}>
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Individual Reviews */}
                  {reviews.slice(0, 5).map((review, idx) => (
                    <div 
                      key={review.id || idx} 
                      className="p-5 rounded-xl border-2 transition-all hover:shadow-md"
                      style={{ borderColor: 'var(--color-gray-100)', backgroundColor: 'white' }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
                          style={{ 
                            backgroundColor: `hsl(${(review.reviewer_name?.charCodeAt(0) || 0) * 10}, 70%, 90%)`,
                            color: `hsl(${(review.reviewer_name?.charCodeAt(0) || 0) * 10}, 70%, 40%)`
                          }}
                        >
                          {review.reviewer_name?.charAt(0).toUpperCase() || '?'}
                        </div>

                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-bold" style={{ color: 'var(--color-dark)' }}>
                                {review.reviewer_name}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <span 
                                      key={star} 
                                      className={`text-lg ${star <= review.rating ? '' : 'opacity-30'}`}
                                    >
                                      ⭐
                                    </span>
                                  ))}
                                </div>
                                {review.listing_title && review.listing_title !== listing.title && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100" style={{ color: 'var(--color-gray-500)' }}>
                                    {review.listing_title}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-sm" style={{ color: 'var(--color-gray-400)' }}>
                              {new Date(review.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          {/* Comment */}
                          {review.comment && (
                            <p 
                              className="leading-relaxed"
                              style={{ color: 'var(--color-gray-600)' }}
                            >
                              "{review.comment}"
                            </p>
                          )}

                          {/* Verified Badge */}
                          <div className="mt-3 flex items-center gap-1">
                            <span className="text-green-500 text-sm">✓</span>
                            <span className="text-xs" style={{ color: 'var(--color-gray-400)' }}>
                              Verified order
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Show More Link */}
                  {reviews.length > 5 && (
                    <Link 
                      to={`/cook/${listing.cook_name}`}
                      className="block text-center py-3 rounded-xl font-medium transition-all hover:bg-orange-50"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      See all {reviews.length} reviews →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="card p-6">
                <p className="mb-4" style={{ color: 'var(--color-gray-600)' }}>This is your listing</p>
                <Link to={`/edit-listing/${id}`} className="btn-secondary">
                  Edit Listing
                </Link>
              </div>
            )}
          </div>

          {/* Order Panel */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              {user && !isOwner ? (
                <>
                  <h3 className="font-display text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
                    Your Order
                  </h3>

                  {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm">{error}</div>
                  )}

                  {/* Quantity */}
                  <div className="mb-6">
                    <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                      Quantity
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl"
                      >
                        −
                      </button>
                      <span className="text-2xl font-bold" style={{ color: 'var(--color-dark)' }}>{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Customization Options */}
                  {listing.customization_options?.length > 0 && (
                    <div className="mb-6 space-y-4">
                      {listing.customization_options.map((option, idx) => (
                        <div key={idx}>
                          <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                            {option.name} {option.required && <span className="text-red-500">*</span>}
                          </label>
                          <div className="space-y-2">
                            {option.options.map((choice, cIdx) => (
                              <button
                                key={cIdx}
                                onClick={() => handleOptionSelect(option.name, choice)}
                                className={`w-full p-3 rounded-xl text-left flex justify-between items-center transition-all ${
                                  selectedOptions[option.name]?.label === choice.label
                                    ? 'bg-orange-100 border-2 border-orange-500'
                                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                }`}
                              >
                                <span>{choice.label}</span>
                                {choice.price > 0 && (
                                  <span style={{ color: 'var(--color-gray-500)' }}>+${choice.price.toFixed(2)}</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add-ons */}
                  {listing.add_ons?.length > 0 && (
                    <div className="mb-6 space-y-4">
                      {listing.add_ons.map((group, gIdx) => (
                        <div key={gIdx}>
                          <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                            {group.name || 'Add-ons'}
                          </label>
                          <div className="space-y-2">
                            {(group.items || [group]).map((item, iIdx) => {
                              const itemKey = `${group.name || 'addon'}-${item.label || item.name}`;
                              const isSelected = selectedAddOns.find(a => 
                                (a.label === item.label || a.name === item.name) && 
                                (a.group === group.name || !group.name)
                              );
                              return (
                                <button
                                  key={iIdx}
                                  onClick={() => {
                                    const addon = { 
                                      ...item, 
                                      group: group.name,
                                      label: item.label || item.name,
                                      name: item.label || item.name
                                    };
                                    if (isSelected) {
                                      setSelectedAddOns(selectedAddOns.filter(a => 
                                        !((a.label === addon.label || a.name === addon.name) && a.group === addon.group)
                                      ));
                                    } else {
                                      setSelectedAddOns([...selectedAddOns, addon]);
                                    }
                                  }}
                                  className={`w-full p-3 rounded-xl text-left flex justify-between items-center transition-all ${
                                    isSelected
                                      ? 'bg-green-100 border-2 border-green-500'
                                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                  }`}
                                >
                                  <span>{item.label || item.name}</span>
                                  <span style={{ color: 'var(--color-gray-500)' }}>
                                    +${(item.price || 0).toFixed(2)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pickup Time */}
                  <div className="mb-6">
                    <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                      Pickup Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="input"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>

                  {/* Notes */}
                  <div className="mb-6">
                    <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                      Special Instructions
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input"
                      rows={2}
                      placeholder="Any allergies or special requests?"
                    />
                  </div>

                  {/* Total & Order Button */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium" style={{ color: 'var(--color-gray-700)' }}>Total</span>
                      <span className="font-display text-2xl" style={{ color: 'var(--color-primary)' }}>
                        ${calculateTotal()}
                      </span>
                    </div>
                    <button
                      onClick={handleOrder}
                      disabled={ordering}
                      className="btn-primary w-full text-lg py-4"
                    >
                      {ordering ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </>
              ) : !user ? (
                <div className="text-center py-4">
                  <p className="mb-4" style={{ color: 'var(--color-gray-600)' }}>Login to order this dish</p>
                  <Link to="/login" className="btn-primary w-full">Login</Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p style={{ color: 'var(--color-gray-600)' }}>This is your listing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingDetail;