import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { usePageTitle } from '../hooks/usePageTitle';


function Profile() {
  const { user, setUser, becomeCook } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [myListings, setMyListings] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [cookProfile, setCookProfile] = useState(null);
  usePageTitle('My Profile');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingCookProfile, setEditingCookProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
  });
  
  const [cookFormData, setCookFormData] = useState({
    bio: '',
    kitchen_description: '',
  });
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const ordersRes = await api.get('/orders/');
      setMyOrders(ordersRes.data.results || ordersRes.data || []);

      if (user?.is_cook) {
        const listingsRes = await api.get('/listings/');
        const allListings = listingsRes.data.results || [];
        setMyListings(allListings.filter(l => l.cook === user.id));

        const incomingRes = await api.get('/orders/incoming/');
        setIncomingOrders(incomingRes.data || []);

        try {
          const cookProfileRes = await api.get('/auth/cook-profile/');
          setCookProfile(cookProfileRes.data);
          setCookFormData({
            bio: cookProfileRes.data.bio || '',
            kitchen_description: cookProfileRes.data.kitchen_description || '',
          });
        } catch (err) {
          console.log('No cook profile yet');
        }
      }

      setFormData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone: user?.phone || '',
        address: user?.address || '',
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.patch('/auth/me/', formData);
      setUser(response.data);
      setEditing(false);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCookProfile = async () => {
    setSaving(true);
    try {
      await api.patch('/auth/cook-profile/', cookFormData);
      setEditingCookProfile(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save cook profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profile_image', file);

      const response = await api.patch('/auth/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(response.data);
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBecomeCook = async () => {
    try {
      await becomeCook();
      window.location.reload();
    } catch (err) {
      console.error('Failed to become cook:', err);
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
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="text-6xl animate-bounce">👤</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar with Upload */}
            <div className="relative group">
              {user.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.username}
                  className="w-24 h-24 rounded-2xl object-cover"
                />
              ) : (
                <div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl" 
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {user.is_cook ? '👨‍🍳' : '😋'}
                </div>
              )}
              
              {/* Upload Overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {uploadingImage ? (
                  <span className="text-white text-sm">Uploading...</span>
                ) : (
                  <span className="text-white text-2xl">📷</span>
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl" style={{ color: 'var(--color-dark)' }}>
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user.username}
                </h1>
                {user.is_cook && (
                  <span className="badge badge-primary">Cook</span>
                )}
              </div>
              <p style={{ color: 'var(--color-gray-600)' }}>@{user.username} • {user.email}</p>
              
              {/* Cook Bio */}
              {user.is_cook && cookProfile?.bio && (
                <p className="mt-2 text-sm italic" style={{ color: 'var(--color-gray-500)' }}>
                  "{cookProfile.bio}"
                </p>
              )}
              
              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-dark)' }}>
                    {myOrders.length}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>Orders</p>
                </div>
                {user.is_cook && (
                  <>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: 'var(--color-dark)' }}>
                        {myListings.length}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>Dishes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: 'var(--color-dark)' }}>
                        {incomingOrders.filter(o => o.status === 'completed').length}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>Fulfilled</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {!user.is_cook && (
                <button onClick={handleBecomeCook} className="btn-primary">
                  🍳 Become a Cook
                </button>
              )}
              {user.is_cook && (
                <Link to="/create-listing" className="btn-primary">
                  + Add New Dish
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-20 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'orders', label: 'My Orders', icon: '🛒' },
              ...(user.is_cook ? [
                { id: 'listings', label: 'My Dishes', icon: '🍽️' },
                { id: 'incoming', label: 'Incoming Orders', icon: '📥' },
                { id: 'cook-settings', label: 'Cook Profile', icon: '⚙️' },
              ] : []),
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Info Card */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl" style={{ color: 'var(--color-dark)' }}>
                  Personal Info
                </h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-gray-600)' }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="input"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-gray-600)' }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="input"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-gray-600)' }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-gray-600)' }}>
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="input"
                      rows={2}
                      placeholder="123 Main St, City, State"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary w-full"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>First Name</p>
                      <p className="font-medium" style={{ color: 'var(--color-dark)' }}>
                        {user.first_name || <span className="text-gray-400">Not set</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>Last Name</p>
                      <p className="font-medium" style={{ color: 'var(--color-dark)' }}>
                        {user.last_name || <span className="text-gray-400">Not set</span>}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>Username</p>
                    <p className="font-medium" style={{ color: 'var(--color-dark)' }}>@{user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>Email</p>
                    <p className="font-medium" style={{ color: 'var(--color-dark)' }}>{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>Phone</p>
                    <p className="font-medium" style={{ color: 'var(--color-dark)' }}>
                      {user.phone || <span className="text-gray-400">Not set</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>Address</p>
                    <p className="font-medium" style={{ color: 'var(--color-dark)' }}>
                      {user.address || <span className="text-gray-400">Not set</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats Card */}
            <div className="card p-6">
              <h2 className="font-display text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
                Activity
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🛒</span>
                    <span style={{ color: 'var(--color-gray-700)' }}>Total Orders</span>
                  </div>
                  <span className="text-xl font-bold" style={{ color: 'var(--color-dark)' }}>
                    {myOrders.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <span style={{ color: 'var(--color-gray-700)' }}>Active Orders</span>
                  </div>
                  <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                    {myOrders.filter(o => !['completed', 'cancelled'].includes(o.status)).length}
                  </span>
                </div>

                {user.is_cook && (
                  <>
                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍽️</span>
                        <span style={{ color: 'var(--color-gray-700)' }}>Active Listings</span>
                      </div>
                      <span className="text-xl font-bold" style={{ color: 'var(--color-success)' }}>
                        {myListings.filter(l => l.available).length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📥</span>
                        <span style={{ color: 'var(--color-gray-700)' }}>Pending Orders</span>
                      </div>
                      <span className="text-xl font-bold" style={{ color: 'var(--color-warning)' }}>
                        {incomingOrders.filter(o => o.status === 'pending').length}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Orders Tab */}
        {activeTab === 'orders' && (
          <div>
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
                    className="card p-6 block hover:shadow-lg transition-all cursor-pointer"
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
                            Order #{order.id} • {formatDate(order.created_at)}
                          </p>
                          <div className="flex gap-4 text-sm" style={{ color: 'var(--color-gray-600)' }}>
                            <span>Qty: {order.quantity}</span>
                            <span>•</span>
                            <span>Pickup: {formatDate(order.pickup_time)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                          ${order.total_price}
                        </p>
                        <span className="text-gray-400">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Dishes Tab (Cooks Only) */}
        {activeTab === 'listings' && user.is_cook && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl" style={{ color: 'var(--color-dark)' }}>
                My Dishes
              </h2>
              <Link to="/create-listing" className="btn-primary">
                + Add Dish
              </Link>
            </div>
            
            {myListings.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="font-display text-2xl mb-2" style={{ color: 'var(--color-dark)' }}>
                  No dishes yet
                </h3>
                <p className="mb-6" style={{ color: 'var(--color-gray-600)' }}>
                  Create your first listing and start selling!
                </p>
                <Link to="/create-listing" className="btn-primary">
                  Create Listing
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myListings.map(listing => (
                  <div key={listing.id} className="card p-4">
                    <div className="flex gap-4">
                      {listing.image ? (
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                          <span className="text-2xl">🍽️</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-lg" style={{ color: 'var(--color-dark)' }}>
                            {listing.title}
                          </h3>
                          <span className={`text-sm px-2 py-0.5 rounded-full ${
                            listing.available 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {listing.available ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
                          ${listing.price}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Link
                            to={`/edit-listing/${listing.id}`}
                            className="text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                            style={{ color: 'var(--color-gray-700)' }}
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/listings/${listing.id}`}
                            className="text-sm px-3 py-1 rounded-full bg-orange-100 hover:bg-orange-200 transition-all"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Incoming Orders Tab (Cooks Only) */}
        {activeTab === 'incoming' && user.is_cook && (
          <div>
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
                  <IncomingOrderCard key={order.id} order={order} onUpdate={fetchData} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cook Profile Settings Tab */}
        {activeTab === 'cook-settings' && user.is_cook && (
          <div className="max-w-2xl">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-xl" style={{ color: 'var(--color-dark)' }}>
                  Cook Profile
                </h2>
                <button
                  onClick={() => setEditingCookProfile(!editingCookProfile)}
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {editingCookProfile ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editingCookProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-gray-600)' }}>
                      Bio
                    </label>
                    <textarea
                      value={cookFormData.bio}
                      onChange={(e) => setCookFormData({ ...cookFormData, bio: e.target.value })}
                      className="input"
                      rows={3}
                      placeholder="Tell customers about yourself and your cooking style..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-gray-600)' }}>
                      Kitchen Description
                    </label>
                    <textarea
                      value={cookFormData.kitchen_description}
                      onChange={(e) => setCookFormData({ ...cookFormData, kitchen_description: e.target.value })}
                      className="input"
                      rows={3}
                      placeholder="Describe your kitchen setup, certifications, specialties..."
                    />
                  </div>
                  <button
                    onClick={handleSaveCookProfile}
                    disabled={saving}
                    className="btn-primary w-full"
                  >
                    {saving ? 'Saving...' : 'Save Cook Profile'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-gray-500)' }}>Bio</p>
                    <p style={{ color: 'var(--color-dark)' }}>
                      {cookProfile?.bio || <span className="text-gray-400 italic">No bio yet - tell customers about yourself!</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-gray-500)' }}>Kitchen Description</p>
                    <p style={{ color: 'var(--color-dark)' }}>
                      {cookProfile?.kitchen_description || <span className="text-gray-400 italic">No description yet - describe your kitchen setup!</span>}
                    </p>
                  </div>
                  {cookProfile?.rating > 0 && (
                    <div>
                      <p className="text-sm mb-1" style={{ color: 'var(--color-gray-500)' }}>Rating</p>
                      <p className="text-2xl">
                        {'⭐'.repeat(Math.round(cookProfile.rating))} 
                        <span className="text-lg ml-2" style={{ color: 'var(--color-gray-600)' }}>
                          ({cookProfile.rating}/5)
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IncomingOrderCard({ order, onUpdate }) {
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/orders/${order.id}/update_status/`, { status: newStatus });
      onUpdate();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
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
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="card p-6">
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
        <div className="text-right">
          <p className="text-2xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
            ${order.total_price}
          </p>
          
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <div className="flex flex-wrap gap-2 justify-end">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateStatus('accepted')}
                    disabled={updating}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateStatus('cancelled')}
                    disabled={updating}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
                  >
                    Decline
                  </button>
                </>
              )}
              {order.status === 'accepted' && (
                <button
                  onClick={() => updateStatus('preparing')}
                  disabled={updating}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
                >
                  Start Preparing
                </button>
              )}
              {order.status === 'preparing' && (
                <button
                  onClick={() => updateStatus('ready')}
                  disabled={updating}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                >
                  Mark Ready
                </button>
              )}
              {order.status === 'ready' && (
                <button
                  onClick={() => updateStatus('completed')}
                  disabled={updating}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50"
                >
                  Complete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function ReviewForm({ orderId, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rating) return setError('Please select a rating');
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/orders/${orderId}/review/`, { rating, comment });
      onSubmit();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-orange-100" style={{ backgroundColor: 'var(--color-cream)' }}>
      <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-gray-700)' }}>
        Leave a Review
      </p>

      {/* Star Rating */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="text-2xl transition-transform hover:scale-110"
          >
            {star <= (hovered || rating) ? '⭐' : '☆'}
          </button>
        ))}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was your experience? (optional)"
        className="input w-full mb-3"
        rows={2}
      />

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting || !rating}
        className="btn-primary w-full disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
}
export default Profile;