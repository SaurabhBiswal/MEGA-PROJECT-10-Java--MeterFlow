import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Shield, Bell, CheckCircle2, XCircle } from 'lucide-react';

interface UserProfile {
  email: string;
  fullName: string | null;
  usageAlerts: boolean;
  billingUpdates: boolean;
}

const Settings = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [usageAlerts, setUsageAlerts] = useState(true);
  const [billingUpdates, setBillingUpdates] = useState(true);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/v1/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setFullName(res.data.fullName || '');
      setUsageAlerts(res.data.usageAlerts);
      setBillingUpdates(res.data.billingUpdates);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile', error);
      showMessage('error', 'Failed to load profile data.');
      setIsLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:8080/api/v1/user/profile', {
        fullName,
        usageAlerts,
        billingUpdates
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile', error);
      showMessage('error', 'Failed to update profile.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:8080/api/v1/user/password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage('success', 'Password updated successfully!');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      console.error('Error updating password', error);
      showMessage('error', error.response?.data || 'Failed to update password. Check current password.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500 mt-1">Manage your account preferences and billing.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} className="mr-2" /> : <XCircle size={20} className="mr-2" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
        {/* Profile Section */}
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <User className="mr-3 text-indigo-500" size={24} />
            Profile Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name" 
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input type="email" value={profile?.email || ''} disabled className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl pl-11 pr-4 py-3 cursor-not-allowed" />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button onClick={handleSaveProfile} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-200">
              Save Changes
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <Shield className="mr-3 text-emerald-500" size={24} />
            Security
          </h3>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-slate-800">Password</h4>
              <p className="text-sm text-slate-500 mt-1">Change your password to keep your account secure.</p>
            </div>
            {!showPasswordForm && (
              <button onClick={() => setShowPasswordForm(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-medium transition-colors whitespace-nowrap w-fit">
                Update Password
              </button>
            )}
          </div>
          
          {showPasswordForm && (
            <form onSubmit={handleUpdatePassword} className="mt-6 bg-slate-50 p-6 rounded-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                  Confirm Change
                </button>
                <button type="button" onClick={() => setShowPasswordForm(false)} className="text-slate-500 hover:text-slate-700 font-medium px-4 py-2">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Notifications Section */}
        <div className="p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <Bell className="mr-3 text-orange-500" size={24} />
            Notifications
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <h4 className="font-semibold text-slate-800">Usage Alerts</h4>
                <p className="text-sm text-slate-500 mt-1">Get notified when you approach your API rate limits.</p>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={usageAlerts}
                  onChange={(e) => setUsageAlerts(e.target.checked)}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${usageAlerts ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                <div className={`dot absolute right-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${usageAlerts ? 'translate-x-0' : '-translate-x-6'}`}></div>
              </div>
            </label>
            <div className="h-px bg-slate-100 w-full my-4"></div>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <h4 className="font-semibold text-slate-800">Billing Updates</h4>
                <p className="text-sm text-slate-500 mt-1">Receive invoices and payment confirmations.</p>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={billingUpdates}
                  onChange={(e) => setBillingUpdates(e.target.checked)}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${billingUpdates ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                <div className={`dot absolute right-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${billingUpdates ? 'translate-x-0' : '-translate-x-6'}`}></div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
