# Driver On Demand 🚗

> A production-ready mobile application that allows users to hire professional drivers to drive their own vehicles safely.

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)

---

## 📱 Features

- ✅ **JWT + OTP Authentication** (Register, Login, Forgot Password)
- ✅ **4 Service Types**: Drive Me Home, Hire Driver, Emergency Driver, Airport Driver
- ✅ **Google Maps** Pickup & Destination selection
- ✅ **Real-time Driver Tracking** via Socket.io
- ✅ **Fare Calculation** with breakdown (Driver Fee + Platform Fee)
- ✅ **Wallet System** with balance management
- ✅ **PayHere** payment integration (Sri Lanka)
- ✅ **Push Notifications** via Expo
- ✅ **SOS Emergency** feature
- ✅ **Driver Rating** system with categories
- ✅ **Vehicle Management** (CRUD)
- ✅ **Dark Mode** design
- ✅ **Redux Toolkit** state management
- ✅ **React Query** for server state

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native + Expo (TypeScript) |
| Backend API | Node.js + Express.js (TypeScript) |
| Database | MongoDB + Mongoose |
| Authentication | JWT + OTP (Twilio) |
| Maps | Google Maps API + Places Autocomplete |
| Real-time | Socket.io |
| State Management | Redux Toolkit + React Query |
| Push Notifications | Expo Notifications |
| Image Storage | Cloudinary |
| Payments | PayHere Sri Lanka |

---

## 📁 Project Structure

```
MYDriver/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/             # DB, Cloudinary config
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth, error middleware
│   │   ├── models/             # MongoDB models (8 collections)
│   │   ├── routes/             # API routes
│   │   ├── services/           # OTP, Push notifications
│   │   ├── socket/             # Socket.io real-time handler
│   │   └── utils/              # Helpers, logger, AppError
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── mobile/                     # Expo React Native App
    ├── src/
    │   ├── api/                # Axios API client + API modules
    │   ├── constants/          # Colors, fonts, spacing, services
    │   ├── navigation/         # React Navigation (all stacks)
    │   ├── screens/
    │   │   ├── auth/           # Splash, Welcome, Register, OTP, Login
    │   │   ├── booking/        # ServiceSelect, PickupMap, Destination, Vehicle, Summary
    │   │   ├── main/           # Home, Profile, Wallet
    │   │   └── trip/           # Searching, Rating
    │   ├── store/              # Redux slices (auth, booking, driver, trip, wallet, notifications)
    │   └── types/              # TypeScript interfaces
    ├── App.tsx
    ├── app.json
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone
- A Google Maps API key
- A Twilio account (for OTP SMS)

---

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Edit .env with your values:
#    - MONGODB_URI
#    - JWT_SECRET & JWT_REFRESH_SECRET
#    - TWILIO credentials
#    - GOOGLE_MAPS_API_KEY
#    - CLOUDINARY credentials
#    - PAYHERE credentials

# 5. Start development server
npm run dev
```

The backend will start at **http://localhost:5000**

---

### Mobile App Setup

```bash
# 1. Navigate to mobile
cd mobile

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Set your environment variables in .env:
EXPO_PUBLIC_API_URL=http://<your-local-ip>:5000/api
EXPO_PUBLIC_SOCKET_URL=http://<your-local-ip>:5000
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key

# 4. Add your Google Maps API key in app.json for Android

# 5. Start Expo development server
npm start

# 6. Scan QR code with Expo Go app
```

> ⚠️ Use your **local network IP** (not localhost) in `EXPO_PUBLIC_API_URL` when running on a physical device.

---

## 🌐 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/verify-otp` | Verify OTP | No |
| POST | `/auth/resend-otp` | Resend OTP | No |
| POST | `/auth/login` | Login (email+password) | No |
| POST | `/auth/login/phone` | Login (send phone OTP) | No |
| POST | `/auth/login/phone/verify` | Verify phone login OTP | No |
| POST | `/auth/forgot-password` | Send reset OTP | No |
| POST | `/auth/reset-password` | Reset password | No |
| POST | `/auth/refresh-token` | Refresh JWT | No |

