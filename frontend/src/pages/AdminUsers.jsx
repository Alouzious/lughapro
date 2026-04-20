import { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { adminService } from '../features/admin/adminService';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const params = roleFilter !== 'all' ? { role: roleFilter } : {};
    adminService.listUsers(params)
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  const handleFilterChange = (role) => {
    setLoading(true);
    setError('');
    setRoleFilter(role);
  };

  const roleColors = {
    student: 'bg-blue-50 text-blue-700',
    tutor: 'bg-green-50 text-green-700',
    admin: 'bg-purple-50 text-purple-700',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 text-sm mt-1">All registered users on the platform</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {['all', 'student', 'tutor', 'admin'].map(role => (
          <button
            key={role}
            onClick={() => handleFilterChange(role)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
              roleFilter === role
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {role === 'all' ? 'All Roles' : role}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        )}
        {!loading && !error && users.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No users found</p>
          </div>
        )}
        {!loading && !error && users.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{u.full_name || '—'}</td>
                  <td className="px-5 py-4 text-gray-600">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
