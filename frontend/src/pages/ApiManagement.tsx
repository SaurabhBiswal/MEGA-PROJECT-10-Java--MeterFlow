import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Copy, Check, KeyRound, Server, AlertTriangle } from 'lucide-react';

interface Api {
  id: number;
  name: string;
  targetBaseUrl: string;
}

interface ApiKey {
  id: number;
  apiId: number;
  keyIdentifier: string;
  maskedKey: string;
  status: string;
  rawKey?: string;
}

const ApiManagement = () => {
  const [apis, setApis] = useState<Api[]>([]);
  const [keys, setKeys] = useState<Record<number, ApiKey[]>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newApiName, setNewApiName] = useState('');
  const [newApiUrl, setNewApiUrl] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);

  const fetchApis = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/v1/apis', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApis(res.data);
      res.data.forEach((api: Api) => fetchKeys(api.id));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchKeys = async (apiId: number) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`http://localhost:8080/api/v1/apis/${apiId}/keys`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKeys(prev => ({ ...prev, [apiId]: res.data }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchApis();
  }, []);

  const handleCreateApi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      await axios.post('http://localhost:8080/api/v1/apis', 
        { name: newApiName, targetBaseUrl: newApiUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewApiName('');
      setNewApiUrl('');
      setShowCreate(false);
      fetchApis();
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateKey = async (apiId: number) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(`http://localhost:8080/api/v1/apis/${apiId}/keys`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewRawKey(res.data.rawKey);
      fetchKeys(apiId);
    } catch (error) {
      console.error(error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {newRawKey && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Save Your API Key</h3>
            <p className="text-sm text-slate-500 mb-6">
              Please copy this API key now. For your security, <strong className="text-slate-700">it will never be shown again</strong>.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between mb-6">
              <code className="text-sm font-bold text-slate-800 break-all">{newRawKey}</code>
              <button 
                onClick={() => copyToClipboard(newRawKey)}
                className="ml-4 p-2 bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-lg transition-all"
              >
                {copiedKey === newRawKey ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </button>
            </div>
            <button 
              onClick={() => setNewRawKey(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              I have saved this key safely
            </button>
          </div>
        </div>
      )}

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">API Management</h2>
          <p className="text-slate-500 mt-1">Configure your APIs and manage access keys.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-200 flex items-center"
        >
          <Plus size={20} className="mr-2" /> New API
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-indigo-100 mb-8 transform transition-all">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Register New API</h3>
          <form onSubmit={handleCreateApi} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">API Name</label>
              <input
                type="text"
                value={newApiName}
                onChange={e => setNewApiName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                placeholder="e.g. Weather Service"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Base URL</label>
              <input
                type="url"
                value={newApiUrl}
                onChange={e => setNewApiUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                placeholder="e.g. https://api.weatherapi.com/v1"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-md">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {apis.map(api => (
          <div key={api.id} className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4">
                  <Server size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{api.name}</h3>
                  <p className="text-sm text-slate-500">{api.targetBaseUrl}</p>
                </div>
              </div>
              <button 
                onClick={() => handleGenerateKey(api.id)}
                className="flex items-center text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
              >
                <KeyRound size={16} className="mr-2" /> Generate Key
              </button>
            </div>
            
            <div className="p-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Active Keys</h4>
              {keys[api.id]?.length > 0 ? (
                <div className="space-y-3">
                  {keys[api.id].map(key => (
                    <div key={key.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${key.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                        <code className="text-sm font-mono text-slate-700 select-all">{key.maskedKey}</code>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(key.maskedKey)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                        title="Copy to clipboard"
                      >
                        {copiedKey === key.maskedKey ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No keys generated yet.</p>
              )}
            </div>
          </div>
        ))}

        {apis.length === 0 && !showCreate && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <Server className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-700 mb-2">No APIs configured</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Get started by registering an external API to protect and monitor it with MeterFlow.</p>
            <button 
              onClick={() => setShowCreate(true)}
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-6 py-2.5 rounded-xl font-bold transition-colors"
            >
              Register First API
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiManagement;
