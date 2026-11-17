import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { EVENTS } from '@/utils/__fixtures__/demoEvents';
import { ReservationsProvider, useReservations } from '@/store/ReservationsContext';
import { deferred } from '@/services/__fixtures__/fixtures';
import type { Reservation } from '@/types';
import { buildReservation } from '@/utils/reservation';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const RESERVATIONS_KEY = 'mohegan-demo-reservations-v1';
const wrapper = ({ children }: { children: ReactNode }) => <ReservationsProvider>{children}</ReservationsProvider>;

const event = EVENTS.find((candidate) => candidate.id === 'il-volo-2026-11-15')!;
const listing = event.ticketInventory.find((candidate) => candidate.available === 12)!;
const makeReservation = (id: string, quantity = 2): Reservation =>
  buildReservation(event, listing, quantity, new Date('2026-11-15T12:00:00Z'), Math.random, id);

const savedReservations = async () => JSON.parse((await AsyncStorage.getItem(RESERVATIONS_KEY)) ?? '[]') as Reservation[];

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useReservations: loading', () => {
  it('starts empty when nothing has been saved', async () => {
    const { result } = await renderHook(() => useReservations(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.reservations).toEqual([]);
    expect(result.current.loadError).toBe(false);
  });

  it('loads reservations saved on the device', async () => {
    const saved = makeReservation('res-saved');
    await AsyncStorage.setItem(RESERVATIONS_KEY, JSON.stringify([saved]));
    const { result } = await renderHook(() => useReservations(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.reservations).toEqual([saved]);
    expect(result.current.getReservation('res-saved')).toEqual(saved);
    expect(result.current.getReservation('missing')).toBeUndefined();
  });

  it.each([
    ['text that is not JSON', '{broken'],
    ['JSON that is not a list', '{"a":1}'],
  ])('reports a load error for %s and does not overwrite it', async (_caseName, savedJson) => {
    await AsyncStorage.setItem(RESERVATIONS_KEY, savedJson);
    const { result } = await renderHook(() => useReservations(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ reservations: [], loadError: true });

    await act(async () => {
      await expect(result.current.addReservation(makeReservation('res-new'))).rejects.toThrow(/nothing was saved/);
    });
    expect(await AsyncStorage.getItem(RESERVATIONS_KEY)).toBe(savedJson);
  });

  it('reports a load error when storage cannot be read', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk'));
    const { result } = await renderHook(() => useReservations(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ reservations: [], loadError: true });
  });
});

describe('useReservations: adding', () => {
  it('saves a new reservation to the device, newest first', async () => {
    const saved = makeReservation('res-saved');
    await AsyncStorage.setItem(RESERVATIONS_KEY, JSON.stringify([saved]));
    const { result } = await renderHook(() => useReservations(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const fresh = makeReservation('res-new');
    await act(async () => {
      await result.current.addReservation(fresh);
    });
    expect(result.current.reservations.map((reservation) => reservation.id)).toEqual(['res-new', 'res-saved']);
    expect((await savedReservations()).map((reservation) => reservation.id)).toEqual(['res-new', 'res-saved']);
  });

  it('ignores a reservation with an id that is already saved', async () => {
    const { result } = await renderHook(() => useReservations(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.addReservation(makeReservation('res-a'));
    });
    const setItem = jest.spyOn(AsyncStorage, 'setItem');
    setItem.mockClear();
    await act(async () => {
      await result.current.addReservation(makeReservation('res-a'));
    });
    expect(setItem).not.toHaveBeenCalled();
    expect(result.current.reservations).toHaveLength(1);
  });

  it('never overwrites saved tickets while they are still loading', async () => {
    const saved = makeReservation('res-saved');
    await AsyncStorage.setItem(RESERVATIONS_KEY, JSON.stringify([saved]));
    const gate = deferred<string | null>();
    jest.spyOn(AsyncStorage, 'getItem').mockReturnValueOnce(gate.promise);
    const { result } = await renderHook(() => useReservations(), { wrapper });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      await expect(result.current.addReservation(makeReservation('res-new'))).rejects.toThrow(/nothing was saved/);
    });
    expect((await savedReservations()).map((reservation) => reservation.id)).toEqual(['res-saved']);

    gate.resolve(JSON.stringify([saved]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.reservations).toEqual([saved]);
  });

  it('rejects, and keeps the list unchanged, when the write fails', async () => {
    const { result } = await renderHook(() => useReservations(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('quota'));

    await act(async () => {
      await expect(result.current.addReservation(makeReservation('res-new'))).rejects.toThrow('quota');
    });
    expect(result.current.reservations).toEqual([]);
  });
});

describe('useReservations: cancelling and inventory', () => {
  it('marks a reservation cancelled, saves it, and ignores a second cancel', async () => {
    const { result } = await renderHook(() => useReservations(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.addReservation(makeReservation('res-a'));
    });

    await act(async () => {
      await result.current.cancelReservation('res-a');
    });
    const cancelledAt = result.current.getReservation('res-a')?.cancelledAt;
    expect(cancelledAt).toEqual(expect.any(String));
    expect((await savedReservations())[0].cancelledAt).toBe(cancelledAt);

    const setItem = jest.spyOn(AsyncStorage, 'setItem');
    setItem.mockClear();
    await act(async () => {
      await result.current.cancelReservation('res-a');
      await result.current.cancelReservation('missing');
    });
    expect(setItem).not.toHaveBeenCalled();
  });

  it('holds tickets for active reservations only, and cancelling gives them back', async () => {
    const { result } = await renderHook(() => useReservations(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.remainingFor(listing)).toBe(12);

    await act(async () => {
      await result.current.addReservation(makeReservation('res-a', 5));
    });
    await act(async () => {
      await result.current.addReservation(makeReservation('res-b', 4));
    });
    expect(result.current.remainingFor(listing)).toBe(3);

    await act(async () => {
      await result.current.cancelReservation('res-a');
    });
    expect(result.current.remainingFor(listing)).toBe(8);
  });
});
