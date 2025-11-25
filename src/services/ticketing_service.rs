// src/services/ticketing_service.rs
use crate::models::ticketing::*;
use crate::services::external_apis::{EventbriteClient, TicketmasterClient, CventClient};
use crate::services::nft_service::{NFTMinter, MockNFTService};
use crate::engine::HKDEngine;
use crate::error::HKDError;
use uuid::Uuid;
use rust_decimal::Decimal;
use std::collections::HashMap;
use std::sync::Arc;

pub struct TicketingService {
    events: HashMap<Uuid, Event>,
    tickets: HashMap<Uuid, Ticket>,
    eventbrite_client: Option<EventbriteClient>,
    ticketmaster_client: Option<TicketmasterClient>,
    cvent_client: Option<CventClient>,
    nft_minter: Arc<dyn NFTMinter + Send + Sync>,
    stablecoin_engine: Arc<HKDEngine>,
}

impl TicketingService {
    pub fn new(stablecoin_engine: Arc<HKDEngine>) -> Self {
        Self {
            events: HashMap::new(),
            tickets: HashMap::new(),
            eventbrite_client: None,
            ticketmaster_client: None,
            cvent_client: None,
            nft_minter: Arc::new(MockNFTService::new()),
            stablecoin_engine,
        }
    }

    pub fn with_eventbrite(mut self, client: EventbriteClient) -> Self {
        self.eventbrite_client = Some(client);
        self
    }

    pub fn with_ticketmaster(mut self, client: TicketmasterClient) -> Self {
        self.ticketmaster_client = Some(client);
        self
    }

    pub fn with_cvent(mut self, client: CventClient) -> Self {
        self.cvent_client = Some(client);
        self
    }

    pub fn with_nft_minter(mut self, minter: Arc<dyn NFTMinter + Send + Sync>) -> Self {
        self.nft_minter = minter;
        self
    }

    pub async fn create_event(&mut self, mut event: Event) -> Result<Event, HKDError> {
        event.id = Uuid::new_v4();
        event.created_at = chrono::Utc::now();
        event.updated_at = chrono::Utc::now();

        // Sync with external platforms if specified
        if event.platform != EventPlatform::Internal {
            self.sync_event_to_external_platform(&event).await?;
        }

        self.events.insert(event.id, event.clone());
        Ok(event)
    }

    pub async fn purchase_tickets(
        &mut self,
        request: TicketPurchaseRequest,
    ) -> Result<TicketPurchaseResponse, HKDError> {
        let event = self.events.get(&request.event_id)
            .ok_or_else(|| HKDError::EventNotFound(request.event_id))?;

        let ticket_type = event.ticket_types.iter()
            .find(|tt| tt.id == request.ticket_type_id)
            .ok_or_else(|| HKDError::TicketTypeNotFound(request.ticket_type_id))?;

        // Check availability
        if ticket_type.quantity_available < request.quantity {
            return Err(HKDError::InsufficientTickets);
        }

        // Calculate total amount
        let total_amount = ticket_type.price * Decimal::from(request.quantity);

        // Process payment through stablecoin engine
        let payment_tx = if request.payment_currency == "HKD" {
            // Use HKD stablecoin for payment
            self.stablecoin_engine.transfer(
                &request.buyer_wallet,
                &event.organizer, // Assuming organizer is a wallet address
                total_amount,
                Some(crate::models::TransactionMetadata {
                    reference: Some(format!("Ticket purchase for {}", event.title)),
                    purpose: Some("event_tickets".to_string()),
                    regulatory_approval_id: None,
                }),
            )?
        } else {
            // For other currencies, we'd integrate with traditional payment processors
            // This is a simplified implementation
            "external_payment_tx".to_string()
        };

        // Create tickets
        let mut tickets = Vec::new();
        let mut nft_transactions = Vec::new();

        for i in 0..request.quantity {
            let ticket_id = Uuid::new_v4();
            let mut ticket = Ticket {
                id: ticket_id,
                event_id: event.id,
                ticket_type_id: ticket_type.id,
                owner_wallet: request.buyer_wallet.clone(),
                purchase_price: ticket_type.price,
                purchase_currency: request.payment_currency.clone(),
                purchase_date: chrono::Utc::now(),
                status: TicketStatus::Active,
                nft_token_id: None,
                qr_code: format!("TICKET_{}_{}", event.id, ticket_id),
                transferable: true,
                resale_allowed: true,
                resale_price: None,
            };

            // Mint NFT if configured
            if let Some(nft_metadata) = &ticket_type.nft_metadata {
                let token_id = self.nft_minter.mint_ticket_nft(&ticket, event, nft_metadata).await?;
                ticket.nft_token_id = Some(token_id.clone());
                nft_transactions.push(token_id);
            }

            tickets.push(ticket.clone());
            self.tickets.insert(ticket_id, ticket);
        }

        // Update ticket type availability
        // In a real implementation, we'd need to update the event's ticket types

        Ok(TicketPurchaseResponse {
            purchase_id: Uuid::new_v4(),
            tickets,
            total_amount,
            transaction_hash: Some(payment_tx),
            nft_mint_transactions: nft_transactions,
        })
    }

    pub async fn list_ticket_for_resale(
        &mut self,
        ticket_id: Uuid,
        asking_price: Decimal,
        currency: String,
    ) -> Result<ResaleListing, HKDError> {
        let ticket = self.tickets.get_mut(&ticket_id)
            .ok_or_else(|| HKDError::TicketNotFound(ticket_id))?;

        if !ticket.resale_allowed {
            return Err(HKDError::ResaleNotAllowed);
        }

        let listing = ResaleListing {
            id: Uuid::new_v4(),
            ticket_id,
            seller_wallet: ticket.owner_wallet.clone(),
            asking_price,
            currency,
            listed_at: chrono::Utc::now(),
            status: ResaleStatus::Listed,
        };

        Ok(listing)
    }

    pub async fn purchase_resale_ticket(
        &mut self,
        listing_id: Uuid,
        buyer_wallet: String,
    ) -> Result<Ticket, HKDError> {
        // Implementation for resale purchase
        // This would handle the transfer of funds and NFT
        Err(HKDError::ExternalApiError("Not implemented".to_string()))
    }

    async fn sync_event_to_external_platform(&self, event: &Event) -> Result<(), HKDError> {
        match event.platform {
            EventPlatform::Eventbrite => {
                if let Some(client) = &self.eventbrite_client {
                    client.create_eventbrite_event(event).await?;
                }
            }
            EventPlatform::Ticketmaster => {
                if let Some(client) = &self.ticketmaster_client {
                    client.create_ticketmaster_event(event).await?;
                }
            }
            EventPlatform::Cvent => {
                if let Some(client) = &self.cvent_client {
                    client.create_cvent_event(event).await?;
                }
            }
            EventPlatform::Internal => {
                // No external sync needed
            }
        }
        Ok(())
    }

    pub fn get_event(&self, event_id: Uuid) -> Option<&Event> {
        self.events.get(&event_id)
    }

    pub fn get_events(&self) -> Vec<&Event> {
        self.events.values().collect()
    }

    pub fn get_user_tickets(&self, wallet_address: &str) -> Vec<&Ticket> {
        self.tickets.values()
            .filter(|ticket| ticket.owner_wallet == wallet_address)
            .collect()
    }
}
