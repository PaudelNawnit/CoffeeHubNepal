import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useApp } from '@/context/AppContext';
import { eventService, Event } from '@/services/event.service';

export const Events = () => {
  const { navigate } = useApp();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventService.getEvents({ upcoming: true });
      setEvents(response.events);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
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

  return (
    <div className="p-6 space-y-6 animate-in fade-in pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black">Events</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upcoming Events</p>
        </div>
        <Button variant="primary" className="text-xs">
          + Create Event
        </Button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-[#6F4E37] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading events...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">No upcoming events</p>
          <p className="text-gray-400 text-sm">Check back later for new events!</p>
        </div>
      )}

      <div className="space-y-6">
        {events.map(event => (
          <Card key={event.id || event._id} className="overflow-hidden">
            <div className="relative h-48">
              <img 
                src={event.image || 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400'} 
                alt={event.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-4 right-4">
                <Badge variant="primary">{event.type}</Badge>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-black mb-4">{event.title}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-[#6F4E37]" />
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase">Date</p>
                    <p className="font-black">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-[#6F4E37]" />
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase">Time</p>
                    <p className="font-black">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-[#6F4E37]" />
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase">Location</p>
                    <p className="font-black">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-[#6F4E37]" />
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase">Attendees</p>
                    <p className="font-black">
                      {event.attendees} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''} registered
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => {
                  // Store string ID in sessionStorage since navigate expects a number
                  sessionStorage.setItem('eventDetailId', event.id || event._id);
                  // Use a dummy number ID - EventDetail will read from sessionStorage
                  navigate('event-detail', 0);
                }}
              >
                View Details <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

