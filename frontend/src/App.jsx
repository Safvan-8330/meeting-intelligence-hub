import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

import Home from './pages/Home';
import MeetingDetail from './pages/MeetingDetail';
import About from './pages/About'; 
import Profile from './pages/Profile';
import Login from './pages/Login'; 
import Navbar from './components/Layout/Navbar'; 
import Footer from './components/Layout/Footer';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-950">
        
        {/* Only show Navbar/Footer if logged in */}
        {session && <Navbar session={session} />} 
        
        <main className="flex-grow">
          <Routes>
            {/* 1. PUBLIC ROUTE: Login */}
            <Route 
              path="/login" 
              element={!session ? <Login onLogin={(s) => setSession(s)} /> : <Navigate to="/" />} 
            />

            {/* 2. PROTECTED ROUTES: Redirect to login if no session */}
            <Route 
              path="/" 
              element={session ? <Home /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/about" 
              element={session ? <About /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={session ? <Profile session={session} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/meeting/:filename" 
              element={session ? <MeetingDetail /> : <Navigate to="/login" />} 
            />

            {/* 3. CATCH-ALL: Redirect unknown paths */}
            <Route path="*" element={<Navigate to={session ? "/" : "/login"} />} />
          </Routes>
        </main>
        
        {session && <Footer />}
        
      </div>
    </Router>
  );
}

export default App;