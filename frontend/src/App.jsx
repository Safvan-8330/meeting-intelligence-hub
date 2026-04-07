import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MeetingDetail from './pages/MeetingDetail';
import About from './pages/About'; 
import Profile from './pages/Profile';
import Navbar from './components/Layout/Navbar'; 
import Footer from './components/Layout/Footer';

function App() {
  useEffect(() => {
    async function refreshProfile() {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const res = await fetch('https://meeting-intelligence-hub-1.onrender.com/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) return
        const j = await res.json()
        const user = j.user || j
        localStorage.setItem('profile', JSON.stringify(user))
        try { window.dispatchEvent(new CustomEvent('profile:update', { detail: user })) } catch (e) {}
      } catch (e) {
        // ignore
      }
    }
    refreshProfile()
  }, [])

  return (
    <Router>
      {/* This wrapper forces the page to be at least the height of the screen.
        flex-col and flex-grow push the Footer all the way to the bottom!
      */}
      <div className="flex flex-col min-h-screen bg-slate-950">
        
        {/* The Navbar sits at the top of every page */}
        <Navbar /> 
        
        {/* The main content area takes up the remaining space */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/meeting/:filename" element={<MeetingDetail />} />
          </Routes>
        </main>
        
        {/* The Footer sits at the bottom of every page */}
        <Footer />
        
      </div>
    </Router>
  );
}

export default App;