// frontend/src/services/ticketingApi.ts
import axios from 'axios';
import {
  Event,
  Ticket,
  TicketPurchaseRequest,
  TicketPurchaseResponse,
  ResaleListing
} from '../types/ticketing';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const ticketingApi = {
  // Event operations
  async getEvents(filters?: any): Promise<Event[]> {
    const response = await api.get('/events', { params: filters });
    return response.data;
  },

  async getEvent(eventId: string): Promise<Event> {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  },

  async createEvent(event: Partial<Event>): Promise<Event> {
    const response = await api.post('/events', event);
    return response.data;
  },

  // Ticket operations
  async purchaseTickets(purchaseRequest: TicketPurchaseRequest): Promise<TicketPurchaseResponse> {
    const response = await api.post('/tickets/purchase', purchaseRequest);
    return response.data;
  },

  async getUserTickets(walletAddress: string): Promise<Ticket[]> {
    const response = await api.get(`/tickets/user/${walletAddress}`);
    return response.data;
  },

  async listTicketForResale(ticketId: string, askingPrice: number, currency: string): Promise<ResaleListing> {
    const response = await api.post(`/tickets/${ticketId}/resale`, {
      askingPrice,
      currency,
    });
    return response.data;
  },

  async purchaseResaleTicket(listingId: string, buyerWallet: string): Promise<Ticket> {
    const response = await api.post(`/tickets/resale/${listingId}/purchase`, {
      buyerWallet,
    });
    return response.data;
  },

  async transferTicket(ticketId: string, toWallet: string): Promise<Ticket> {
    const response = await api.post(`/tickets/${ticketId}/transfer`, {
      toWallet,
    });
    return response.data;
  },
};

export default api;
