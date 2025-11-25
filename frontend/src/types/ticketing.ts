// frontend/src/types/ticketing.ts
export interface Event {
  id: string;
  title: string;
  description: string;
  organizer: string;
  venue: Venue;
  eventDate: string;
  doorTime: string;
  eventType: EventType;
  ticketTypes: TicketType[];
  externalEventId?: string;
  platform: EventPlatform;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Venue {
  name: string;
  address: string;
  city: string;
  country: string;
  capacity: number;
  coordinates?: Coordinates;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export enum EventType {
  Concert = 'CONCERT',
  Conference = 'CONFERENCE',
  Sports = 'SPORTS',
  Theater = 'THEATER',
  Festival = 'FESTIVAL',
  Workshop = 'WORKSHOP',
  Exhibition = 'EXHIBITION',
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantityAvailable: number;
  quantitySold: number;
  perks: Perk[];
  nftMetadata?: NFTMetadata;
  salesStart: string;
  salesEnd: string;
}

export interface Perk {
  name: string;
  description: string;
  category: PerkCategory;
}

export enum PerkCategory {
  EarlyEntry = 'EARLY_ENTRY',
  VIP = 'VIP',
  MeetAndGreet = 'MEET_AND_GREET',
  Merchandise = 'MERCHANDISE',
  DigitalContent = 'DIGITAL_CONTENT',
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animationUrl?: string;
  attributes: NFTAttribute[];
  externalUrl?: string;
}

export interface NFTAttribute {
  traitType: string;
  value: string;
}

export enum EventPlatform {
  Eventbrite = 'EVENTBRITE',
  Ticketmaster = 'TICKETMASTER',
  Cvent = 'CVENT',
  Internal = 'INTERNAL',
}

export enum EventStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
  OnSale = 'ON_SALE',
  SoldOut = 'SOLD_OUT',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
}

export interface Ticket {
  id: string;
  eventId: string;
  ticketTypeId: string;
  ownerWallet: string;
  purchasePrice: number;
  purchaseCurrency: string;
  purchaseDate: string;
  status: TicketStatus;
  nftTokenId?: string;
  qrCode: string;
  transferable: boolean;
  resaleAllowed: boolean;
  resalePrice?: number;
}

export enum TicketStatus {
  Active = 'ACTIVE',
  Used = 'USED',
  Transferred = 'TRANSFERRED',
  Resold = 'RESOLD',
  Refunded = 'REFUNDED',
  Cancelled = 'CANCELLED',
}

export interface TicketPurchaseRequest {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  buyerWallet: string;
  paymentCurrency: string;
}

export interface TicketPurchaseResponse {
  purchaseId: string;
  tickets: Ticket[];
  totalAmount: number;
  transactionHash?: string;
  nftMintTransactions: string[];
}

export interface ResaleListing {
  id: string;
  ticketId: string;
  sellerWallet: string;
  askingPrice: number;
  currency: string;
  listedAt: string;
  status: ResaleStatus;
}

export enum ResaleStatus {
  Listed = 'LISTED',
  Sold = 'SOLD',
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
}
