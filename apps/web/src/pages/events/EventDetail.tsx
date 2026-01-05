import { ArrowLeft, Calendar, MapPin, Clock, Users, CheckCircle, Share2 } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

interface EventDetailProps {
  eventId: number;
  onBack: () => void;
  onRegister?: () => void;
}

export const EventDetail = ({ onBack, onRegister }: EventDetailProps) => {
  const event = {
    id: 1,
    title: "Coffee Harvest Festival 2024",
    date: "March 15, 2024",
    time: "9:00 AM - 6:00 PM",
    location: "Pokhara, Kaski",
    address: "Lakeside, Pokhara-6",
    attendees: 150,
    maxAttendees: 200,
    type: "Festival",
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800",
    description: "Join us for the annual Coffee Harvest Festival celebrating Nepal's coffee culture. Experience live demonstrations, taste different varieties, and network with farmers and roasters.",
    agenda: [
      "9:00 AM - Opening Ceremony",
      "10:00 AM - Coffee Tasting Sessions",
      "12:00 PM - Lunch Break",
      "1:00 PM - Processing Demonstrations",
      "3:00 PM - Panel Discussion",
      "5:00 PM - Networking & Closing"
    ],
    organizer: "Nepal Coffee Association",
    contact: "+977 9800000000"
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37]">Event Details</h2>
        <button className="ml-auto p-2 hover:bg-gray-100 rounded-xl">
          <Share2 size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <Card className="overflow-hidden">
          <div className="relative h-64">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4">
              <Badge variant="primary">{event.type}</Badge>
            </div>
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-black mb-4">{event.title}</h1>
            <p className="text-gray-700 leading-relaxed mb-6">{event.description}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-black mb-4">Event Information</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Calendar className="text-[#6F4E37] shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs font-black text-gray-400 uppercase mb-1">Date</p>
                <p className="font-black">{event.date}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="text-[#6F4E37] shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs font-black text-gray-400 uppercase mb-1">Time</p>
                <p className="font-black">{event.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="text-[#6F4E37] shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs font-black text-gray-400 uppercase mb-1">Location</p>
                <p className="font-black">{event.location}</p>
                <p className="text-sm text-gray-600">{event.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Users className="text-[#6F4E37] shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs font-black text-gray-400 uppercase mb-1">Attendees</p>
                <p className="font-black">{event.attendees} / {event.maxAttendees} registered</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-[#3A7D44] h-2 rounded-full" 
                    style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-black mb-4">Event Agenda</h3>
          <div className="space-y-3">
            {event.agenda.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#F5EFE6] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-[#6F4E37]">{idx + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-black mb-4">Organizer</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6F4E37] to-[#3A7D44] rounded-2xl flex items-center justify-center text-white font-black">
              NCA
            </div>
            <div>
              <p className="font-black">{event.organizer}</p>
              <p className="text-xs text-gray-500">{event.contact}</p>
            </div>
            <CheckCircle size={18} className="text-blue-500 ml-auto" fill="currentColor" />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            Share Event
          </Button>
          <Button variant="primary" className="flex-1" onClick={onRegister}>
            Register Now
          </Button>
        </div>
      </div>
    </div>
  );
};

