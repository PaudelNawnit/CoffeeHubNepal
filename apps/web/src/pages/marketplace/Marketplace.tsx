import { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { ListingCard } from '@/components/cards/ListingCard';
import { ListingDetail } from './ListingDetail';
import { marketplaceService, Listing } from '@/services/marketplace.service';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/i18n';

export const Marketplace = () => {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { language, navigate } = useApp();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadListings();
  }, [searchQuery]);

  const loadListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await marketplaceService.getListings({
        search: searchQuery || undefined,
        limit: 100 // Get all active listings
      });
      // Filter out sold items and only show active/verified products
      const activeListings = response.products.filter(
        (product) => !product.sold && (product.active !== false)
      );
      setListings(activeListings);
    } catch (err: any) {
      console.error('Failed to load listings:', err);
      setError(err.message || 'Failed to load products');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500 pb-32 lg:pb-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black">{t(language, 'marketplace.title')}</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t(language, 'marketplace.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button 
                variant="primary" 
                className="px-4 py-2 rounded-xl flex items-center gap-2"
                onClick={() => navigate('create-listing')}
              >
                <Plus size={18}/>
                <span className="hidden sm:inline">Add Product</span>
              </Button>
            )}
            <Button variant="outline" className="p-2 rounded-xl">
              <Filter size={18}/>
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input 
            className="w-full bg-white border border-[#EBE3D5] rounded-3xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm"
            placeholder={t(language, 'marketplace.searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t(language, 'common.loading')}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">{searchQuery ? 'No products found matching your search.' : 'No products available at the moment.'}</p>
            {isAuthenticated && !searchQuery && (
              <Button 
                variant="primary" 
                onClick={() => navigate('create-listing')}
                className="inline-flex items-center gap-2"
              >
                <Plus size={18}/>
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(item => (
              <ListingCard 
                key={item._id || item.id} 
                listing={item} 
                onClick={() => setSelectedListing(item)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedListing && (
        <ListingDetail 
          listing={selectedListing} 
          onClose={() => setSelectedListing(null)} 
        />
      )}
    </>
  );
};

