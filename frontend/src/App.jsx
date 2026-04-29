import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Listings from './pages/Listings';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import EditListing from './pages/EditListing';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import CookSetup from './pages/CookSetup';
import CookProfile from './pages/CookProfile';
import OrderConfirmation from './pages/OrderConfirmation';
import Footer from './components/common/Footer';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Listings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/listings" element={<Navigate to="/" replace />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/edit-listing/:id" element={<EditListing />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cook-setup" element={<CookSetup />} />
              <Route path="/cook/:username" element={<CookProfile />} />
              <Route path="/order/:id" element={<OrderConfirmation />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;