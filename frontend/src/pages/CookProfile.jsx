import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

function CookProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);

 useEffect(() => {
    const fetchCookData = async () => {
      try {
        const profileRes = await api.get(`/auth/cook/${username}/`);
        setProfile(profileRes.data);

        const listingsRes = await api.get(`/listings/?cook=${username}`);        setListings(listingsRes.data.results || listingsRes.data || []);
        
        // Fetch reviews for this cook
        const reviewsRes = await api.get(`/auth/cook/${username}/reviews/`);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        setError('Cook not found');
      } finally {
        setLoading(false);
      }
    };

    fetchCookData();
  }, [username]);
  const getPaymentIcon = (payment) => {
    const icons = {
      cash: '💵',
      venmo: '📱',
      zelle: '📱',
      paypal: '💳',
      cashapp: '📱',
      apple_pay: '🍎',
      card: '💳',
    };
    return icons[payment] || '💰';
  };

  const getPaymentLabel = (payment) => {
    const labels = {
      cash: 'Cash',
      venmo: 'Venmo',
      zelle: 'Zelle',
      paypal: 'PayPal',
      cashapp: 'Cash App',
      apple_pay: 'Apple Pay',
      card: 'Card',
    };
    return labels[payment] || payment;
  };

  const getCuisineLabel = (cuisine) => {
    const labels = {
      american: '🍔 American',
      mexican: '🌮 Mexican',
      italian: '🍝 Italian',
      chinese: '🥡 Chinese',
      indian: '🍛 Indian',
      japanese: '🍱 Japanese',
      mediterranean: '🥙 Mediterranean',
      caribbean: '🥥 Caribbean',
      korean: '🍜 Korean',
      thai: '🍲 Thai',
      vietnamese: '🍜 Vietnamese',
      middle_eastern: '🧆 Middle Eastern',
      african: '🍖 African',
      french: '🥐 French',
      other: '🍽️ Other',
    };
    return labels[cuisine] || cuisine;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="text-6xl animate-bounce">👨‍🍳</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-500 mb-4">{error}</p>
          <Link to="/" className="btn-primary">Back to Browse</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
              {profile.profile_image ? (
                <img src={profile.profile_image} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl" style={{ backgroundColor: 'var(--color-primary)' }}>
                  👨‍🍳
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl" style={{ color: 'var(--color-dark)' }}>
                  {profile.first_name && profile.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile.username}
                </h1>
                {profile.is_verified && (
                  <span className="badge bg-blue-100 text-blue-700">✓ Verified</span>
                )}
                {profile.food_safety_certified && (
                  <span className="badge bg-green-100 text-green-700">🛡️ Certified</span>
                )}
              </div>

              <p className="text-lg mb-4" style={{ color: 'var(--color-gray-600)' }}>
                {profile.bio || 'Home cook sharing delicious homemade meals'}
              </p>

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-dark)' }}>
                    {profile.total_orders}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>Orders</p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-dark)' }}>
                    {listings.length}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>Dishes</p>
                </div>
                {profile.rating > 0 && (
                  <div>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-dark)' }}>
                      ⭐ {profile.rating}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>Rating</p>
                  </div>
                )}
                {profile.years_experience > 0 && (
                  <div>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-dark)' }}>
                      {profile.years_experience}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>Years Exp.</p>
                  </div>
                )}
              </div>

              {/* Specialties */}
              {profile.cuisine_specialties?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.cuisine_specialties.map(cuisine => (
                    <span key={cuisine} className="badge" style={{ backgroundColor: 'var(--color-cream)' }}>
                      {getCuisineLabel(cuisine)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Payment Methods */}
            {profile.accepted_payments?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-display text-lg mb-4" style={{ color: 'var(--color-dark)' }}>
                  💳 Accepted Payments
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.accepted_payments.map(payment => (
                    <span key={payment} className="badge badge-primary">
                      {getPaymentIcon(payment)} {getPaymentLabel(payment)}
                    </span>
                  ))}
                </div>
                {profile.payment_notes && (
                  <p className="text-sm mt-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-gray-600)' }}>
                    {profile.payment_notes}
                  </p>
                )}
              </div>
            )}

            {/* Availability */}
            {profile.available_days?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-display text-lg mb-4" style={{ color: 'var(--color-dark)' }}>
                  📅 Available Days
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <span
                      key={day}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profile.available_days.includes(day)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {day.slice(0, 3).charAt(0).toUpperCase() + day.slice(1, 3)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pickup Info */}
            {profile.pickup_instructions && (
              <div className="card p-6">
                <h3 className="font-display text-lg mb-4" style={{ color: 'var(--color-dark)' }}>
                  📍 Pickup Info
                </h3>
                <p style={{ color: 'var(--color-gray-600)' }}>{profile.pickup_instructions}</p>
              </div>
            )}

            {/* Signature Dishes */}
            {profile.signature_dishes && (
              <div className="card p-6">
                <h3 className="font-display text-lg mb-4" style={{ color: 'var(--color-dark)' }}>
                  ⭐ Signature Dishes
                </h3>
                <p style={{ color: 'var(--color-gray-600)' }}>{profile.signature_dishes}</p>
              </div>
            )}
          </div>

          {/* Listings */}
          <div className="md:col-span-2">
            <h2 className="font-display text-2xl mb-6" style={{ color: 'var(--color-dark)' }}>
              Menu ({listings.length} dishes)
            </h2>

            {listings.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <p style={{ color: 'var(--color-gray-600)' }}>No dishes available yet</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {listings.map(listing => (
                  <Link key={listing.id} to={`/listings/${listing.id}`} className="card group">
                    <div className="relative overflow-hidden">
                      {listing.image ? (
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                          <span className="text-4xl">🍽️</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="badge badge-primary">${listing.price}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-lg mb-1" style={{ color: 'var(--color-dark)' }}>
                        {listing.title}
                      </h3>
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--color-gray-600)' }}>
                        {listing.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm" style={{ color: 'var(--color-gray-500)' }}>
                        <span>⏱️ {listing.prep_time} min</span>
                        {listing.spice_level && listing.spice_level !== 'none' && (
                          <span>
                            {listing.spice_level === 'mild' && '🌶️'}
                            {listing.spice_level === 'medium' && '🌶️🌶️'}
                            {listing.spice_level === 'hot' && '🌶️🌶️🌶️'}
                            {listing.spice_level === 'extra_hot' && '🔥'}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-2xl mb-4" style={{ color: 'var(--color-dark)' }}>
                ⭐ Reviews ({reviews.length})
              </h2>
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="card p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <span>👤</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium" style={{ color: 'var(--color-dark)' }}>
                            {review.reviewer_name}
                          </p>
                          <span className="text-sm" style={{ color: 'var(--color-gray-400)' }}>
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className="text-sm">
                              {star <= review.rating ? '⭐' : '☆'}
                            </span>
                          ))}
                          <span className="text-sm ml-1" style={{ color: 'var(--color-gray-500)' }}>
                            for {review.listing_title}
                          </span>
                        </div>
                        {review.comment && (
                          <p style={{ color: 'var(--color-gray-600)' }}>"{review.comment}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookProfile;