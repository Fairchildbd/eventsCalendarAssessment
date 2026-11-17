import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Reservation, TicketListing } from '@/types';
import { reservedByListing as countReserved } from '@/utils/reservation';

interface ReservationsValue {
  reservations: Reservation[];
  loading: boolean;
  loadError: boolean;
  addReservation: (reservation: Reservation) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  getReservation: (id: string | undefined) => Reservation | undefined;
  remainingFor: (listing: TicketListing) => number;
}

const RESERVATIONS_KEY = 'mohegan-demo-reservations-v1';

const ReservationsContext = createContext<ReservationsValue | null>(null);

export function ReservationsProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(RESERVATIONS_KEY)
      .then((savedJson) => {
        if (cancelled) return;
        const saved: unknown = savedJson ? JSON.parse(savedJson) : [];
        if (!Array.isArray(saved)) throw new Error('Saved reservations are not a list');
        setReservations(saved);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveReservations = useCallback(
    async (next: Reservation[]) => {
      if (loading || loadError) {
        throw new Error('Saved tickets could not be read, so nothing was saved. Your existing tickets are untouched.');
      }
      await AsyncStorage.setItem(RESERVATIONS_KEY, JSON.stringify(next));
      setReservations(next);
    },
    [loading, loadError],
  );

  const addReservation = useCallback(
    async (reservation: Reservation) => {
      if (reservations.some((saved) => saved.id === reservation.id)) return;
      await saveReservations([reservation, ...reservations]);
    },
    [reservations, saveReservations],
  );

  const cancelReservation = useCallback(
    async (id: string) => {
      const target = reservations.find((saved) => saved.id === id);
      if (!target || target.cancelledAt) return;
      const cancelledAt = new Date().toISOString();
      await saveReservations(reservations.map((saved) => (saved.id === id ? { ...saved, cancelledAt } : saved)));
    },
    [reservations, saveReservations],
  );

  const getReservation = useCallback(
    (id: string | undefined) => (id ? reservations.find((reservation) => reservation.id === id) : undefined),
    [reservations],
  );

  const reservedByListing = useMemo(() => countReserved(reservations), [reservations]);

  const remainingFor = useCallback(
    (listing: TicketListing) =>
      Math.max(0, listing.available - (reservedByListing.get(listing.id) ?? 0)),
    [reservedByListing],
  );

  const value = useMemo(
    () => ({ reservations, loading, loadError, addReservation, cancelReservation, getReservation, remainingFor }),
    [reservations, loading, loadError, addReservation, cancelReservation, getReservation, remainingFor],
  );

  return <ReservationsContext.Provider value={value}>{children}</ReservationsContext.Provider>;
}

export function useReservations(): ReservationsValue {
  const ctx = useContext(ReservationsContext);
  if (!ctx) throw new Error('useReservations must be used within ReservationsProvider');
  return ctx;
}
