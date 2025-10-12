import { useAuth } from '../../hooks/useAuth';

const DebugAuthStatus = () => {
  const { user, loading } = useAuth();

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm z-50 text-xs">
      <h3 className="font-bold mb-2 text-sm">🔍 Auth Debug Status</h3>
      <div className="space-y-1">
        <div>
          <strong>Loading:</strong> {loading ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>User:</strong> {user ? '✅ Logged In' : '❌ Not Logged In'}
        </div>
        {user && (
          <>
            <div>
              <strong>Name:</strong> {user.name}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Role:</strong> {user.role}
            </div>
          </>
        )}
        <div>
          <strong>Token:</strong> {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}
        </div>
        <div>
          <strong>User Data:</strong> {localStorage.getItem('user') ? '✅ Present' : '❌ Missing'}
        </div>
      </div>
      <button
        onClick={() => {
          console.log('Token:', localStorage.getItem('token'));
          console.log('User:', localStorage.getItem('user'));
          console.log('Parsed User:', JSON.parse(localStorage.getItem('user') || '{}'));
        }}
        className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-xs w-full hover:bg-blue-700"
      >
        Log to Console
      </button>
    </div>
  );
};

export default DebugAuthStatus;