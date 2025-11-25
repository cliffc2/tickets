// frontend/src/components/EventMarketplace.tsx
import React, { useState } from 'react';
import { useEvents, usePurchaseTickets } from '../hooks/useTicketing';
import { Event, EventType, EventPlatform } from '../types/ticketing';
import { Search, Filter, Calendar, MapPin, Users } from 'lucide-react';

const EventMarketplace: React.FC = () => {
  const [filters, setFilters] = useState({
    eventType: '' as EventType | '',
    platform: '' as EventPlatform | '',
    city: '',
    dateRange: '',
  });

  const { data: events, isLoading } = useEvents();

  const filteredEvents = events?.filter(event => {
    if (filters.eventType && event.eventType !== filters.eventType) return false;
    if (filters.platform && event.platform !== filters.platform) return false;
    if (filters.city && !event.venue.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Event Marketplace</h1>
        <p className="text-gray-600 mt-2">Discover and purchase tickets with HKD stablecoin</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-2" />
              Event Type
            </label>
            <select
              value={filters.eventType}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value as EventType })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            >
              <option value="">All Types</option>
              {Object.values(EventType).map(type => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <select
              value={filters.platform}
              onChange={(e) => setFilters({ ...filters, platform: e.target.value as EventPlatform })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            >
              <option value="">All Platforms</option>
              {Object.values(EventPlatform).map(platform => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              City
            </label>
            <input
              type="text"
              placeholder="Search city..."
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Date
            </label>
            <input
              type="date"
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents?.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {filteredEvents?.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No events found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters to find more events.</p>
        </div>
      )}
    </div>
  );
};

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const [showTicketModal, setShowTicketModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                event.platform === EventPlatform.Eventbrite ? 'bg-orange-100 text-orange-800' :
                event.platform === EventPlatform.Ticketmaster ? 'bg-red-100 text-red-800' :
                event.platform === EventPlatform.Cvent ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {event.platform}
              </span>
