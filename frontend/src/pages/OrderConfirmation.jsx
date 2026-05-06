import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function OrderConfirmation() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [statusChanged, setStatusChanged] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

 useEffect(() => {
  if (authLoading) return;
  
  if (!user) {
    navigate('/login');
    return;
  }
  fetchOrder();

    // Auto-refresh every 30 seconds for active orders
    const interval = setInterval(() => {
      if (order && !['completed', 'cancelled'].includes(order.status)) {
        fetchOrder(true); // silent refresh
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [id, user, authLoading]);

  // Refetch when order status might have changed
  useEffect(() => {
    if (order && !['completed', 'cancelled'].includes(order.status)) {
      const interval = setInterval(() => {
        fetchOrder(true);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [order?.status]);

  const fetchOrder = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const orderRes = await api.get(`/orders/${id}/`);
      
      // Check if status changed
      if (order && order.status !== orderRes.data.status) {
        setStatusChanged(true);
        setTimeout(() => setStatusChanged(false), 3000);
      }
      
      setOrder(orderRes.data);
      setLastUpdated(new Date());
      
      // Fetch listing details for cook info
      if (!listing) {
        const listingRes = await api.get(`/listings/${orderRes.data.listing}/`);
        setListing(listingRes.data);
      }
    } catch (err) {
      if (!silent) setError('Order not found');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const submitReview = async () => {
    if (reviewRating === 0) return;
    
    setSubmittingReview(true);
    try {
      await api.post(`/orders/${id}/review/`, {
        rating: reviewRating,
        comment: reviewText
      });
      setReviewSubmitted(true);
      fetchOrder(true);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const cancelOrder = async () => {
    setCancelling(true);
    try {
      await api.post(`/orders/${id}/cancel/`);
      fetchOrder(false);
      setShowCancelConfirm(false);
    } catch (err) {
      console.error('Failed to cancel:', err);
      alert(err.response?.data?.detail || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pending: {
        label: 'Order Placed',
        description: 'Waiting for cook to accept your order',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: '⏳',
        step: 1
      },
      accepted: {
        label: 'Accepted',
        description: 'Cook has accepted your order',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: '✓',
        step: 2
      },
      preparing: {
        label: 'Preparing',
        description: 'Your food is being prepared',
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        icon: '👨‍🍳',
        step: 3
      },
      ready: {
        label: 'Ready for Pickup',
        description: 'Your order is ready! Head to pickup location',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: '🎉',
        step: 4
      },
      completed: {
        label: 'Completed',
        description: 'Order completed. Enjoy your meal!',
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: '✅',
        step: 5
      },
      cancelled: {
        label: 'Cancelled',
        description: 'This order was cancelled',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: '❌',
        step: 0
      }
    };
    return statuses[status] || statuses.pending;
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="text-6xl animate-bounce">📋</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-500 mb-4">{error || 'Order not found'}</p>
          <Link to="/profile" className="btn-primary">Go to Profile</Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Status Changed Notification */}
        {statusChanged && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fadeInUp">
            <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <span className="font-medium">Order status updated!</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl" style={{ backgroundColor: 'var(--color-primary)' }}>
            {order.status === 'ready' ? '🎉' : order.status === 'completed' ? '✅' : '📋'}
          </div>
          <h1 className="font-display text-3xl mb-2" style={{ color: 'var(--color-dark)' }}>
            {order.status === 'ready' ? 'Ready for Pickup!' : 
             order.status === 'completed' ? 'Order Complete' : 
             'Order Confirmed'}
          </h1>
          <p style={{ color: 'var(--color-gray-600)' }}>
            Order #{order.id} • Placed {formatDate(order.created_at)}
          </p>
          
          {/* Last updated & refresh */}
          {!['completed', 'cancelled'].includes(order.status) && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-sm" style={{ color: 'var(--color-gray-400)' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <button
                onClick={() => fetchOrder(false)}
                className="text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                style={{ color: 'var(--color-gray-600)' }}
              >
                ↻ Refresh
              </button>
            </div>
          )}
        </div>

        {/* Order Status Progress */}
        <div className={`card p-6 mb-6 ${order.status === 'ready' ? 'ring-4 ring-green-400 ring-opacity-50' : ''}`}>
          <div className={`p-4 rounded-xl border-2 mb-6 ${statusInfo.color}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{statusInfo.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-lg">{statusInfo.label}</p>
                <p className="text-sm opacity-80">{statusInfo.description}</p>
              </div>
              {order.status === 'ready' && (
                <div className="animate-pulse">
                  <span className="text-2xl">👆</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          {order.status !== 'cancelled' && (
            <div className="flex justify-between items-center relative">
              {/* Progress Line */}
              <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10 mx-8"></div>
              <div 
                className="absolute top-4 left-0 h-1 bg-green-500 -z-10 mx-8 transition-all duration-500"
                style={{ width: `${Math.max(0, (statusInfo.step - 1) * 25)}%` }}
              ></div>
              
              {['Placed', 'Accepted', 'Preparing', 'Ready', 'Done'].map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = statusInfo.step >= stepNum;
                const isCurrent = statusInfo.step === stepNum;
                return (
                  <div key={step} className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-all ${
                      isActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    } ${isCurrent ? 'ring-4 ring-green-200 scale-110' : ''}`}>
                      {isActive ? '✓' : stepNum}
                    </div>
                    <span className={`text-xs ${isActive ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Auto-refresh notice */}
          {!['completed', 'cancelled'].includes(order.status) && (
            <p className="text-center text-sm mt-4" style={{ color: 'var(--color-gray-400)' }}>
              🔄 This page updates automatically every 30 seconds
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Details */}
          <div className="card p-6">
            <h2 className="font-display text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
              📦 Order Details
            </h2>

            {/* Listing Info */}
            <div className="flex gap-4 mb-4 pb-4 border-b">
              {listing?.image ? (
                <img src={listing.image} alt={listing.title} className="w-20 h-20 rounded-xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">🍽️</div>
              )}
              <div>
                <h3 className="font-display text-lg" style={{ color: 'var(--color-dark)' }}>{order.listing_title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>Qty: {order.quantity}</p>
              </div>
            </div>

            {/* Selected Options */}
            {order.selected_options && Object.keys(order.selected_options).length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>Options:</p>
                {Object.entries(order.selected_options).map(([name, choice]) => (
                  <div key={name} className="flex justify-between text-sm mb-1">
                    <span style={{ color: 'var(--color-gray-600)' }}>{name}: {choice.label}</span>
                    {choice.price > 0 && (
                      <span style={{ color: 'var(--color-gray-500)' }}>+${choice.price.toFixed(2)}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Selected Add-ons */}
            {order.selected_add_ons && order.selected_add_ons.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>Add-ons:</p>
                {order.selected_add_ons.map((addon, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-1">
                    <span style={{ color: 'var(--color-gray-600)' }}>{addon.label || addon.name}</span>
                    <span style={{ color: 'var(--color-gray-500)' }}>+${(addon.price || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-cream)' }}>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-gray-700)' }}>Special Instructions:</p>
                <p className="text-sm" style={{ color: 'var(--color-gray-600)' }}>{order.notes}</p>
              </div>
            )}

            {/* Total */}
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="font-medium" style={{ color: 'var(--color-dark)' }}>Total</span>
              <span className="font-display text-2xl" style={{ color: 'var(--color-primary)' }}>
                ${order.total_price}
              </span>
            </div>
          </div>

          {/* Pickup & Payment Info */}
          <div className="space-y-6">
            {/* Pickup Info */}
            <div className="card p-6">
              <h2 className="font-display text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
                📍 Pickup Details
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-gray-500)' }}>Pickup Time</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-dark)' }}>
                    {formatDate(order.pickup_time)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-gray-500)' }}>Cook</p>
                  <Link 
                    to={`/cook/${order?.cook_name}`} 
                    className="flex items-center gap-3 mt-1 hover:opacity-80 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                      {listing?.cook_image ? (
                        <img src={listing.cook_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>👨‍🍳</span>
                      )}
                    </div>
                    <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
                      {order?.cook_first_name && order?.cook_last_name
                        ? `${order.cook_first_name} ${order.cook_last_name}`
                        : order?.cook_name}
                    </span>
                  </Link>
                </div>

                {/* Cook contact — only show for non-cancelled orders */}
                {order.status !== 'cancelled' && (order?.cook_phone || order?.cook_address) && (
                  <div className="p-4 rounded-xl border-2" style={{ borderColor: 'var(--color-primary)', backgroundColor: 'rgba(232, 93, 4, 0.05)' }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>
                      📞 Contact Your Cook
                    </p>

                    {order?.cook_phone && (
                      <a
                        href={`tel:${order.cook_phone}`}
                        className="flex items-center gap-3 p-3 rounded-lg mb-2 hover:opacity-80 transition-all"
                        style={{ backgroundColor: 'white' }}
                      >
                        <span className="text-xl">📱</span>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--color-gray-500)' }}>Tap to call</p>
                          <p className="font-medium" style={{ color: 'var(--color-dark)' }}>
                            {order.cook_phone}
                          </p>
                        </div>
                      </a>
                    )}

                    {order?.cook_address && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.cook_address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:opacity-80 transition-all"
                        style={{ backgroundColor: 'white' }}
                      >
                        <span className="text-xl">📍</span>
                        <div className="flex-1">
                          <p className="text-xs" style={{ color: 'var(--color-gray-500)' }}>Pickup address — tap for directions</p>
                          <p className="font-medium" style={{ color: 'var(--color-dark)' }}>
                            {order.cook_address}
                          </p>
                        </div>
                        <span style={{ color: 'var(--color-primary)' }}>→</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Pickup instructions now come from order, not listing */}
                {order.status !== 'cancelled' && order?.cook_pickup_instructions && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-cream)' }}>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-gray-700)' }}>
                      Pickup Instructions:
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-gray-600)' }}>
                      {order.cook_pickup_instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="card p-6">
              <h2 className="font-display text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
                💳 Payment
              </h2>

              <div className="p-4 rounded-xl border-2 border-dashed mb-4" style={{ borderColor: 'var(--color-primary)', backgroundColor: 'rgba(232, 93, 4, 0.05)' }}>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                  Pay ${order.total_price} at pickup using:
                </p>
                
                {listing?.accepted_payments?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {listing.accepted_payments.map(payment => (
                      <span key={payment} className="badge badge-primary">
                        {getPaymentIcon(payment)} {getPaymentLabel(payment)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>
                    Contact cook for payment options
                  </p>
                )}
              </div>

              {listing?.payment_notes && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-cream)' }}>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-gray-700)' }}>
                    Payment Details:
                  </p>
                  <p className="text-sm font-mono" style={{ color: 'var(--color-dark)' }}>
                    {listing.payment_notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Section - Only for completed orders */}
        {order.status === 'completed' && (
          <div className="card p-6 mt-6">
            {order.review || reviewSubmitted ? (
              <div>
                <h2 className="font-display text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
                  ⭐ Your Review
                </h2>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className="text-2xl">
                      {star <= (order.review?.rating || reviewRating) ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                {(order.review?.comment || reviewText) && (
                  <p style={{ color: 'var(--color-gray-600)' }}>
                    "{order.review?.comment || reviewText}"
                  </p>
                )}
                <p className="text-sm mt-2" style={{ color: 'var(--color-gray-400)' }}>
                  Thanks for your feedback!
                </p>
              </div>
            ) : (
              <div>
                <h2 className="font-display text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
                  ⭐ Leave a Review
                </h2>
                <p className="mb-4" style={{ color: 'var(--color-gray-600)' }}>
                  How was your experience with {listing?.cook_name}?
                </p>
                
                {/* Star Rating */}
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="text-3xl transition-transform hover:scale-110"
                    >
                      {star <= reviewRating ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span className="ml-2 text-sm" style={{ color: 'var(--color-gray-500)' }}>
                    {reviewRating === 1 && 'Poor'}
                    {reviewRating === 2 && 'Fair'}
                    {reviewRating === 3 && 'Good'}
                    {reviewRating === 4 && 'Great'}
                    {reviewRating === 5 && 'Excellent!'}
                  </span>
                </div>

                {/* Comment */}
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell others about your experience (optional)"
                  className="input mb-4"
                  rows={3}
                />

                <button
                  onClick={submitReview}
                  disabled={reviewRating === 0 || submittingReview}
                  className="btn-primary"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="card p-6 max-w-md w-full animate-fadeInUp">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">😢</div>
                <h3 className="font-display text-xl mb-2" style={{ color: 'var(--color-dark)' }}>
                  Cancel this order?
                </h3>
                <p style={{ color: 'var(--color-gray-600)' }}>
                  Are you sure you want to cancel your order for <strong>{order.listing_title}</strong>?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="btn-secondary flex-1"
                  disabled={cancelling}
                >
                  Keep Order
                </button>
                <button
                  onClick={cancelOrder}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {/* Cancel Button - only for pending/accepted orders */}
          {['pending', 'accepted'].includes(order.status) && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-6 py-3 rounded-xl font-semibold border-2 border-red-200 text-red-500 hover:bg-red-50 transition-all"
            >
              Cancel Order
            </button>
          )}
          <Link to="/profile" className="btn-secondary text-center">
            View All Orders
          </Link>
          <Link to="/" className="btn-primary text-center">
            Browse More Dishes
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-gray-500)' }}>
          {['pending', 'accepted'].includes(order.status) 
            ? `Questions? Contact ${listing?.cook_name} through their profile.`
            : order.status === 'cancelled'
            ? 'This order was cancelled.'
            : `Questions about your order? Contact ${listing?.cook_name} through their profile.`
          }
        </p>

        {/* Help Text */}
        <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-gray-500)' }}>
          Questions about your order? Contact {listing?.cook_name} through their profile.
        </p>
      </div>
    </div>
  );
}

export default OrderConfirmation;