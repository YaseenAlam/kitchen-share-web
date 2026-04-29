import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function CreateListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    cuisine_type: 'other',
    prep_time: '',
    servings: 1,
    dietary_tags: [],
    ingredients: '',
    allergens: [],
    spice_level: '',
    calories: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('getting');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

 // Customization options
  const [customOptions, setCustomOptions] = useState([]);
  const [addOnGroups, setAddOnGroups] = useState([]);

  const cuisineOptions = [
    { value: 'american', label: 'American' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'italian', label: 'Italian' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'indian', label: 'Indian' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'other', label: 'Other' },
  ];

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Halal', 'Kosher'];
  const allergenOptions = ['Nuts', 'Dairy', 'Gluten', 'Eggs', 'Soy', 'Shellfish', 'Fish'];
  const spiceLevels = [
    { value: '', label: 'Select spice level' },
    { value: 'none', label: '🌱 Not Spicy' },
    { value: 'mild', label: '🌶️ Mild' },
    { value: 'medium', label: '🌶️🌶️ Medium' },
    { value: 'hot', label: '🌶️🌶️🌶️ Hot' },
    { value: 'extra_hot', label: '🔥 Extra Hot' },
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationStatus('success');
        },
        () => setLocationStatus('denied')
      );
    } else {
      setLocationStatus('unavailable');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (field, tag) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(tag)
        ? prev[field].filter(t => t !== tag)
        : [...prev[field], tag]
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Custom Option Management
  const addCustomOption = () => {
    setCustomOptions([...customOptions, {
      name: '',
      required: false,
      options: [{ label: '', price: 0 }]
    }]);
  };

  const updateCustomOption = (index, field, value) => {
    const updated = [...customOptions];
    updated[index][field] = value;
    setCustomOptions(updated);
  };

  const addOptionChoice = (optionIndex) => {
    const updated = [...customOptions];
    updated[optionIndex].options.push({ label: '', price: 0 });
    setCustomOptions(updated);
  };

  const updateOptionChoice = (optionIndex, choiceIndex, field, value) => {
    const updated = [...customOptions];
    updated[optionIndex].options[choiceIndex][field] = field === 'price' ? parseFloat(value) || 0 : value;
    setCustomOptions(updated);
  };

  const removeCustomOption = (index) => {
    setCustomOptions(customOptions.filter((_, i) => i !== index));
  };

  const removeOptionChoice = (optionIndex, choiceIndex) => {
    const updated = [...customOptions];
    updated[optionIndex].options = updated[optionIndex].options.filter((_, i) => i !== choiceIndex);
    setCustomOptions(updated);
  };

  // Add-ons Management
  // Add-on Groups Management
  const addAddOnGroup = () => {
    setAddOnGroups([...addOnGroups, {
      name: '',
      items: [{ label: '', price: 0 }]
    }]);
  };

  const updateAddOnGroup = (index, field, value) => {
    const updated = [...addOnGroups];
    updated[index][field] = value;
    setAddOnGroups(updated);
  };

  const removeAddOnGroup = (index) => {
    setAddOnGroups(addOnGroups.filter((_, i) => i !== index));
  };

  const addAddOnItem = (groupIndex) => {
    const updated = [...addOnGroups];
    updated[groupIndex].items.push({ label: '', price: 0 });
    setAddOnGroups(updated);
  };

  const updateAddOnItem = (groupIndex, itemIndex, field, value) => {
    const updated = [...addOnGroups];
    updated[groupIndex].items[itemIndex][field] = field === 'price' ? parseFloat(value) || 0 : value;
    setAddOnGroups(updated);
  };

  const removeAddOnItem = (groupIndex, itemIndex) => {
    const updated = [...addOnGroups];
    updated[groupIndex].items = updated[groupIndex].items.filter((_, i) => i !== itemIndex);
    setAddOnGroups(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.title) {
      setError('Please enter a dish name');
      setStep(1);
      setLoading(false);
      return;
    }
    if (!formData.description) {
      setError('Please enter a description');
      setStep(1);
      setLoading(false);
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price');
      setStep(1);
      setLoading(false);
      return;
    }
    if (!formData.prep_time || parseInt(formData.prep_time) <= 0) {
      setError('Please enter prep time');
      setStep(1);
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('cuisine_type', formData.cuisine_type);
      data.append('prep_time', formData.prep_time);
      data.append('servings', formData.servings || 1);
      data.append('available', true);
      data.append('dietary_tags', JSON.stringify(formData.dietary_tags || []));
      data.append('ingredients', formData.ingredients || '');
      data.append('allergens', JSON.stringify(formData.allergens || []));
      data.append('spice_level', formData.spice_level || '');
      if (formData.calories) data.append('calories', formData.calories);
      
      // Filter out empty options
      // Filter and clean customization options
      const validOptions = customOptions
        .filter(o => o.name && o.options.some(opt => opt.label))
        .map(o => ({
          name: o.name,
          required: o.required || false,
          options: o.options
            .filter(opt => opt.label)
            .map(opt => ({
              label: opt.label,
              price: parseFloat(opt.price) || 0
            }))
        }));
      data.append('customization_options', JSON.stringify(validOptions));
      
      // Filter and clean add-ons
      // Filter and clean add-on groups
      const validAddOnGroups = addOnGroups
        .filter(g => g.name && g.items.some(item => item.label))
        .map(g => ({
          name: g.name,
          items: g.items
            .filter(item => item.label)
            .map(item => ({
              label: item.label,
              price: parseFloat(item.price) || 0
            }))
        }));
      data.append('add_ons', JSON.stringify(validAddOnGroups));
      
      if (location) {
        data.append('latitude', location.lat.toFixed(6));
        data.append('longitude', location.lng.toFixed(6));
      }
      
      if (image) {
        data.append('image', image);
      }

      console.log('customization_options:', JSON.stringify(validOptions));
      console.log('add_ons:', JSON.stringify(validAddOnGroups));      
      // Log all form data
      for (let [key, value] of data.entries()) {
        console.log(`${key}:`, value);
      }

      await api.post('/listings/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/');
    }  catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      // Handle different error formats
      const errorData = err.response?.data;
      if (errorData) {
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else if (typeof errorData === 'object') {
          // Field-level errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${msg}`;
            })
            .join('\n');
          setError(fieldErrors || 'Failed to create listing');
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to create listing. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user?.is_cook) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="card p-8 text-center max-w-md">
          <div className="text-6xl mb-4">👨‍🍳</div>
          <h2 className="font-display text-2xl mb-4" style={{ color: 'var(--color-dark)' }}>
            Become a Cook First
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-gray-600)' }}>
            You need to register as a cook to create listings.
          </p>
          <button
            onClick={async () => {
              await api.post('/auth/become-cook/');
              window.location.reload();
            }}
            className="btn-primary"
          >
            Become a Cook
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { num: 1, label: 'Basics' },
            { num: 2, label: 'Details' },
            { num: 3, label: 'Customize' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => setStep(s.num)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step === s.num
                    ? 'text-white'
                    : step > s.num
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
                style={step === s.num ? { backgroundColor: 'var(--color-primary)' } : {}}
              >
                {step > s.num ? '✓' : s.num}
              </button>
              <span className={`ml-2 font-medium ${step === s.num ? 'text-orange-600' : 'text-gray-500'}`}>
                {s.label}
              </span>
              {i < 2 && <div className="w-12 h-0.5 bg-gray-200 mx-4"></div>}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="card p-6 space-y-6">
              <h2 className="font-display text-2xl" style={{ color: 'var(--color-dark)' }}>
                Basic Information
              </h2>

              {/* Location Status */}
              <div className={`p-4 rounded-xl ${
                locationStatus === 'success' ? 'bg-green-50 text-green-700' :
                locationStatus === 'denied' ? 'bg-yellow-50 text-yellow-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {locationStatus === 'getting' && '📍 Getting your location...'}
                {locationStatus === 'success' && '✓ Location set - neighbors will find your dish!'}
                {locationStatus === 'denied' && '⚠️ Location denied - dish won\'t appear in nearby searches'}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                  Dish Photo
                </label>
                <div 
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 transition-all"
                  onClick={() => document.getElementById('image-input').click()}
                  style={{ borderColor: imagePreview ? 'var(--color-primary)' : 'var(--color-gray-300)' }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  ) : (
                    <>
                      <div className="text-4xl mb-2">📸</div>
                      <p style={{ color: 'var(--color-gray-500)' }}>Click to upload a photo</p>
                    </>
                  )}
                </div>
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                  Dish Name *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. Grandma's Famous Lasagna"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input"
                  rows={4}
                  placeholder="Describe your dish - what makes it special, the story behind it..."
                  required
                />
              </div>

              {/* Price, Prep Time, Servings */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="input"
                    min="0"
                    step="0.01"
                    placeholder="12.99"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                    Prep Time (min) *
                  </label>
                  <input
                    type="number"
                    name="prep_time"
                    value={formData.prep_time}
                    onChange={handleChange}
                    className="input"
                    min="1"
                    placeholder="30"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                    Servings *
                  </label>
                  <input
                    type="number"
                    name="servings"
                    value={formData.servings}
                    onChange={handleChange}
                    className="input"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Cuisine Type */}
              <div>
                <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                  Cuisine Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, cuisine_type: opt.value })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.cuisine_type === opt.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary w-full"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="card p-6 space-y-6">
              <h2 className="font-display text-2xl" style={{ color: 'var(--color-dark)' }}>
                Dish Details
              </h2>

              {/* Ingredients */}
              <div>
                <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                  Main Ingredients
                </label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  className="input"
                  rows={3}
                  placeholder="e.g. Fresh pasta, tomatoes, basil, mozzarella, parmesan..."
                />
              </div>

              {/* Dietary Tags */}
              <div>
                <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                  Dietary Options
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle('dietary_tags', tag)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        formData.dietary_tags.includes(tag)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergens */}
              <div>
                <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                  Contains Allergens
                </label>
                <div className="flex flex-wrap gap-2">
                  {allergenOptions.map(allergen => (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => handleTagToggle('allergens', allergen)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        formData.allergens.includes(allergen)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      ⚠️ {allergen}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spice Level */}
              <div>
                <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                  Spice Level
                </label>
                <select
                  name="spice_level"
                  value={formData.spice_level}
                  onChange={handleChange}
                  className="input"
                >
                  {spiceLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              {/* Calories */}
              <div>
                <label className="block font-medium mb-2" style={{ color: 'var(--color-gray-700)' }}>
                  Calories (optional)
                </label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. 450"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary flex-1"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Customizations */}
          {step === 3 && (
            <div className="card p-6 space-y-6">
              <h2 className="font-display text-xl" style={{ color: 'var(--color-dark)' }}>
                Customization Options
              </h2>
              <p style={{ color: 'var(--color-gray-600)' }}>
                Let customers customize their order - add size options, toppings, and more!
              </p>

              {/* Custom Options (Single Select) */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <label className="font-medium" style={{ color: 'var(--color-gray-700)' }}>
                      Options (Pick One)
                    </label>
                    <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>
                      e.g. Size, Spice Level - customer picks one choice
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addCustomOption}
                    className="text-sm font-medium px-3 py-1 rounded-full bg-orange-100 hover:bg-orange-200 transition-all"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    + Add Option
                  </button>
                </div>

                {customOptions.length === 0 && (
                  <p className="text-sm p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-gray-500)' }}>
                    No options yet. Add options like "Size" or "Spice Level".
                  </p>
                )}

                {customOptions.map((option, optIndex) => (
                  <div key={optIndex} className="p-4 rounded-xl mb-4 border-2 border-blue-100" style={{ backgroundColor: '#f0f9ff' }}>
                    <div className="flex gap-4 mb-3">
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) => updateCustomOption(optIndex, 'name', e.target.value)}
                        className="input flex-1"
                        placeholder="Option name (e.g. Size)"
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={option.required}
                          onChange={(e) => updateCustomOption(optIndex, 'required', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm" style={{ color: 'var(--color-gray-600)' }}>Required</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeCustomOption(optIndex)}
                        className="text-red-500 hover:text-red-700 text-xl"
                      >
                        ×
                      </button>
                    </div>

                    <p className="text-sm mb-2 ml-1" style={{ color: 'var(--color-gray-500)' }}>Choices (customer picks one):</p>
                    {option.options.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex gap-2 mb-2 ml-4">
                        <input
                          type="text"
                          value={choice.label}
                          onChange={(e) => updateOptionChoice(optIndex, choiceIndex, 'label', e.target.value)}
                          className="input flex-1"
                          placeholder="Choice (e.g. Large)"
                        />
                        <div className="flex items-center gap-1 bg-white rounded-xl border-2 border-gray-100 px-3">
                          <span className="text-gray-400 text-sm">+$</span>
                          <input
                            type="number"
                            value={choice.price || ''}
                            onChange={(e) => updateOptionChoice(optIndex, choiceIndex, 'price', e.target.value)}
                            className="w-16 py-3 outline-none text-right"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        {option.options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOptionChoice(optIndex, choiceIndex)}
                            className="text-red-400 hover:text-red-600 px-2"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOptionChoice(optIndex)}
                      className="text-sm ml-4 mt-2 text-blue-600 hover:text-blue-700"
                    >
                      + Add Choice
                    </button>
                  </div>
                ))}
              </div>

              {/* Add-on Groups (Multi Select) */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <label className="font-medium" style={{ color: 'var(--color-gray-700)' }}>
                      Add-ons (Pick Multiple)
                    </label>
                    <p className="text-sm" style={{ color: 'var(--color-gray-500)' }}>
                      e.g. Toppings, Extras - customer can pick multiple
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addAddOnGroup}
                    className="text-sm font-medium px-3 py-1 rounded-full bg-green-100 hover:bg-green-200 transition-all text-green-700"
                  >
                    + Add Group
                  </button>
                </div>

                {addOnGroups.length === 0 && (
                  <p className="text-sm p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-gray-500)' }}>
                    No add-on groups yet. Create groups like "Proteins", "Toppings", or "Extras".
                  </p>
                )}

                {addOnGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="p-4 rounded-xl mb-4 border-2 border-green-100" style={{ backgroundColor: '#f0fdf4' }}>
                    <div className="flex gap-4 mb-3">
                      <input
                        type="text"
                        value={group.name}
                        onChange={(e) => updateAddOnGroup(groupIndex, 'name', e.target.value)}
                        className="input flex-1"
                        placeholder="Group name (e.g. Toppings, Proteins, Extras)"
                      />
                      <button
                        type="button"
                        onClick={() => removeAddOnGroup(groupIndex)}
                        className="text-red-500 hover:text-red-700 text-xl"
                      >
                        ×
                      </button>
                    </div>

                    <p className="text-sm mb-2 ml-1" style={{ color: 'var(--color-gray-500)' }}>Items (customer can pick multiple):</p>
                    {group.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex gap-2 mb-2 ml-4">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => updateAddOnItem(groupIndex, itemIndex, 'label', e.target.value)}
                          className="input flex-1"
                          placeholder="Item (e.g. Extra Cheese)"
                        />
                        <div className="flex items-center gap-1 bg-white rounded-xl border-2 border-gray-100 px-3">
                          <span className="text-gray-400 text-sm">+$</span>
                          <input
                            type="number"
                            value={item.price || ''}
                            onChange={(e) => updateAddOnItem(groupIndex, itemIndex, 'price', e.target.value)}
                            className="w-16 py-3 outline-none text-right"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        {group.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAddOnItem(groupIndex, itemIndex)}
                            className="text-red-400 hover:text-red-600 px-2"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addAddOnItem(groupIndex)}
                      className="text-sm ml-4 mt-2 text-green-600 hover:text-green-700"
                    >
                      + Add Item
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary flex-1"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Creating...' : 'Create Listing 🎉'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateListing;