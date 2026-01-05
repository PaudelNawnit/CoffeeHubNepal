import { Card } from '../common/Card';
import { MapPin } from 'lucide-react';

interface Listing {
  id: number;
  title: string;
  price: number;
  unit: string;
  location: string;
  user: string;
  verified: boolean;
  category: string;
  image: string;
  desc: string;
}

interface ListingCardProps {
  listing: Listing;
  onClick: () => void;
}

export const ListingCard = ({ listing, onClick }: ListingCardProps) => (
  <Card onClick={onClick} className="group">
    <div className="relative h-44 overflow-hidden">
      <img src={listing.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={listing.title} />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-xl text-[#3A7D44] font-black text-xs shadow-sm">
        रू {listing.price}
      </div>
    </div>
    <div className="p-4">
      <span className="text-[9px] font-black text-[#6F4E37] uppercase bg-[#F5EFE6] px-2 py-0.5 rounded-lg mb-2 inline-block tracking-widest">
        {listing.category}
      </span>
      <h4 className="font-black text-sm line-clamp-1">{listing.title}</h4>
      <div className="flex items-center gap-1 mt-2 text-gray-400">
        <MapPin size={10}/>
        <span className="text-[10px] font-bold">{listing.location}</span>
      </div>
    </div>
  </Card>
);

