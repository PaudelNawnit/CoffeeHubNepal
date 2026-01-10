import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { MapPin, MessageCircle, Phone } from 'lucide-react';

interface Listing {
  _id?: string;
  id?: string | number;
  title: string;
  price: number;
  unit: string;
  location: string;
  user?: string;
  sellerName?: string;
  verified: boolean;
  category: string;
  image?: string;
  images?: string[];
  desc?: string;
  description?: string;
  quantity?: number;
  sellerId?: string;
  sellerPhone?: string | null;
  sold?: boolean;
}

interface ListingDetailProps {
  listing: Listing;
  onClose: () => void;
}

export const ListingDetail = ({ listing, onClose }: ListingDetailProps) => {
  // Get the first image or use a placeholder
  const imageUrl = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : listing.image || 'https://via.placeholder.com/800x600?text=No+Image';
  
  const displayName = listing.sellerName || listing.user || 'Unknown Seller';
  const description = listing.description || listing.desc || 'No description available.';

  return (
    <Modal onClose={onClose}>
      <img 
        src={imageUrl} 
        className="w-full h-80 object-cover" 
        alt={listing.title}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=No+Image';
        }}
      />
      <div className="p-8 pb-12">
        <div className="flex justify-between items-start mb-6">
          <div>
            {listing.sold ? (
              <Badge variant="alert">Sold</Badge>
            ) : (
              <Badge variant="success">Available Now</Badge>
            )}
            <h3 className="text-2xl font-black mt-2">{listing.title}</h3>
            {listing.quantity && (
              <p className="text-xs text-gray-500 mt-1">Quantity: {listing.quantity} {listing.unit}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-[#3A7D44]">रू {listing.price.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">per {listing.unit}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl mb-8 flex items-center gap-4 border border-[#EBE3D5]">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center font-black text-amber-600">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-gray-400 uppercase">Seller Info</p>
            <p className="font-black text-sm">{displayName}</p>
            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
              <MapPin size={10}/> {listing.location}
            </p>
            {listing.verified && (
              <Badge variant="success" className="mt-1 text-[9px]">Verified Seller</Badge>
            )}
          </div>
          <Button variant="outline" className="px-3 rounded-xl">
            <MessageCircle size={18}/>
          </Button>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-10">{description}</p>

        {!listing.sold && listing.sellerPhone && (
          <div className="flex gap-4">
            <Button 
              variant="secondary" 
              className="flex-1 py-4 text-base" 
              onClick={() => {
                const phoneNumber = listing.sellerPhone?.replace(/\D/g, ''); // Remove non-digits
                const formattedPhone = phoneNumber?.startsWith('977') 
                  ? `+${phoneNumber}` 
                  : phoneNumber?.startsWith('9') 
                    ? `+977${phoneNumber}` 
                    : `+977${phoneNumber}`;
                window.location.href = `tel:${formattedPhone}`;
              }}
            >
              <Phone size={20}/> Call Seller
            </Button>
            <Button variant="primary" className="flex-1 py-4 text-base">
              Negotiate
            </Button>
          </div>
        )}
        {!listing.sold && !listing.sellerPhone && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-yellow-800 text-sm text-center">
              Contact information not available. Please contact the seller through other means.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

