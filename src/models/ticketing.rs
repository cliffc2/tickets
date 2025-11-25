// src/models/ticketing.rs
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub organizer: String,
    pub venue: Venue,
    pub event_date: DateTime<Utc>,
    pub door_time: DateTime<Utc>,
    pub event_type: EventType,
    pub ticket_types: Vec<TicketType>,
    pub external_event_id: Option<String>, // ID from external platform
    pub platform: EventPlatform,
    pub status: EventStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Venue {
    pub name: String,
    pub address: String,
    pub city: String,
    pub country: String,
    pub capacity: u32,
    pub coordinates: Option<Coordinates>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Coordinates {
    pub latitude: f64,
    pub longitude: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventType {
    Concert,
    Conference,
    Sports,
    Theater,
    Festival,
    Workshop,
    Exhibition,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TicketType {
    pub id: Uuid,
    pub name: String,
    pub price: Decimal,
    pub currency: String,
    pub quantity_available: u32,
    pub quantity_sold: u32,
    pub perks: Vec<Perk>,
    pub nft_metadata: Option<NFTMetadata>,
    pub sales_start: DateTime<Utc>,
    pub sales_end: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Perk {
    pub name: String,
    pub description: String,
    pub category: PerkCategory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PerkCategory {
    EarlyEntry,
    VIP,
    MeetAndGreet,
    Merchandise,
    DigitalContent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFTMetadata {
    pub name: String,
    pub description: String,
    pub image: String,
    pub animation_url: Option<String>,
    pub attributes: Vec<NFTAttribute>,
    pub external_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFTAttribute {
    pub trait_type: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventPlatform {
    Eventbrite,
    Ticketmaster,
    Cvent,
    Internal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventStatus {
    Draft,
    Published,
    OnSale,
    SoldOut,
    Cancelled,
    Completed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ticket {
    pub id: Uuid,
    pub event_id: Uuid,
    pub ticket_type_id: Uuid,
    pub owner_wallet: String,
    pub purchase_price: Decimal,
    pub purchase_currency: String,
    pub purchase_date: DateTime<Utc>,
    pub status: TicketStatus,
    pub nft_token_id: Option<String>,
    pub qr_code: String,
    pub transferable: bool,
    pub resale_allowed: bool,
    pub resale_price: Option<Decimal>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TicketStatus {
    Active,
    Used,
    Transferred,
    Resold,
    Refunded,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TicketPurchaseRequest {
    pub event_id: Uuid,
    pub ticket_type_id: Uuid,
    pub quantity: u32,
    pub buyer_wallet: String,
    pub payment_currency: String, // HKD, USD, etc.
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TicketPurchaseResponse {
    pub purchase_id: Uuid,
    pub tickets: Vec<Ticket>,
    pub total_amount: Decimal,
    pub transaction_hash: Option<String>,
    pub nft_mint_transactions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResaleListing {
    pub id: Uuid,
    pub ticket_id: Uuid,
    pub seller_wallet: String,
    pub asking_price: Decimal,
    pub currency: String,
    pub listed_at: DateTime<Utc>,
    pub status: ResaleStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ResaleStatus {
    Listed,
    Sold,
    Cancelled,
    Expired,
}
