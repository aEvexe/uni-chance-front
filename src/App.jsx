import { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Verify from './pages/Verify.jsx';
import Forgot from './pages/Forgot.jsx';
import Universities from './pages/Universities.jsx';
import University from './pages/University.jsx';
import Predictions from './pages/Predictions.jsx';
import Prediction from './pages/Prediction.jsx';
import Landing from './pages/Landing.jsx';
import OAuthCallback from './pages/OAuthCallback.jsx';
import Splash from './pages/Splash.jsx';
import Pricing from './pages/Pricing.jsx';

function PrivateRoute({ children }) {
  const loggedIn = localStorage.getItem('isLoggedIn');
  return loggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashDone = useCallback(() => setSplashDone(true), []);

  return (
    <>
      {!splashDone && <Splash onDone={handleSplashDone} />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/universities" element={<PrivateRoute><Universities /></PrivateRoute>} />
        <Route path="/universities/:id" element={<PrivateRoute><University /></PrivateRoute>} />
        <Route path="/predictions" element={<PrivateRoute><Predictions /></PrivateRoute>} />
        <Route path="/predictions/:id" element={<PrivateRoute><Prediction /></PrivateRoute>} />
        <Route path="/pricing" element={<PrivateRoute><Pricing /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
