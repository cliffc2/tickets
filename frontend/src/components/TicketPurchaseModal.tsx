// frontend/src/components/TicketPurchaseModal.tsx
import React, { useState } from 'react';
import { Event, TicketType, TicketPurchaseRequest } from '../types/ticketing';
import { usePurchaseTickets } from '../hooks/useTicketing';
import { useWallet } from '../hooks/useStablecoin';
import { X, Ticket, Shield, Zap } from 'lucide-react';

interface TicketPurchaseModalProps {
  event: Event;
  onClose: () => void;
}

const TicketPurchaseModal: React.FC<TicketPurchaseModalProps> = ({ event, onClose }) => {
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { data: wallet } = useWallet('user_wallet_123'); // In real app, from auth
  const purchaseMutation = usePurchaseTickets();

  const handlePurchase = async () => {
    if (!selectedTicketType || !wallet) return;

    const purchaseRequest: TicketPurchaseRequest = {
      eventId: event.id,
      ticketTypeId: selectedTicketType.id,
      quantity,
      buyerWallet: wallet.address,
      paymentCurrency: 'HKD',
    };

    try {
      await purchaseMutation.mutateAsync(purchaseRequest);
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const totalAmount = selectedTicketType ? selectedTicketType.price * quantity : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Purchase Tickets</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Event Info */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-2">{event.title}</h3>
          <p className="text-gray-600 text-sm">
            {event.venue.name} • {new Date(event.eventDate).toLocaleDateString()}
          </p>
        </div>

        {/* Ticket Selection */}
        <div className="p-6">
          <h4 className="font-medium mb-4">Select Ticket Type</h4>
          <div className="space-y-3 mb-6">
            {event.ticketTypes.map(ticketType => (
              <div
                key={ticketType.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedTicketType?.id === ticketType.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTicketType(ticketType)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">{ticketType.name}</h5>
                    <p className="text-gray-600 text-sm mt-1">
                      {ticketType.quantityAvailable} tickets available
                    </p>
                    {ticketType.perks.length > 0 && (
                      <div className="mt-2">
                        {ticketType.perks.map(perk => (
                          <span
                            key={perk.name}
                            className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-1"
                          >
                            {perk.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {ticketType.nftMetadata && (
                      <div className="flex items-center mt-2 text-sm text-blue-600">
                        <Zap className="h-4 w-4 mr-1" />
                        Includes NFT Collectible
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">HKD {ticketType.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quantity Selector */}
          {selectedTicketType && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                max={selectedTicketType.quantityAvailable}
              >
                {Array.from({ length: Math.min(10, selectedTicketType.quantityAvailable) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'ticket' : 'tickets'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Summary */}
          {selectedTicketType && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-3">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{selectedTicketType.name} × {quantity}</span>
                  <span>HKD {selectedTicketType.price * quantity}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total</span>
                  <span>HKD {totalAmount}</span>
                </div>
              </div>

              {wallet && totalAmount > wallet.balance && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">
                    Insufficient balance. You need HKD {totalAmount - wallet.balance} more.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Security Features */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Secure HKD Payment
            </div>
            <div className="flex items-center">
              <Ticket className="h-4 w-4 mr-1" />
              Instant NFT Delivery
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={!selectedTicketType || purchaseMutation.isLoading || (wallet && totalAmount > wallet.balance)}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {purchaseMutation.isLoading ? 'Processing...' : `Pay HKD ${totalAmount}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPurchaseModal;
