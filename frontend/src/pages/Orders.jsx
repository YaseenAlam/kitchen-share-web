import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function Orders() {
  const { user, loading: authLoading } = useAuth();
const navigate = useNavigate();

const [activeTab, setActiveTab] = useState('my-orders');
const [myOrders, setMyOrders] = useState([]);
const [incomingOrders, setIncomingOrders] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  // Wait for auth to finish loading before deciding anything
  if (authLoading) return;

  if (!user) {
    navigate('/login');
    return;
  }
  fetchOrders();
}, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      const ordersRes = await api.get('/orders/');
      setMyOrders(ordersRes.data.results || ordersRes.data || []);

      if (user?.is_cook) {
        const incomingRes = await api.get('/orders/incoming/');
        setIncomingOrders(incomingRes.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/update_status/`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="text-6xl animate-bounce">📋</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl mb-6" style={{ color: 'var(--color-dark)' }}>
          Orders
        </h1>

        {/* Tabs */}
        {user.is_cook && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('my-orders')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === 'my-orders'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              🛒 My Orders ({myOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('incoming')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === 'incoming'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              📥 Incoming ({incomingOrders.filter(o => o.status === 'pending').length} new)
            </button>
          </div>
        )}

        {/* My Orders */}
        {activeTab === 'my-orders' && (
          <>
            {myOrders.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="font-display text-2xl mb-2" style={{ color: 'var(--color-dark)' }}>
                  No orders yet
                </h3>
                <p className="mb-6" style={{ color: 'var(--color-gray-600)' }}>
                  Browse dishes and place your first order!
                </p>
                <Link to="/" className="btn-primary">
                  Browse Dishes
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map(order => (
                  <Link 
                    key={order.id} 
                    to={`/order/${order.id}`}
                    className="card p-6 block hover:shadow-lg transition-all"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex gap-4">
                        {order.listing_image ? (
                          <img 
                            src={order.listing_image} 
                            alt={order.listing_title} 
                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">🍽️</span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-display text-xl" style={{ color: 'var(--color-dark)' }}>
                              {order.listing_title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm mb-1" style={{ color: 'var(--color-gray-500)' }}>
                            Order #{order.id} • {formatDate(order.created_at)}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--color-gray-600)' }}>
                            Qty: {order.quantity} • Pickup: {formatDate(order.pickup_time)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                          ${order.total_price}
                        </p>
                        <span className="text-gray-400 text-xl">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Incoming Orders (Cooks) */}
        {activeTab === 'incoming' && user.is_cook && (
          <>
            {incomingOrders.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">📥</div>
                <h3 className="font-display text-2xl mb-2" style={{ color: 'var(--color-dark)' }}>
                  No incoming orders
                </h3>
                <p style={{ color: 'var(--color-gray-600)' }}>
                  When customers order your dishes, they'll appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomingOrders.map(order => (
                  <div key={order.id} className="card p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-display text-xl" style={{ color: 'var(--color-dark)' }}>
                            {order.listing_title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm mb-2" style={{ color: 'var(--color-gray-500)' }}>
                          Order #{order.id} • From: <strong>{order.buyer_name}</strong>
                        </p>
                        <div className="flex gap-4 text-sm" style={{ color: 'var(--color-gray-600)' }}>
                          <span>Qty: {order.quantity}</span>
                          <span>•</span>
                          <span>Pickup: {formatDate(order.pickup_time)}</span>
                        </div>
                        {order.notes && (
                          <p className="text-sm mt-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-gray-600)' }}>
                            📝 {order.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-4">
                        <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                          ${order.total_price}
                        </p>
                        
                        {/* Status Action Buttons */}
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <div className="flex flex-wrap gap-2">
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'accepted')}
                                  className="px-4 py-2 rounded-full text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
                                >
                                  ✓ Accept
                                </button>
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                  className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200"
                                >
                                  ✕ Decline
                                </button>
                              </>
                            )}
                            {order.status === 'accepted' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                                className="px-4 py-2 rounded-full text-sm font-medium bg-purple-500 text-white hover:bg-purple-600"
                              >
                                👨‍🍳 Start Preparing
                              </button>
                            )}
                            {order.status === 'preparing' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                className="px-4 py-2 rounded-full text-sm font-medium bg-green-500 text-white hover:bg-green-600"
                              >
                                ✓ Mark Ready
                              </button>
                            )}
                            {order.status === 'ready' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                className="px-4 py-2 rounded-full text-sm font-medium bg-gray-500 text-white hover:bg-gray-600"
                              >
                                ✓ Complete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Orders;