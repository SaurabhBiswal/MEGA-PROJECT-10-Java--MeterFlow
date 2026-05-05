import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ApiManagement from './pages/ApiManagement';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

function App() {
  const isAuthenticated = !!sessionStorage.getItem('token');

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
        {isAuthenticated && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {isAuthenticated && <Navbar />}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/apis" element={isAuthenticated ? <ApiManagement /> : <Navigate to="/login" />} />
              <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
