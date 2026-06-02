import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Booking, ServiceType, Location } from '../../types';

interface BookingState {
  activeBooking: Booking | null;
  selectedService: ServiceType | null;
  pickupLocation: Location | null;
  dropLocation: Location | null;
  selectedVehicleId: string | null;
  estimatedDistance: number;
  estimatedDuration: number;
  driverFee: number;
  platformFee: number;
  totalCost: number;
  isLoading: boolean;
}

const initialState: BookingState = {
  activeBooking: null,
  selectedService: null,
  pickupLocation: null,
  dropLocation: null,
  selectedVehicleId: null,
  estimatedDistance: 0,
  estimatedDuration: 0,
  driverFee: 0,
  platformFee: 0,
  totalCost: 0,
  isLoading: false,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setService: (state, action: PayloadAction<ServiceType>) => {
      state.selectedService = action.payload;
    },
    setPickupLocation: (state, action: PayloadAction<Location>) => {
      state.pickupLocation = action.payload;
    },
    setDropLocation: (state, action: PayloadAction<Location>) => {
      state.dropLocation = action.payload;
    },
    setVehicle: (state, action: PayloadAction<string>) => {
      state.selectedVehicleId = action.payload;
    },
    setTripEstimate: (state, action: PayloadAction<{
      distance: number;
      duration: number;
      driverFee: number;
      platformFee: number;
      totalCost: number;
    }>) => {
      state.estimatedDistance = action.payload.distance;
      state.estimatedDuration = action.payload.duration;
      state.driverFee = action.payload.driverFee;
      state.platformFee = action.payload.platformFee;
      state.totalCost = action.payload.totalCost;
    },
    setActiveBooking: (state, action: PayloadAction<Booking>) => {
      state.activeBooking = action.payload;
    },
    updateBookingStatus: (state, action: PayloadAction<Booking['status']>) => {
      if (state.activeBooking) {
        state.activeBooking.status = action.payload;
      }
    },
    clearBooking: (state) => {
      state.activeBooking = null;
      state.selectedService = null;
      state.pickupLocation = null;
      state.dropLocation = null;
      state.selectedVehicleId = null;
      state.estimatedDistance = 0;
      state.estimatedDuration = 0;
      state.driverFee = 0;
      state.platformFee = 0;
      state.totalCost = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setService,
  setPickupLocation,
  setDropLocation,
  setVehicle,
  setTripEstimate,
  setActiveBooking,
  updateBookingStatus,
  clearBooking,
  setLoading,
} = bookingSlice.actions;

export default bookingSlice.reducer;
