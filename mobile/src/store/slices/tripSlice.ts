import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Booking } from '../../types';

interface TripState {
  currentTrip: Booking | null;
  elapsedTime: number; // seconds
  remainingDistance: number; // km
  eta: number; // minutes
}

const initialState: TripState = {
  currentTrip: null,
  elapsedTime: 0,
  remainingDistance: 0,
  eta: 0,
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setCurrentTrip: (state, action: PayloadAction<Booking>) => {
      state.currentTrip = action.payload;
    },
    updateTripProgress: (state, action: PayloadAction<{ remainingDistance: number; eta: number }>) => {
      state.remainingDistance = action.payload.remainingDistance;
      state.eta = action.payload.eta;
    },
    incrementElapsed: (state) => {
      state.elapsedTime += 1;
    },
    clearTrip: (state) => {
      state.currentTrip = null;
      state.elapsedTime = 0;
      state.remainingDistance = 0;
      state.eta = 0;
    },
  },
});

export const { setCurrentTrip, updateTripProgress, incrementElapsed, clearTrip } = tripSlice.actions;
export default tripSlice.reducer;
