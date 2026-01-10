import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, MessageCircle, CheckCircle, Clock, XCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { contactService, Contact, ContactStats } from '@/services/contact.service';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/utils/formatDate';

export const Contacts = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { setCurrentPage, setSubPage } = useApp();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
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

  useEffect(() => {
    loadContacts();
    loadStats();
  }, [statusFilter]);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = { page: 1, limit: 50 };
      if (statusFilter !== 'all') filters.status = statusFilter;
      
      const result = await contactService.getContacts(filters);
      setContacts(result.contacts);
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await contactService.getContactStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleStatusChange = async (contact: Contact, newStatus: 'open' | 'pending' | 'closed') => {
    if (contact.status === newStatus) return;
    
    setUpdatingId(contact._id);
    try {
      await contactService.updateContact(contact._id, { status: newStatus });
      await loadContacts();
      await loadStats();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedContact) return;
    
    setIsDeleting(true);
    try {
      await contactService.deleteContact(selectedContact._id);
      await loadContacts();
      await loadStats();
      setShowDeleteDialog(false);
      setSelectedContact(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete contact');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="alert" className="text-xs"><Clock size={12} /> Open</Badge>;
      case 'pending':
        return <Badge variant="primary" className="text-xs"><Clock size={12} /> Pending</Badge>;
      case 'closed':
        return <Badge variant="success" className="text-xs"><CheckCircle size={12} /> Closed</Badge>;
      default:
        return <Badge className="text-xs">{status}</Badge>;
    }
  };

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
        <h2 className="text-lg font-black text-[#6F4E37]">Contact Messages</h2>
      </div>

      <div className="p-6 space-y-4">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-3">
            <Card className="p-4 text-center">
              <p className="text-2xl font-black text-[#6F4E37]">{stats.total}</p>
              <p className="text-xs text-gray-500 font-bold">Total</p>
            </Card>
            <Card className="p-4 text-center bg-red-50 border-red-200">
              <p className="text-2xl font-black text-red-600">{stats.open}</p>
              <p className="text-xs text-red-500 font-bold">Open</p>
            </Card>
            <Card className="p-4 text-center bg-amber-50 border-amber-200">
              <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
              <p className="text-xs text-amber-500 font-bold">Pending</p>
            </Card>
            <Card className="p-4 text-center bg-green-50 border-green-200">
              <p className="text-2xl font-black text-green-600">{stats.closed}</p>
              <p className="text-xs text-green-500 font-bold">Closed</p>
            </Card>
          </div>
        )}

        {/* Filter */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-600">Filter by Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-[#EBE3D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6F4E37] bg-white"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
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
            <p className="text-sm text-gray-400 mt-4">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600 font-bold">No contact messages found</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <Card key={contact._id} className="overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedContact(expandedContact === contact._id ? null : contact._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-black text-lg truncate">{contact.subject}</h3>
                        {getStatusBadge(contact.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail size={14} /> {contact.email}
                        </span>
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={14} /> {contact.phone}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        From: {contact.name} • {formatDate(contact.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedContact === contact._id ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {expandedContact === contact._id && (
                  <div className="border-t border-[#EBE3D5] p-4 bg-gray-50">
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Message</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-4 rounded-xl border border-[#EBE3D5]">
                        {contact.message}
                      </p>
                    </div>
                    
                    {contact.adminNotes && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Admin Notes</p>
                        <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                          {contact.adminNotes}
                        </p>
                      </div>
                    )}
                    
                    {contact.respondedAt && (
                      <p className="text-xs text-gray-400 mb-4">
                        Responded: {formatDate(contact.respondedAt)}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-500">Change Status:</span>
                      <select
                        value={contact.status}
                        onChange={(e) => handleStatusChange(contact, e.target.value as 'open' | 'pending' | 'closed')}
                        disabled={updatingId === contact._id}
                        className="px-3 py-1.5 text-sm border border-[#EBE3D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F4E37] bg-white disabled:opacity-50"
                      >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                      </select>
                      
                      <div className="flex-1"></div>
                      
                      <Button
                        variant="outline"
                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 hover:border-red-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContact(contact);
                          setShowDeleteDialog(true);
                        }}
                        disabled={isDeleting}
                      >
                        <Trash2 size={16} /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Contact"
        message={`Are you sure you want to delete the message from ${selectedContact?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) {
            setShowDeleteDialog(false);
            setSelectedContact(null);
          }
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

