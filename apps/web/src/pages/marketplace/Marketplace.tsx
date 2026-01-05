import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { ListingCard } from '@/components/cards/ListingCard';
import { MOCK_LISTINGS } from '@/utils/mockData';
import { ListingDetail } from './ListingDetail';

export const Marketplace = () => {
  const [selectedListing, setSelectedListing] = useState<typeof MOCK_LISTINGS[0] | null>(null);

  return (
    <>
      <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500 pb-32 lg:pb-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black">Marketplace</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Beans & Gear</p>
          </div>
          <Button variant="outline" className="p-2 rounded-xl">
            <Filter size={18}/>
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input 
            className="w-full bg-white border border-[#EBE3D5] rounded-3xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm"
            placeholder="Search variety, location, or seller..."
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_LISTINGS.map(item => (
            <ListingCard 
              key={item.id} 
              listing={item} 
              onClick={() => setSelectedListing(item)}
            />
          ))}
        </div>
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