### User Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/users/profile` | Get user profile | ✅ |
| PUT | `/users/profile` | Update profile | ✅ |
| POST | `/users/upload-image` | Upload avatar | ✅ |
| GET | `/users/wallet` | Get wallet balance | ✅ |
| POST | `/users/wallet/add` | Add wallet funds | ✅ |

### Vehicle Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/vehicles` | Get user vehicles | ✅ |
| POST | `/vehicles` | Add vehicle | ✅ |
| PUT | `/vehicles/:id` | Update vehicle | ✅ |
| DELETE | `/vehicles/:id` | Delete vehicle | ✅ |

### Booking Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/bookings` | Create booking | ✅ |
| GET | `/bookings` | Get booking history | ✅ |
| GET | `/bookings/:id` | Get booking | ✅ |
| PUT | `/bookings/:id/cancel` | Cancel booking | ✅ |

### Driver Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/drivers/nearby` | Get nearby drivers | ✅ |
| GET | `/drivers/:id` | Get driver details | ✅ |

### Payment Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/payments` | Create payment | ✅ |
| POST | `/payments/verify` | Verify payment | ✅ |

---

## 📡 Socket.io Events

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `driver:update-location` | `{ latitude, longitude, heading }` | Driver location update |
| `driver:accept-booking` | `{ bookingId, driverId }` | Driver accepts booking |
| `driver:arrived` | `{ bookingId }` | Driver at pickup |
| `trip:start` | `{ bookingId }` | Start trip |
| `trip:complete` | `{ bookingId }` | Complete trip |
| `sos:trigger` | `{ bookingId, location }` | SOS emergency |

### Server → Client
| Event | Description |
|---|---|
| `driver:location` | Real-time driver location |
| `booking:matched` | Driver matched to booking |
| `driver:arrived` | Driver arrived at pickup |
| `trip:started` | Trip started |
| `trip:completed` | Trip completed |
| `sos:alert` | SOS alert (admin) |

---

## 🗄️ MongoDB Collections

| Collection | Description |
|---|---|
| `users` | Customer and driver accounts |
| `drivers` | Driver profiles with geolocation |
| `vehicles` | User vehicles |
| `bookings` | Trip bookings |
| `payments` | Payment records |
| `notifications` | Push notification records |
| `reviews` | Trip ratings and feedback |
| `emergencycontacts` | User emergency contacts |

---

## 🔐 Environment Variables

### Backend (`.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/driverondemand
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
GOOGLE_MAPS_API_KEY=your_maps_key
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_secret
PAYHERE_SANDBOX=true
EXPO_ACCESS_TOKEN=your_expo_token
```

### Mobile (`.env`)

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_maps_key
```

---

## 📱 Screens Overview

| Screen | Description |
|---|---|
| Splash | Loading animation with auth check |
| Welcome | App intro with Get Started + Login |
| Register | Form with password strength indicator |
| OTP Verification | 6-digit animated input |
| Login | Email+password or Phone+OTP tabs |
| Home | Greeting, location, services, nearby drivers, promotions |
| Service Select | 4 service type cards |
| Pickup Map | Google Maps with draggable pin |
| Destination | Google Places Autocomplete |
| Vehicle Info | User vehicles selection |
| Trip Summary | Fare breakdown + payment method |
| Searching | Animated pulse rings + driver search |
| Rating | 5-star + category + quick feedback tags |
| Profile | User info + menu + stats |
| Wallet | Balance + transactions + payment methods |

---

## 🚀 Deployment

### Backend (Production)

```bash
# Build
npm run build

# Start
npm start

# Or use PM2
pm2 start dist/index.js --name "dod-backend"
```

### Mobile (EAS Build)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

---

## 🛡️ Security Features

- JWT tokens with 15-minute expiry + 7-day refresh tokens
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100 req/15min global, 20 req/15min auth)
- Helmet.js security headers
- CORS configuration
- OTP expiry (10 minutes)
- Role-based access control (customer/driver/admin)
- MongoDB injection protection via Mongoose

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for Sri Lanka 🇱🇰
