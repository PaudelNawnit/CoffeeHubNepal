import { Store, MessageSquare, Bell, Briefcase } from 'lucide-react';

interface CreateMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: string) => void;
}

export const CreateMenu = ({ isOpen, onClose, onSelect }: CreateMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" 
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-2xl bg-white rounded-t-[48px] p-10 animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-10"></div>
        <h3 className="text-2xl font-black text-center mb-8">Contribute to the Hub</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Sell Harvest", icon: Store, color: "bg-green-50 text-green-600", action: "sell" },
            { label: "Ask Expert", icon: MessageSquare, color: "bg-blue-50 text-blue-600", action: "ask" },
            { label: "Post Notice", icon: Bell, color: "bg-red-50 text-red-600", action: "notice" },
            { label: "Post Job", icon: Briefcase, color: "bg-amber-50 text-amber-600", action: "job" }
          ].map((opt, i) => (
            <button 
              key={i} 
              onClick={() => {
                onSelect(opt.action);
                onClose();
              }}
              className="flex flex-col items-center gap-3 p-8 rounded-[32px] border border-gray-50 bg-[#FBF9F6] active:scale-95 transition-all"
            >
              <div className={`w-14 h-14 ${opt.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                <opt.icon size={24}/>
              </div>
              <span className="text-xs font-black uppercase tracking-tight text-gray-700">{opt.label}</span>
            </button>
          ))}
        </div>
        <button 
          className="w-full py-6 text-gray-400 font-bold text-sm mt-4" 
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

