import { useAuth } from '../../hooks/useAuth';

const ProfileInfo = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-bold dark:text-white">{user?.name}</h2>
          <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <p className="text-gray-900 dark:text-white">{user?.phone || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
          <p className="text-gray-900 dark:text-white">{user?.address || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
          <p className="text-gray-900 dark:text-white capitalize">{user?.role}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member Since</label>
          <p className="text-gray-900 dark:text-white">{new Date(user?.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
