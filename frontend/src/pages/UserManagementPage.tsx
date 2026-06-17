import React, { useState, useEffect } from 'react';
import { userApi } from '../features/auth/services/userApi';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  permissions: string[];
}

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'TRADE_OFFICER' });

  const token = localStorage.getItem('token') || 'mock-jwt-token-xyz'; // In real app, token comes from auth context

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getUsers(token);
      setUsers(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.createUser(newUser, token);
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', role: 'TRADE_OFFICER' });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating user');
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await userApi.updateUser(user.id, { status: newStatus }, token);
      fetchUsers();
    } catch (err: any) {
      alert('Error updating user status');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'bg-error/10 text-error border-error/20';
      case 'COMPLIANCE_ANALYST': return 'bg-tertiary/10 text-tertiary border-tertiary/20';
      case 'TRADE_OFFICER': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-surface-container-highest text-on-surface border-outline-variant/20';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">User Management</h1>
          <p className="text-on-surface-variant text-sm">Manage roles, access levels, and account status across the portal.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl hover:bg-primary-fixed transition-colors flex items-center gap-2 shadow-sm font-medium"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          Add New User
        </button>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined">warning</span>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-surface border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center text-primary">
            <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-lowest">
                  <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">User</th>
                  <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Role</th>
                  <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 bg-surface">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
                          {(user.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-on-surface">{user.name || 'Unknown User'}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5 font-mono">{user.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${getRoleBadgeColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${user.status === 'ACTIVE' ? 'text-primary' : 'text-error'}`}>
                        <span className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-primary' : 'bg-error'}`}></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => toggleUserStatus(user)}
                        className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors ${
                          user.status === 'ACTIVE' 
                            ? 'border-error/30 text-error hover:bg-error/10' 
                            : 'border-primary/30 text-primary hover:bg-primary/10'
                        }`}
                      >
                        {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-3 opacity-50">group_off</span>
                <p>No users found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-outline-variant/20">
            <div className="px-6 py-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-bold text-lg text-on-surface">Provision New User</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Full Name</label>
                <input 
                  required
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Email Address</label>
                <input 
                  required
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                  placeholder="jane@lumina.trade"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Assigned Role</label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="TRADE_OFFICER">Trade Officer</option>
                  <option value="COMPLIANCE_ANALYST">Compliance Analyst</option>
                  <option value="SETTLEMENT_OFFICER">Settlement Officer</option>
                  <option value="ADMIN">System Admin</option>
                  <option value="READ_ONLY">Read Only</option>
                </select>
                <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Admin mutations require dual-control approval.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/20 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 text-sm font-medium bg-primary text-on-primary hover:bg-primary-fixed rounded-lg transition-colors shadow-sm"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
