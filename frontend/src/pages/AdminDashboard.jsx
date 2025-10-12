import { useState } from 'react';
import DashboardStats from '../components/admin/DashboardStats';
import ManageCars from '../components/admin/ManageCars';
import ManageBookings from '../components/admin/ManageBookings';
import UserList from '../components/admin/UserList';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: '📊' },
    { id: 'cars', label: 'Manage Cars', icon: '🚗' },
    { id: 'bookings', label: 'Manage Bookings', icon: '📅' },
    { id: 'users', label: 'Users', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Admin Dashboard</h1>

        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'stats' && <DashboardStats />}
          {activeTab === 'cars' && <ManageCars />}
          {activeTab === 'bookings' && <ManageBookings />}
          {activeTab === 'users' && <UserList />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
