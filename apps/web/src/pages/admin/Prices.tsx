import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, TrendingUp, TrendingDown, Minus, Save, X } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { priceService, Price } from '@/services/price.service';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/i18n';

export const Prices = () => {
  const { setSubPage, language } = useApp();
  const { user, isAuthenticated } = useAuth();
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVariety, setNewVariety] = useState('');
  const [newPrice, setNewPrice] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated or not admin/moderator
  useEffect(() => {
    if (!isAuthenticated || (!user || (user.role !== 'admin' && user.role !== 'moderator'))) {
      setSubPage(null);
    }
  }, [isAuthenticated, user, setSubPage]);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await priceService.getPrices();
      setPrices(data);
    } catch (err: any) {
      console.error('Failed to load prices:', err);
      setError(err.message || 'Failed to load prices');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (price: Price) => {
    setEditingId(price._id || price.id || '');
    setEditPrice(price.price);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPrice(0);
  };

  const handleSave = async (priceId: string) => {
    if (editPrice <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await priceService.updatePrice(priceId, editPrice);
      await loadPrices();
      setEditingId(null);
    } catch (err: any) {
      console.error('Failed to update price:', err);
      setError(err.message || 'Failed to update price');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (priceId: string) => {
    if (!confirm('Are you sure you want to delete this price?')) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await priceService.deletePrice(priceId);
      await loadPrices();
    } catch (err: any) {
      console.error('Failed to delete price:', err);
      setError(err.message || 'Failed to delete price');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newVariety.trim() || newPrice <= 0) {
      setError('Please enter a variety name and valid price');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await priceService.createPrice({
        variety: newVariety.trim(),
        price: newPrice
      });
      await loadPrices();
      setShowCreateForm(false);
      setNewVariety('');
      setNewPrice(0);
    } catch (err: any) {
      console.error('Failed to create price:', err);
      setError(err.message || 'Failed to create price');
    } finally {
      setSaving(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} className="text-green-600" />;
      case 'down':
        return <TrendingDown size={14} className="text-red-500" />;
      default:
        return <Minus size={14} className="text-gray-500" />;
    }
  };

  // Don't render if user doesn't have access
  if (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
        <button onClick={() => setSubPage(null)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37] flex-1">Price Management</h2>
        <Button
          variant="primary"
          className="text-xs px-3"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus size={14} /> Add Price
        </Button>
      </div>

      <div className="p-6 space-y-4">
        {error && (
          <Card className="p-4 bg-red-50 border border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        )}

        {showCreateForm && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg">Create New Price</h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewVariety('');
                  setNewPrice(0);
                  setError(null);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Variety Name
                </label>
                <input
                  type="text"
                  value={newVariety}
                  onChange={(e) => setNewVariety(e.target.value)}
                  placeholder="e.g., Arabica Cherry"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#6F4E37]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Price (रू per kg)
                </label>
                <input
                  type="number"
                  value={newPrice || ''}
                  onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#6F4E37]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Creating...' : 'Create Price'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewVariety('');
                    setNewPrice(0);
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">{t(language, 'common.loading')}</p>
          </Card>
        ) : prices.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-4">No prices found</p>
            <Button variant="primary" onClick={() => setShowCreateForm(true)}>
              <Plus size={16} /> Create First Price
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {prices.map((price) => {
              const priceId = price._id || price.id || '';
              const isEditing = editingId === priceId;
              
              return (
                <Card key={priceId} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-black text-base">{price.variety}</h4>
                        {getTrendIcon(price.trend)}
                        {price.change && (
                          <span
                            className={`text-xs font-bold ${
                              price.trend === 'up'
                                ? 'text-green-600'
                                : price.trend === 'down'
                                ? 'text-red-500'
                                : 'text-gray-500'
                            }`}
                          >
                            {price.change}
                          </span>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">रू</span>
                          <input
                            type="number"
                            value={editPrice || ''}
                            onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6F4E37]"
                            autoFocus
                          />
                          <span className="text-sm text-gray-600">per kg</span>
                        </div>
                      ) : (
                        <p className="text-2xl font-black text-[#3A7D44]">
                          रू {price.price} <span className="text-sm text-gray-600">per kg</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date(price.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSave(priceId)}
                            disabled={saving}
                          >
                            <Save size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={saving}
                          >
                            <X size={14} />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(price)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(priceId)}
                            className="text-red-600 border-red-600"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

