import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Driver } from '../../types';

interface DriverState {
  nearbyDrivers: Driver[];
  matchedDriver: Driver | null;
  driverLocation: { latitude: number; longitude: number; heading?: number } | null;
  isSearching: boolean;
}

const initialState: DriverState = {
  nearbyDrivers: [],
  matchedDriver: null,
  driverLocation: null,
  isSearching: false,
};

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    setNearbyDrivers: (state, action: PayloadAction<Driver[]>) => {
      state.nearbyDrivers = action.payload;
    },
    setMatchedDriver: (state, action: PayloadAction<Driver | null>) => {
      state.matchedDriver = action.payload;
    },
    updateDriverLocation: (state, action: PayloadAction<{ latitude: number; longitude: number; heading?: number }>) => {
      state.driverLocation = action.payload;
    },
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    clearDriver: (state) => {
      state.matchedDriver = null;
      state.driverLocation = null;
      state.isSearching = false;
    },
  },
});

export const { setNearbyDrivers, setMatchedDriver, updateDriverLocation, setSearching, clearDriver } = driverSlice.actions;
export default driverSlice.reducer;
