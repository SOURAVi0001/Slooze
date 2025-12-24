'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, OrderStatus } from '@/types';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchData(token);
  }, []);

  const fetchData = async (token: string, queryParams = '') => {
    try {
      const [resRest, resOrders, resStats] = await Promise.all([
        fetch(`/api/restaurants?${queryParams}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (resRest.ok) {
        const restData = await resRest.json();
        setRestaurants(restData.data || []);
      }
      if (resOrders.ok) setOrders(await resOrders.json());
      if (resStats.ok) setStats(await resStats.json());
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (cuisine) params.append('cuisine', cuisine);
    fetchData(token!, params.toString());
  };

  const handleCancelOrder = async (orderId: string) => {
    const token = localStorage.getItem('token');
    // Optimistic UI update could go here
    const res = await fetch(`/api/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      fetchData(token!);
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to cancel order');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium animate-pulse">Loading experience...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900">
      
      {/* Glass Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-teal-500/20">
              S
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 tracking-tight">Slooze</h1>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <span>{user?.role}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>{user?.country}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:block">
              Hi, {user?.name.split(' ')[0]}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-full transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 animate-fade-in-up">
        
        {/* Advanced Stats Section */}
        {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && stats && (
          <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">${stats.summary.totalRevenue.toFixed(2)}</h3>
              <div className="mt-2 flex items-center gap-1 text-emerald-500 text-[10px] font-bold">
                <span>↑ 12% from last week</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.summary.totalOrders}</h3>
              <div className="mt-2 flex items-center gap-1 text-emerald-500 text-[10px] font-bold">
                <span>↑ 5% from last week</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Order Value</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                ${(stats.summary.totalRevenue / (stats.summary.totalOrders || 1)).toFixed(2)}
              </h3>
              <div className="mt-2 flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                <span>Stable performance</span>
              </div>
            </div>
          </div>
        )}

        {/* Popular Items (Advanced Feature) */}
        {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && stats?.popularItems?.length > 0 && (
          <div className="mb-10 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Trending Items</h3>
            <div className="flex flex-wrap gap-3">
              {stats.popularItems.map((item: any) => (
                <div key={item._id} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <span className="text-xs font-bold text-slate-700">{item.name}</span>
                  <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-md">{item.totalQuantity} sold</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search restaurants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
              <svg className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 transition-all"
            >
              <option value="">All Cuisines</option>
              <option value="Indian">Indian</option>
              <option value="American">American</option>
              <option value="Italian">Italian</option>
              <option value="Chinese">Chinese</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
            >
              Apply Filters
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Restaurants */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Nearby Restaurants</h2>
              <span className="text-xs font-medium px-2 py-1 bg-slate-200 text-slate-600 rounded-md">
                {restaurants.length} Found
              </span>
            </div>
            
            <div className="grid gap-5">
              {restaurants.length === 0 && (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-400 text-sm">No restaurants currently available in {user?.country}.</p>
                </div>
              )}
              
              {restaurants.map((r: any, idx) => (
                <div 
                  key={r._id} 
                  className={`bg-white overflow-hidden rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all duration-300 hover:-translate-y-1 group`}
                >
                  <div className="h-32 w-full relative overflow-hidden">
                    <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <span className="text-amber-500 text-xs">★</span>
                      <span className="text-[10px] font-bold text-slate-700">{r.rating || '4.5'}</span>
                    </div>
                    {r.isPromoted && (
                      <div className="absolute top-3 left-3 bg-teal-600 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter">
                        Promoted
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{r.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                            {r.cuisine}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <p className="text-xs text-slate-500">{r.address}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between text-[10px] font-medium text-slate-400">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{r.openingHours?.open} - {r.openingHours?.close}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>{r.menuItems?.length || 0} Items</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-50 flex gap-3">
                      <button className="flex-1 text-xs font-semibold py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                        View Menu
                      </button>
                      {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && (
                        <button className="flex-1 text-xs font-semibold py-2 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors">
                          Place Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right Column: Orders */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Order Activity</h2>
              <span className="text-xs font-medium text-slate-400">Recent</span>
            </div>

            <div className="grid gap-4">
              {orders.length === 0 && (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-400 text-sm">No recent orders found.</p>
                </div>
              )}
              
              {orders.map((o: any, idx) => (
                <div 
                  key={o._id} 
                  className={`bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">ID: {o._id.slice(-6)}</span>
                      <h3 className="font-semibold text-slate-800 text-sm mt-0.5">
                        {o.restaurantId?.name || 'Unknown Restaurant'}
                      </h3>
                    </div>
                    <p className="font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-lg text-sm border border-slate-100">
                      ${o.totalAmount}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                      o.status === OrderStatus.CANCELLED 
                        ? 'bg-red-50 text-red-600' 
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {o.status}
                    </span>

                    {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && o.status !== OrderStatus.CANCELLED && (
                      <button
                        onClick={() => handleCancelOrder(o._id)}
                        className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}