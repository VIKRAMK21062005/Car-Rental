import { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '../../services/notificationService';
import Loader from '../common/Loader';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {notifications.length > 0 ? (
        <div className="divide-y dark:divide-gray-700">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`p-4 ${notification.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-700'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold dark:text-white">{notification.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{notification.message}</p>
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="text-blue-600 hover:text-blue-800 text-sm ml-4"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No notifications
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
