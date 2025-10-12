import { useState, useEffect } from 'react';
import { getAllUsers, deleteUser } from '../../services/adminService';
import Loader from '../common/Loader';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 dark:text-white">User Management</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300">Joined</th>
              <th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 text-sm dark:text-gray-300">{user.name}</td>
                <td className="px-4 py-3 text-sm dark:text-gray-300">{user.email}</td>
                <td className="px-4 py-3 text-sm dark:text-gray-300">{user.phone}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm dark:text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
