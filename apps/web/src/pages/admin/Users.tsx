import { useState, useEffect } from 'react';
import { ArrowLeft, Search, User as UserIcon, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { adminService, User } from '@/services/admin.service';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';

export const Users = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { setCurrentPage, setSubPage } = useApp();
  
  // Redirect if not authenticated or not admin/moderator
  useEffect(() => {
    if (!isAuthenticated || (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator'))) {
      setCurrentPage('home');
      setSubPage(null);
    }
  }, [isAuthenticated, currentUser, setCurrentPage, setSubPage]);
  
  // Don't render if user doesn't have access
  if (!isAuthenticated || !currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
    return null;
  }
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isModerator = currentUser?.role === 'moderator';
  
  // Roles that moderators can assign (excluding admin and moderator)
  const moderatorAssignableRoles = ['farmer', 'roaster', 'trader', 'exporter', 'expert'];
  // All roles for admin
  const allRoles = ['farmer', 'roaster', 'trader', 'exporter', 'expert', 'admin', 'moderator'];
  
  // Get assignable roles based on current user's role
  const getAssignableRoles = (targetUser: User) => {
    if (isAdmin) {
      return allRoles;
    }
    if (isModerator) {
      // Moderators cannot change admin or moderator roles
      if (targetUser.role === 'admin' || targetUser.role === 'moderator') {
        return []; // Can't modify admin/moderator users
      }
      return moderatorAssignableRoles;
    }
    return [];
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, verifiedFilter, searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = {
        page: 1,
        limit: 50
      };
      if (roleFilter !== 'all') filters.role = roleFilter;
      if (verifiedFilter !== 'all') filters.verified = verifiedFilter === 'verified';
      if (searchTerm) filters.search = searchTerm;

      const result = await adminService.getAllUsers(filters);
      setUsers(result.users);
      setTotalUsers(result.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user: User, newRoleValue: string) => {
    console.log('[Users] handleRoleChange called:', { userId: user._id, currentRole: user.role, newRole: newRoleValue });
    setSelectedUser(user);
    setNewRole(newRoleValue);
    setShowConfirmDialog(true);
  };

  const confirmRoleChange = async () => {
    console.log('[Users] confirmRoleChange called:', { selectedUser: selectedUser?._id, newRole, currentRole: selectedUser?.role });
    
    if (!selectedUser || !newRole || newRole === selectedUser.role) {
      console.log('[Users] Early return - no change needed');
      setShowConfirmDialog(false);
      return;
    }

    console.log('[Users] Starting role update...');
    setIsUpdatingRole(true);
    try {
      console.log('[Users] Calling adminService.updateUserRole with:', { userId: selectedUser._id, newRole });
      const result = await adminService.updateUserRole(selectedUser._id, newRole);
      console.log('[Users] Role update successful:', result);
      
      // Refresh the users list
      console.log('[Users] Refreshing users list...');
      await loadUsers();
      
      setShowConfirmDialog(false);
      setSelectedUser(null);
      setNewRole('');
      console.log('[Users] Role change completed successfully');
    } catch (err: any) {
      console.error('[Users] Role update error:', err);
      alert(err.message || 'Failed to update user role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    // Cannot delete admins or self
    if (user.role === 'admin') {
      alert('Cannot delete admin users');
      return;
    }
    if (user._id === currentUser?.mongoId) {
      alert('Cannot delete your own account');
      return;
    }
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      await adminService.deleteUser(userToDelete._id);
      await loadUsers();
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'alert';
      case 'moderator':
        return 'primary';
      case 'farmer':
        return 'success';
      default:
        return 'primary';
    }
  };

  // Generate avatar URL or use user's avatar
  const getUserAvatar = (user: User) => {
    if (user.avatar) {
      return user.avatar;
    }
    return null; // Return null to show initial-based avatar
  };
  
  // All roles for filter dropdown
  const roles = ['farmer', 'roaster', 'trader', 'exporter', 'expert', 'admin', 'moderator'];

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
        <button 
          onClick={() => {
            setCurrentPage('admin');
            setSubPage(null);
          }} 
          className="p-2 hover:bg-gray-100 rounded-xl"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37]">User Management</h2>
        <div className="ml-auto text-xs font-bold text-gray-400">
          Total: {loading ? "..." : totalUsers}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#EBE3D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-[#EBE3D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
              ))}
            </select>
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="px-4 py-2 border border-[#EBE3D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </Card>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#6F4E37] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-400 mt-4">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <Card className="p-12 text-center">
            <UserIcon className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600 font-bold">No users found</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const avatar = getUserAvatar(user);
              const assignableRoles = getAssignableRoles(user);
              const canModifyUser = assignableRoles.length > 0;
              
              return (
              <Card key={user._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt={user.name || user.email}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#EBE3D5]"
                          onError={(e) => {
                            // Fallback to initial avatar on error
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        user.role === 'admin' ? 'bg-red-500' : 
                        user.role === 'moderator' ? 'bg-purple-500' : 
                        'bg-[#6F4E37]'
                      } ${avatar ? 'hidden' : ''}`}>
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-lg truncate">{user.name || user.email}</h3>
                        {user.verified && <CheckCircle className="text-blue-500 flex-shrink-0" size={16} fill="currentColor" />}
                        {!user.verified && <XCircle className="text-gray-300 flex-shrink-0" size={16} />}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 truncate">{user.email}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                          {user.role}
                        </Badge>
                        {user.phone && (
                          <span className="text-xs text-gray-500">Phone: {user.phone}</span>
                        )}
                        {user.location && (
                          <span className="text-xs text-gray-500">Location: {user.location}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Role management - Admin can manage all, Moderator can manage non-admin/moderator users */}
                  {(isAdmin || isModerator) && (
                    <div className="flex items-center gap-2">
                      {canModifyUser ? (
                        <select
                          value={user.role}
                          onChange={(e) => {
                            const newRoleValue = e.target.value;
                            console.log('[Users] Role dropdown changed:', { userId: user._id, currentRole: user.role, newRole: newRoleValue });
                            if (newRoleValue !== user.role) {
                              handleRoleChange(user, newRoleValue);
                            }
                          }}
                          disabled={isUpdatingRole || loading || isDeleting}
                          className="px-3 py-1.5 text-sm border border-[#EBE3D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F4E37] bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {assignableRoles.map(role => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Badge variant="primary" className="text-xs">
                          {user.role === 'admin' || user.role === 'moderator' ? 'Protected' : 'View Only'}
                        </Badge>
                      )}
                      {/* Delete button - only for admins, non-admin users, and not self */}
                      {isAdmin && user.role !== 'admin' && user._id !== currentUser?.mongoId && (
                        <Button
                          variant="outline"
                          className="px-2 py-1.5 text-red-600 hover:bg-red-50 hover:border-red-200"
                          onClick={() => handleDeleteUser(user)}
                          disabled={isDeleting || isUpdatingRole || loading}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Change User Role"
        message={`Are you sure you want to change ${selectedUser?.name || selectedUser?.email}'s role from ${selectedUser?.role} to ${newRole}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        variant="primary"
        onConfirm={confirmRoleChange}
        onCancel={() => {
          if (!isUpdatingRole) {
            setShowConfirmDialog(false);
            setSelectedUser(null);
            setNewRole('');
          }
        }}
        isLoading={isUpdatingRole}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${userToDelete?.name || userToDelete?.email}? This action cannot be undone. All their data including posts, listings, and jobs will be orphaned.`}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          if (!isDeleting) {
            setShowDeleteDialog(false);
            setUserToDelete(null);
          }
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

