// frontend/src/pages/AdminDashboard.jsx - COMPLETE ENHANCED VERSION
import { useState } from 'react';
import DashboardStats from '../components/admin/DashboardStats';
import ManageCars from '../components/admin/ManageCars';
import ManageBookings from '../components/admin/ManageBookings';
import UserList from '../components/admin/UserList';
import CouponManagement from '../components/admin/CouponManagement';
import BookingHistory from '../components/admin/BookingHistory';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: '📊', description: 'Overview & Statistics' },
    { id: 'cars', label: 'Manage Cars', icon: '🚗', description: 'Add, Edit, Delete Cars' },
    { id: 'bookings', label: 'Bookings', icon: '📅', description: 'Manage Current Bookings' },
    { id: 'history', label: 'Booking History', icon: '📜', description: 'View All Booking Records' },
    { id: 'users', label: 'Users', icon: '👥', description: 'User Management' },
    { id: 'coupons', label: 'Coupons', icon: '🎟️', description: 'Coupon Management' },
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your car rental system
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-2xl mb-2">{tab.icon}</span>
                <span className="text-sm font-semibold text-center">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Tab Info */}
        {currentTab && (
          <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <span className="text-3xl mr-3">{currentTab.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {currentTab.label}
                </h2>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {currentTab.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {activeTab === 'stats' && <DashboardStats />}
          {activeTab === 'cars' && <ManageCars />}
          {activeTab === 'bookings' && <ManageBookings />}
          {activeTab === 'history' && <BookingHistory />}
          {activeTab === 'users' && <UserList />}
          {activeTab === 'coupons' && <CouponManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;