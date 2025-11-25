// frontend/src/hooks/useTicketing.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Event, 
  Ticket, 
  TicketPurchaseRequest, 
  TicketPurchaseResponse,
  ResaleListing 
} from '../types/ticketing';
import { ticketingApi } from '../services/ticketingApi';
import { toast } from 'react-hot-toast';

export const useEvents = (filters?: any) => {
  return useQuery(
    ['events', filters],
    () => ticketingApi.getEvents(filters),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );
};

export const useEvent = (eventId: string) => {
  return useQuery(
    ['event', eventId],
    () => ticketingApi.getEvent(eventId),
    {
      enabled: !!eventId,
    }
  );
};

export const useUserTickets = (walletAddress: string) => {
  return useQuery(
    ['tickets', walletAddress],
    () => ticketingApi.getUserTickets(walletAddress),
    {
      enabled: !!walletAddress,
    }
  );
};

export const usePurchaseTickets = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (purchaseRequest: TicketPurchaseRequest) => ticketingApi.purchaseTickets(purchaseRequest),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['tickets', data.tickets[0]?.ownerWallet]);
        queryClient.invalidateQueries('wallet');
        toast.success(`Successfully purchased ${data.tickets.length} tickets!`);
        
        // Show NFT minting status if applicable
        if (data.nftMintTransactions.length > 0) {
          toast.success('NFT collectibles are being minted...');
        }
      },
      onError: (error: any) => {
        toast.error(`Purchase failed: ${error.response?.data?.message || error.message}`);
      },
    }
  );
};

export const useListTicketForResale = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ ticketId, askingPrice, currency }: { ticketId: string; askingPrice: number; currency: string }) =>
      ticketingApi.listTicketForResale(ticketId, askingPrice, currency),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['tickets', data.sellerWallet]);
        toast.success('Ticket listed for resale!');
      },
      onError: (error: any) => {
        toast.error(`Failed to list ticket: ${error.response?.data?.message || error.message}`);
      },
    }
  );
};
