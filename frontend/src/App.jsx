import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MeetingDetail from './pages/MeetingDetail'; // <-- Import the new page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add the dynamic route for specific meeting files */}
        <Route path="/meeting/:filename" element={<MeetingDetail />} />
      </Routes>
    </Router>
  );
}

export default App;