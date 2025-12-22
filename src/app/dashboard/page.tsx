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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
            <p className="text-gray-600">Role: {user?.role} | Country: {user?.country}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Restaurants Section */}
          <section className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Available Restaurants</h2>
            <div className="space-y-4">
              {restaurants.length === 0 && <p>No restaurants found for your location.</p>}
              {restaurants.map((r: any) => (
                <div key={r._id} className="border-b pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{r.name}</h3>
                    <p className="text-sm text-gray-500">{r.cuisine} • {r.address}</p>
                  </div>
                  {/* RBAC: Everyone can view, but maybe only Admin/Manager can "Manage" */}
                  <div className="space-x-2">
                    <button className="text-blue-600 text-sm font-medium">View Menu</button>
                    {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && (
                      <button className="text-green-600 text-sm font-medium">Place Order</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Orders Section */}
          <section className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <div className="space-y-4">
              {orders.length === 0 && <p>No orders found.</p>}
              {orders.map((o: any) => (
                <div key={o._id} className="border-b pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Order #{o._id.slice(-6)}</h3>
                      <p className="text-sm text-gray-500">{o.restaurantId?.name}</p>
                      <p className="text-sm font-bold">${o.totalAmount}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      o.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-end space-x-2">
                    {/* RBAC: Cancel Order: ADMIN, MANAGER only */}
                    {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && o.status !== OrderStatus.CANCELLED && (
                      <button
                        onClick={() => handleCancelOrder(o._id)}
                        className="text-red-600 text-sm font-medium border border-red-600 px-2 py-1 rounded hover:bg-red-50"
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

        {/* Admin Only Section */}
        {user?.role === UserRole.ADMIN && (
          <section className="mt-8 bg-blue-50 p-6 rounded border border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Admin Controls</h2>
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Update Payment Methods
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                System Logs
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
