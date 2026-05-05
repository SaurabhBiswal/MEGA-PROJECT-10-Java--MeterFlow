import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, KeyRound, Server, DollarSign, ArrowUpRight, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DailyUsage {
  date: string;
  requests: number;
}

interface Stats {
  totalRequests: number;
  activeApiKeys: number;
  amountDue: number;
  totalApis: number;
  chartData: DailyUsage[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [upgraded, setUpgraded] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upgraded') === 'true') {
      // Call confirm-upgrade to upgrade user role in backend
      const token = sessionStorage.getItem('token');
      axios.post('http://localhost:8080/api/v1/billing/confirm-upgrade', {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => {
        setUpgraded(true);
        setTimeout(() => setUpgraded(false), 5000);
        // Clean URL
        window.history.replaceState({}, '', '/');
      }).catch(console.error);
    }

    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/v1/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  const handleUpgrade = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post('http://localhost:8080/api/v1/billing/checkout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error('Failed to initiate upgrade', error);
      alert('Failed to start checkout. Please ensure Stripe keys are configured in backend.');
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const cards = [
    { title: 'Total Requests', value: stats.totalRequests.toLocaleString(), icon: <Activity className="text-blue-500" />, bg: 'bg-blue-500/10' },
    { title: 'Active API Keys', value: stats.activeApiKeys, icon: <KeyRound className="text-emerald-500" />, bg: 'bg-emerald-500/10' },
    { title: 'Amount Due', value: `$${stats.amountDue.toFixed(2)}`, icon: <DollarSign className="text-purple-500" />, bg: 'bg-purple-500/10' },
    { title: 'Active APIs', value: stats.totalApis, icon: <Server className="text-orange-500" />, bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {upgraded && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center animate-in slide-in-from-top-4">
          <Check size={20} className="mr-2" />
          <span className="font-medium">Success! Your account has been upgraded to the PRO plan. 🎉</span>
        </div>
      )}

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500 mt-1">Here's what's happening with your APIs today.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-200">
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bg}`}>
                {card.icon}
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                +12% <ArrowUpRight size={12} className="ml-0.5" />
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-slate-800">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">API Traffic</h3>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          {stats.chartData && stats.chartData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11}} dy={10}
                    tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                    labelFormatter={(l: string) => `Date: ${l}`}
                  />
                  <Area type="monotone" dataKey="requests" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRequests)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
              <Activity size={40} className="mb-3 opacity-30" />
              <p className="font-medium text-slate-500">No traffic data yet</p>
              <p className="text-sm mt-1">Make API calls through the gateway to see live analytics</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <h3 className="text-xl font-bold mb-2 relative z-10">Pro Plan</h3>
          <p className="text-indigo-100 text-sm mb-8 relative z-10">Upgrade for 100 req/min rate limit</p>
          
          <div className="mb-8 relative z-10">
            <p className="text-indigo-200 text-sm mb-1">Current Usage</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{stats.totalRequests.toLocaleString()}</span>
              <span className="text-indigo-200">/ 10,000</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full mt-4">
              <div 
                className="bg-white h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                style={{ width: `${Math.min((stats.totalRequests / 10000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <button 
            onClick={handleUpgrade}
            className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors relative z-10"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
