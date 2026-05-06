import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me/');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    await fetchUser();
    return response.data;
  };

  const register = async (username, email, password, ConfirmPassword) => {
  await api.post('/auth/register/', {
    username,
    email,
    password,
    password_confirm: ConfirmPassword,
  });
  // Auto-login after successful registration
  return await login(username, password);
};

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const becomeCook = async () => {
    try {
      const response = await api.post('/auth/become-cook/');
      // Refresh user data
      const userResponse = await api.get('/auth/me/');
      setUser(userResponse.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const unenrollCook = async () => {
    const response = await api.post('/auth/unenroll-cook/');
    // Refresh user data so is_cook flips to false in the UI
    const userResponse = await api.get('/auth/me/');
    setUser(userResponse.data);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, becomeCook, unenrollCook }}>      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);