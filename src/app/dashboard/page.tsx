'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, OrderStatus } from '@/types';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchData = async (token: string) => {
    try {
      const [resRest, resOrders] = await Promise.all([
        fetch('/api/restaurants', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (resRest.ok) setRestaurants(await resRest.json());
      if (resOrders.ok) setOrders(await resOrders.json());
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
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
        
        {/* Admin Banner */}
        {user?.role === UserRole.ADMIN && (
          <div className="mb-10 p-5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Admin Control Center</h2>
              <p className="text-sm text-slate-400">Global access privileges enabled.</p>
            </div>
            <div className="flex gap-3">
              <button className="text-xs font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm border border-white/10">
                Payment Methods
              </button>
              <button className="text-xs font-medium bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors shadow-sm">
                System Logs
              </button>
            </div>
          </div>
        )}

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
                  className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all duration-300 hover:-translate-y-1 group delay-${(idx % 3) * 100}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{r.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                          {r.cuisine}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <p className="text-xs text-slate-500">{r.address}</p>
                      </div>
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