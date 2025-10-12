import { useState } from 'react';
import ProfileInfo from '../components/profile/ProfileInfo';
import ProfileSettings from '../components/profile/ProfileSettings';
import NotificationsList from '../components/profile/NotificationsList';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">My Profile</h1>

      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'info' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Profile Info
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'notifications' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Notifications
        </button>
      </div>

      <div>
        {activeTab === 'info' && <ProfileInfo />}
        {activeTab === 'settings' && <ProfileSettings />}
        {activeTab === 'notifications' && <NotificationsList />}
      </div>
    </div>
  );
};

export default ProfilePage;