import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingCook, setIsEditingCook] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  
  // Cook profile form
  const [cookForm, setCookForm] = useState({
    bio: '',
    years_experience: 0,
    cuisine_specialties: [],
    accepted_payments: [],
    available_days: [],
    pickup_instructions: '',
    payment_notes: '',
  });

  const cuisineOptions = [
    { value: 'american', label: '🍔 American' },
    { value: 'mexican', label: '🌮 Mexican' },
    { value: 'italian', label: '🍝 Italian' },
    { value: 'chinese', label: '🥡 Chinese' },
    { value: 'japanese', label: '🍱 Japanese' },
    { value: 'korean', label: '🍜 Korean' },
    { value: 'indian', label: '🍛 Indian' },
    { value: 'thai', label: '🍲 Thai' },
    { value: 'vietnamese', label: '🍜 Vietnamese' },
    { value: 'mediterranean', label: '🥙 Mediterranean' },
    { value: 'middle_eastern', label: '🧆 Middle Eastern' },
    { value: 'african', label: '🍖 African' },
    { value: 'caribbean', label: '🥥 Caribbean' },
    { value: 'french', label: '🥐 French' },
    { value: 'other', label: '🍽️ Other' },
  ];

  const paymentOptions = [
    { value: 'cash', label: '💵 Cash', icon: '💵' },
    { value: 'venmo', label: '📱 Venmo', icon: '📱' },
    { value: 'zelle', label: '💳 Zelle', icon: '💳' },
    { value: 'paypal', label: '🅿️ PayPal', icon: '🅿️' },
    { value: 'cashapp', label: '💲 Cash App', icon: '💲' },
    { value: 'apple_pay', label: '🍎 Apple Pay', icon: '🍎' },
  ];

  const dayOptions = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [ordersRes, cookProfileRes] = await Promise.all([
        api.get('/orders/'),
        user?.is_cook ? api.get('/auth/cook-profile/').catch(() => null) : null,
      ]);

      setOrders(ordersRes.data.results || ordersRes.data || []);

      if (cookProfileRes?.data) {
        setCookForm({
          bio: cookProfileRes.data.bio || '',
          years_experience: cookProfileRes.data.years_experience || 0,
          cuisine_specialties: cookProfileRes.data.cuisine_specialties || [],
          accepted_payments: cookProfileRes.data.accepted_payments || [],
          available_days: cookProfileRes.data.available_days || [],
          pickup_instructions: cookProfileRes.data.pickup_instructions || '',
          payment_notes: cookProfileRes.data.payment_notes || '',
        });
      }

      if (user?.is_cook) {
        const [listingsRes, incomingRes] = await Promise.all([
          api.get(`/listings/?cook=${user.username}`),
          api.get('/orders/incoming/'),
        ]);
        setMyListings(listingsRes.data.results || listingsRes.data || []);
        setIncomingOrders(incomingRes.data.results || incomingRes.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('profile_image', file);

    try {
      const response = await api.patch('/auth/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(response.data);
      setSaveStatus('Photo updated!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Failed to upload photo:', error);
      setSaveStatus('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await api.patch('/auth/me/', profileForm);
      setUser(response.data);
      setIsEditingProfile(false);
      setSaveStatus('Profile saved!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveStatus('Failed to save');
    }
  };

  const handleSaveCookProfile = async () => {
    try {
      await api.patch('/auth/cook-profile/', cookForm);
      setIsEditingCook(false);
      setSaveStatus('Cook profile saved!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Failed to save cook profile:', error);
      setSaveStatus('Failed to save');
    }
  };

  const toggleArrayItem = (array, item, setter, field) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    setter(prev => ({ ...prev, [field]: newArray }));
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/update_status/`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="text-6xl animate-bounce">👨‍🍳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile Photo */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg">
                {user?.profile_image ? (
                  <img src={user.profile_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-4xl"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    👤
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center"
              >
                <span className="text-white text-sm font-medium">
                  {uploadingPhoto ? '...' : '📷 Edit'}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl" style={{ color: 'var(--color-dark)' }}>
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username}
                </h1>
                {user?.is_cook && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                    👨‍🍳 Cook
                  </span>
                )}
              </div>
              <p className="text-gray-500 mb-4">@{user?.username} • {user?.email}</p>
              
              {saveStatus && (
                <div className="inline-block px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium mb-4">
                  ✓ {saveStatus}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {user?.is_cook && (
                  <Link
                    to={`/cook/${user.username}`}
                    className="px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all hover:shadow-md"
                    style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                  >
                    View Public Profile →
                  </Link>
                )}
                {!user?.is_cook && (
                  <Link
                    to="/cook-setup"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    🍳 Become a Cook
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-sm font-medium border-2 border-gray-300 text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: '👤 Profile' },
              { id: 'orders', label: '📦 My Orders' },
              ...(user?.is_cook ? [
                { id: 'cook-profile', label: '👨‍🍳 Cook Settings' },
                { id: 'my-dishes', label: '🍽️ My Dishes' },
                { id: 'incoming', label: '📥 Incoming Orders' },
              ] : []),
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl" style={{ color: 'var(--color-dark)' }}>
                  Personal Information
                </h2>
                <button
                  onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ 
                    backgroundColor: isEditingProfile ? 'var(--color-primary)' : 'var(--color-cream)',
                    color: isEditingProfile ? 'white' : 'var(--color-dark)'
                  }}
                >
                  {isEditingProfile ? 'Save Changes' : 'Edit'}
                </button>
              </div>

              {isEditingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium" style={{ color: 'var(--color-dark)' }}>
                      {user?.first_name && user?.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium" style={{ color: 'var(--color-dark)' }}>@{user?.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium" style={{ color: 'var(--color-dark)' }}>{user?.email}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-display text-xl mb-6" style={{ color: 'var(--color-dark)' }}>
                Quick Stats
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
                  <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{orders.length}</p>
                  <p className="text-sm text-gray-500">Orders Placed</p>
                </div>
                {user?.is_cook && (
                  <>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
                      <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{myListings.length}</p>
                      <p className="text-sm text-gray-500">Active Dishes</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
                      <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                        {incomingOrders.filter(o => o.status === 'pending').length}
                      </p>
                      <p className="text-sm text-gray-500">Pending Orders</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
                      <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                        {incomingOrders.filter(o => o.status === 'completed').length}
                      </p>
                      <p className="text-sm text-gray-500">Completed</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cook Profile Tab */}
        {activeTab === 'cook-profile' && user?.is_cook && (
          <div className="space-y-6">
            {/* Bio Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl" style={{ color: 'var(--color-dark)' }}>
                  👨‍🍳 Cook Profile
                </h2>
                <button
                  onClick={() => isEditingCook ? handleSaveCookProfile() : setIsEditingCook(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ 
                    backgroundColor: isEditingCook ? 'var(--color-primary)' : 'var(--color-cream)',
                    color: isEditingCook ? 'white' : 'var(--color-dark)'
                  }}
                >
                  {isEditingCook ? 'Save All Changes' : 'Edit Profile'}
                </button>
              </div>

              {isEditingCook ? (
                <div className="space-y-6">
                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={cookForm.bio}
                      onChange={(e) => setCookForm({ ...cookForm, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none"
                      placeholder="Tell customers about yourself and your cooking..."
                    />
                  </div>

                  {/* Years Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={cookForm.years_experience}
                      onChange={(e) => setCookForm({ ...cookForm, years_experience: parseInt(e.target.value) || 0 })}
                      className="w-32 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Pickup Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Instructions</label>
                    <textarea
                      value={cookForm.pickup_instructions}
                      onChange={(e) => setCookForm({ ...cookForm, pickup_instructions: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none"
                      placeholder="e.g., Text when you arrive, I'll bring it out to you"
                    />
                  </div>

                  <button
                    onClick={() => setIsEditingCook(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Bio</p>
                    <p style={{ color: 'var(--color-dark)' }}>{cookForm.bio || 'No bio set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium" style={{ color: 'var(--color-dark)' }}>{cookForm.years_experience} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pickup Instructions</p>
                    <p style={{ color: 'var(--color-dark)' }}>{cookForm.pickup_instructions || 'Not set'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Cuisine Specialties */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-display text-lg mb-4" style={{ color: 'var(--color-dark)' }}>
                🍳 Cuisine Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {cuisineOptions.map(cuisine => (
                  <button
                    key={cuisine.value}
                    onClick={() => toggleArrayItem(cookForm.cuisine_specialties, cuisine.value, setCookForm, 'cuisine_specialties')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      cookForm.cuisine_specialties.includes(cuisine.value)
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={cookForm.cuisine_specialties.includes(cuisine.value) ? { backgroundColor: 'var(--color-primary)' } : {}}
                  >
                    {cuisine.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Click to select/deselect • Changes save automatically</p>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-display text-lg mb-4" style={{ color: 'var(--color-dark)' }}>
                💳 Accepted Payment Methods
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {paymentOptions.map(payment => (
                  <button
                    key={payment.value}
                    onClick={() => toggleArrayItem(cookForm.accepted_payments, payment.value, setCookForm, 'accepted_payments')}
                    className={`p-4 rounded-xl text-left transition-all border-2 ${
                      cookForm.accepted_payments.includes(payment.value)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{payment.icon}</span>
                    <span className={`text-sm font-medium ${
                      cookForm.accepted_payments.includes(payment.value) ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      {payment.label.split(' ')[1]}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Payment Notes */}
              <div className="mt-4 pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Notes (optional)</label>
                <input
                  type="text"
                  value={cookForm.payment_notes}
                  onChange={(e) => setCookForm({ ...cookForm, payment_notes: e.target.value })}
                  onBlur={handleSaveCookProfile}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                  placeholder="e.g., Venmo @myhandle, prefer cash for orders under $10"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-display text-lg mb-4" style={{ color: 'var(--color-dark)' }}>
                📅 Availability
              </h3>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map(day => (
                  <button
                    key={day.value}
                    onClick={() => toggleArrayItem(cookForm.available_days, day.value, setCookForm, 'available_days')}
                    className={`w-14 h-14 rounded-xl text-sm font-medium transition-all ${
                      cookForm.available_days.includes(day.value)
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    style={cookForm.available_days.includes(day.value) ? { backgroundColor: 'var(--color-primary)' } : {}}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Select days you're available to cook</p>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveCookProfile}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Save Cook Profile
            </button>
          </div>
        )}

        {/* My Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl mb-6" style={{ color: 'var(--color-dark)' }}>My Orders</h2>
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-500 mb-4">No orders yet</p>
                <Link to="/" className="btn-primary">Browse Dishes</Link>
              </div>
            ) : (
              orders.map(order => (
                <Link
                  key={order.id}
                  to={`/order/${order.id}`}
                  className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {order.listing_image ? (
                        <img src={order.listing_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate" style={{ color: 'var(--color-dark)' }}>{order.listing_title}</h3>
                      <p className="text-sm text-gray-500">Qty: {order.quantity} • ${order.total_price}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* My Dishes Tab */}
        {activeTab === 'my-dishes' && user?.is_cook && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl" style={{ color: 'var(--color-dark)' }}>My Dishes</h2>
              <Link
                to="/create-listing"
                className="px-4 py-2 rounded-xl font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                + Add New Dish
              </Link>
            </div>
            {myListings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">🍳</div>
                <p className="text-gray-500 mb-4">No dishes yet</p>
                <Link to="/create-listing" className="btn-primary">Create Your First Dish</Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myListings.map(listing => (
                  <Link
                    key={listing.id}
                    to={`/listings/${listing.id}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="h-32 bg-gray-100">
                      {listing.image ? (
                        <img src={listing.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium truncate" style={{ color: 'var(--color-dark)' }}>{listing.title}</h3>
                      <p className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>${listing.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Incoming Orders Tab */}
        {activeTab === 'incoming' && user?.is_cook && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl mb-6" style={{ color: 'var(--color-dark)' }}>Incoming Orders</h2>
            {incomingOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500">No incoming orders</p>
              </div>
            ) : (
              incomingOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {order.listing_image ? (
                        <img src={order.listing_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium" style={{ color: 'var(--color-dark)' }}>{order.listing_title}</h3>
                          <p className="text-sm text-gray-500">From: {order.buyer_name} • Qty: {order.quantity}</p>
                        </div>
                        <p className="font-bold" style={{ color: 'var(--color-primary)' }}>${order.total_price}</p>
                      </div>
                      
                      {order.notes && (
                        <p className="text-sm text-gray-600 mb-3 p-2 rounded-lg bg-gray-50">📝 {order.notes}</p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                              style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                            >
                              ✕ Decline
                            </button>
                          </>
                        )}
                        {order.status === 'accepted' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                          >
                            🍳 Start Preparing
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all bg-green-500"
                          >
                            ✓ Mark Ready
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all bg-blue-500"
                          >
                            🎉 Complete Order
                          </button>
                        )}
                        <span className={`px-3 py-2 rounded-lg text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'preparing' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'accepted' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;