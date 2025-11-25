// src/services/external_apis.rs
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use crate::models::ticketing::*;
use crate::error::HKDError;
use reqwest::{Client, header};
use std::collections::HashMap;
use rust_decimal::Decimal;

#[async_trait]
pub trait TicketingPlatform {
    async fn create_event(&self, event: &Event) -> Result<ExternalEventResponse, HKDError>;
    async fn update_event(&self, event_id: &str, event: &Event) -> Result<ExternalEventResponse, HKDError>;
    async fn get_event(&self, event_id: &str) -> Result<Event, HKDError>;
    async fn list_events(&self, filters: EventFilters) -> Result<Vec<Event>, HKDError>;
    async fn create_ticket_types(&self, event_id: &str, ticket_types: &[TicketType]) -> Result<Vec<ExternalTicketTypeResponse>, HKDError>;
}

pub struct EventbriteClient {
    client: Client,
    base_url: String,
    api_key: String,
}

pub struct TicketmasterClient {
    client: Client,
    base_url: String,
    api_key: String,
}

pub struct CventClient {
    client: Client,
    base_url: String,
    api_key: String,
    account_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExternalEventResponse {
    pub external_id: String,
    pub event_url: String,
    pub platform: EventPlatform,
    pub sync_status: SyncStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExternalTicketTypeResponse {
    pub external_id: String,
    pub ticket_type_id: Uuid,
    pub platform: EventPlatform,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SyncStatus {
    Synced,
    Pending,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventFilters {
    pub start_date: Option<chrono::DateTime<Utc>>,
    pub end_date: Option<chrono::DateTime<Utc>>,
    pub event_type: Option<EventType>,
    pub venue_city: Option<String>,
    pub organizer: Option<String>,
}

impl EventbriteClient {
    pub fn new(api_key: String) -> Self {
        let client = Client::new();
        Self {
            client,
            base_url: "https://www.eventbriteapi.com/v3".to_string(),
            api_key,
        }
    }

    pub async fn create_eventbrite_event(&self, event: &Event) -> Result<ExternalEventResponse, HKDError> {
        let eventbrite_event = EventbriteEvent::from_event(event);
        
        let response = self.client
            .post(&format!("{}/events/", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header(header::CONTENT_TYPE, "application/json")
            .json(&eventbrite_event)
            .send()
            .await?;

        if response.status().is_success() {
            let event_response: EventbriteEventResponse = response.json().await?;
            Ok(ExternalEventResponse {
                external_id: event_response.id,
                event_url: event_response.url,
                platform: EventPlatform::Eventbrite,
                sync_status: SyncStatus::Synced,
            })
        } else {
            Err(HKDError::ExternalApiError(format!("Eventbrite API error: {}", response.status())))
        }
    }

    pub async fn create_eventbrite_ticket_class(&self, event_id: &str, ticket_type: &TicketType) -> Result<ExternalTicketTypeResponse, HKDError> {
        let ticket_class = EventbriteTicketClass::from_ticket_type(ticket_type);
        
        let response = self.client
            .post(&format!("{}/events/{}/ticket_classes/", self.base_url, event_id))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&ticket_class)
            .send()
            .await?;

        if response.status().is_success() {
            let ticket_response: EventbriteTicketClassResponse = response.json().await?;
            Ok(ExternalTicketTypeResponse {
                external_id: ticket_response.id,
                ticket_type_id: ticket_type.id,
                platform: EventPlatform::Eventbrite,
            })
        } else {
            Err(HKDError::ExternalApiError(format!("Eventbrite API error: {}", response.status())))
        }
    }
}

impl TicketmasterClient {
    pub fn new(api_key: String) -> Self {
        let client = Client::new();
        Self {
            client,
            base_url: "https://app.ticketmaster.com/commerce/v2".to_string(),
            api_key,
        }
    }

    pub async fn create_ticketmaster_event(&self, event: &Event) -> Result<ExternalEventResponse, HKDError> {
        // Ticketmaster integration for event creation
        // Implementation would follow Ticketmaster's API spec
        Ok(ExternalEventResponse {
            external_id: "tm_".to_string() + &event.id.to_string(),
            event_url: format!("https://ticketmaster.com/event/{}", event.id),
            platform: EventPlatform::Ticketmaster,
            sync_status: SyncStatus::Synced,
        })
    }
}

impl CventClient {
    pub fn new(api_key: String, account_id: String) -> Self {
        let client = Client::new();
        Self {
            client,
            base_url: "https://api.cvent.com/ea".to_string(),
            api_key,
            account_id,
        }
    }

    pub async fn create_cvent_event(&self, event: &Event) -> Result<ExternalEventResponse, HKDError> {
        // Cvent integration for event creation
        // Implementation would follow Cvent's API spec
        Ok(ExternalEventResponse {
            external_id: "cv_".to_string() + &event.id.to_string(),
            event_url: format!("https://cvent.com/event/{}", event.id),
            platform: EventPlatform::Cvent,
            sync_status: SyncStatus::Synced,
        })
    }
}

// Eventbrite-specific data structures
#[derive(Debug, Clone, Serialize, Deserialize)]
struct EventbriteEvent {
    event: EventbriteEventData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct EventbriteEventData {
    name: EventbriteText,
    description: EventbriteText,
    start: EventbriteDateTime,
    end: EventbriteDateTime,
    currency: String,
    online_event: bool,
    organizer_id: String,
    venue_id: Option<String>,
    // ... other Eventbrite specific fields
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct EventbriteText {
    html: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct EventbriteDateTime {
    timezone: String,
    utc: chrono::DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct EventbriteEventResponse {
    id: String,
    url: String,
    // ... other response fields
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct EventbriteTicketClass {
    ticket_class: EventbriteTicketClassData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct EventbriteTicketClassData {
    name: String,
    free: bool,
    minimum_quantity: u32,
    maximum_quantity: u32,
    delivery_methods: Vec<String>,
    cost: String,
    // ... other ticket class fields
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct EventbriteTicketClassResponse {
    id: String,
    // ... other response fields
}
