import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Clock, Users, CheckCircle, Share2 } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { eventService, Event } from '@/services/event.service';

interface EventDetailProps {
  eventId: number | string;
  onBack: () => void;
  onRegister?: () => void;
}

export const EventDetail = ({ eventId, onBack, onRegister }: EventDetailProps) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const eventData = await eventService.getEvent(eventId.toString());
      if (!eventData) {
        setError('Event not found');
      } else {
        setEvent(eventData);
      }
    } catch (err) {
      console.error('Failed to load event:', err);
      setError('Failed to load event. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!event) return;
    
    setRegistering(true);
    try {
      await eventService.registerForEvent(event.id || event._id);
      // Reload event to get updated attendee count
      await loadEvent();
      if (onRegister) {
        onRegister();
      }
    } catch (err: any) {
      console.error('Failed to register:', err);
      alert(err.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6F4E37] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] pb-32">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-black text-[#6F4E37]">Event Details</h2>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error || 'Event not found'}
          </div>
        </div>
      </div>
    );
  }

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
            <img 
              src={event.image || 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800'} 
              alt={event.title} 
              className="w-full h-full object-cover" 
            />
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
                <p className="font-black">{formatDate(event.date)}</p>
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
                {event.address && (
                  <p className="text-sm text-gray-600">{event.address}</p>
                )}
              </div>
            </div>
            {event.maxAttendees && (
              <div className="flex items-start gap-4">
                <Users className="text-[#6F4E37] shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase mb-1">Attendees</p>
                  <p className="font-black">{event.attendees} / {event.maxAttendees} registered</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-[#3A7D44] h-2 rounded-full" 
                      style={{ width: `${Math.min((event.attendees / event.maxAttendees) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {event.agenda && event.agenda.length > 0 && (
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
        )}

        <Card className="p-6">
          <h3 className="font-black mb-4">Organizer</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6F4E37] to-[#3A7D44] rounded-2xl flex items-center justify-center text-white font-black">
              {event.organizer.substring(0, 3).toUpperCase()}
            </div>
            <div>
              <p className="font-black">{event.organizer}</p>
              {event.contact && (
                <p className="text-xs text-gray-500">{event.contact}</p>
              )}
            </div>
            <CheckCircle size={18} className="text-blue-500 ml-auto" fill="currentColor" />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            Share Event
          </Button>
          <Button 
            variant="primary" 
            className="flex-1" 
            onClick={handleRegister}
            disabled={registering || (event.maxAttendees ? event.attendees >= event.maxAttendees : false)}
          >
            {registering ? 'Registering...' : 'Register Now'}
          </Button>
        </div>
      </div>
    </div>
  );
};

