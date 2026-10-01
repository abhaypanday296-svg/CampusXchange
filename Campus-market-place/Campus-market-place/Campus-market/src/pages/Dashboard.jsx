import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ShoppingCart, IndianRupee, Package, TrendingUp, Loader2 } from "lucide-react";
import { io } from "socket.io-client";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

const socket = io("http://localhost:3000", { withCredentials: true, autoConnect: false });

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSales: 0,
    totalIncome: 0,
    recentOrders: [],
    purchases: [],
    sales: [],
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [purchaseRes, salesRes] = await Promise.all([
        apiClient.get("/orders/my-purchases"),
        apiClient.get("/orders/my-sales"),
      ]);

      const purchases = purchaseRes.data.data || [];
      const sales = salesRes.data.data || [];
      const totalIncome = sales.reduce((acc, item) => acc + (item.totalAmount || item.productId?.price || 0), 0);

      const allOrders = [...purchases, ...sales]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setStats({ totalPurchases: purchases.length, totalSales: sales.length, totalIncome, recentOrders: allOrders, purchases, sales });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // Real-time socket — order hone pe auto refresh
  useEffect(() => {
    if (!user) return;
    socket.connect();
    socket.emit("user_online", user._id);

    socket.on("order_created", (data) => {
      if (data.sellerId === user._id?.toString() || data.buyerId === user._id?.toString()) {
        fetchDashboardData(); // automatic refresh
      }
    });

    return () => {
      socket.off("order_created");
      socket.disconnect();
    };
  }, [user, fetchDashboardData]);

  const cards = useMemo(() => [
    { title: "Total Purchases", value: stats.totalPurchases, icon: ShoppingCart, gradient: "from-blue-500 to-cyan-500" },
    { title: "Total Sales", value: stats.totalSales, icon: Package, gradient: "from-purple-500 to-pink-500" },
    { title: "Total Income", value: `₹${stats.totalIncome.toLocaleString()}`, icon: IndianRupee, gradient: "from-green-500 to-emerald-500" },
  ], [stats]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-600 font-bold text-lg">
          <Loader2 className="animate-spin w-6 h-6" /> Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">Marketplace Dashboard</h1>
            <p className="text-gray-500 mt-2">Track your orders, sales, and earnings.</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-semibold text-gray-700">Your marketplace activity is growing</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="relative overflow-hidden rounded-3xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full blur-3xl`} />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{card.title}</p>
                    <h2 className="text-4xl font-black mt-3 text-gray-900 tracking-tight">{card.value}</h2>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white w-7 h-7" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-2xl font-black text-gray-900">Recent Orders</h3>
            <p className="text-sm text-gray-500 mt-1">Latest sales and purchase activity — updates automatically.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50">
                <tr>
                  {["Product", "Buyer", "Price", "Type", "Date"].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => {
                    const isSale = stats.sales?.some(s => s._id === order._id);
                    return (
                      <tr key={order._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={order.productId?.images?.[0]?.url || "https://via.placeholder.com/100"}
                              alt={order.productId?.title}
                              className="w-14 h-14 rounded-xl object-cover"
                            />
                            <div>
                              <p className="font-bold text-gray-900">{order.productId?.title || "Unknown Product"}</p>
                              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{order.productId?.category || "General"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-semibold text-gray-700">{order.buyerId?.username || "Student"}</td>
                        <td className="px-6 py-5 font-black text-blue-600">₹{(order.totalAmount || order.productId?.price || 0).toLocaleString()}</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isSale ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                          }`}>
                            {isSale ? "Sale" : "Purchase"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-16 text-gray-400 font-semibold">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
