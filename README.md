# 💊 MedCart Mobile Application & Backend API

**MedCart** is a modern, clean, and intuitive pharmacy mobile application built with **React Native (Expo)** and a **Node.js/Express + MongoDB** REST API backend, following the MedCart Mobile App UI/UX Specification.

---

## 📱 Features

- **Home Screen**: Time-based greeting, search bar, **Today's Offers** (discount badges & add to cart), **Categories Grid**, **Upload Prescription CTA** (via WhatsApp deep linking), **Live Order Tracking Card** with stage progress indicator, and **Popular Medicines**.
- **Categories Screen**: Interactive category tabs (*Tablets*, *Baby Care*, *Diabetes*, *Personal Care*) & product list with `Rx Required` badges.
- **Medicine Details Modal**: Dosage, manufacturer info, prescription warnings, quantity picker (+/-), and total pricing.
- **Cart & Checkout**: Quantity controls, item removal, free delivery threshold calculation, bill summary, and checkout with **UPI**, **Credit/Debit Cards**, and **Cash on Delivery (COD)**.
- **Orders & Tracking**: Order history listing with status stages (*Preparing → Packed → Out for Delivery → Delivered*).
- **Profile & Settings**: **Dark Mode toggle**, **Medicine Refill Reminders**, and **Pharmacist Chat**.

---

## 🚀 How to Run the Project

### Prerequisites
1. **Node.js** (v18 or higher installed on your computer).
2. **Expo Go App** installed on your mobile phone:
   - [Get Expo Go on Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [Get Expo Go on iOS App Store](https://apps.apple.com/app/expo-go/id982107779)

---

### Step 1: Start the Backend Server (Express + MongoDB)

Open a terminal window and run:

```bash
# Navigate to the server folder
cd server

# Install dependencies (if not already installed)
npm install

# Start the backend server
npm start
```

> **Backend API URL**: `http://localhost:5000/api`  
> *Note: The server includes an automatic fallback data engine, so it works seamlessly even if local MongoDB is offline!*

---

### Step 2: Start the Frontend Mobile App (React Native Expo)

Open a **second terminal window** and run:

```bash
# Navigate to the client folder
cd client

# Install dependencies (if not already installed)
npm install

# Start Expo dev server
npx expo start
```

If you are testing on a mobile device on a different network or cellular data, run:
```bash
npx expo start --tunnel
```

---

## 📲 How to Scan QR Code & View App on Mobile

1. Open the **Expo Go** app on your phone.
2. **On Android**: Tap **"Scan QR Code"** inside the Expo Go app and scan the QR code displayed in your computer terminal.
3. **On iOS**: Open the built-in **Camera app** and scan the QR code displayed in your terminal, then tap the Expo notification to open.

---

## 🌐 Connecting Mobile App to Backend on Physical Phone

When running Expo Go on a physical phone, `localhost` refers to the phone itself. To connect your phone to your computer's local backend API:

1. Find your computer's local IP address (`ipconfig` on Windows or `ifconfig` on Mac/Linux, e.g., `192.168.1.15`).
2. Open [`client/src/services/api.js`](file:///d:/code%20playground/Bhawani%20Medical/client/src/services/api.js) and set `API_BASE_URL` to your local IP:
   ```javascript
   const API_BASE_URL = 'http://192.168.1.15:5000/api'; // Replace 192.168.1.15 with your PC IP
   ```
*(Or keep using `localhost` if testing on an Android Emulator / iOS Simulator / Web).*

---

## 📁 Project Structure

```
d:/code playground/Bhawani Medical/
├── README.md                      # Project documentation and guide
├── MedCart Mobile App UI-UX Specification.pdf
├── server/                        # Express + MongoDB REST API Backend
│   ├── config/db.js               # Database connection & memory fallback
│   ├── models/                    # Mongoose models (Medicine, Category, Order, etc.)
│   ├── routes/api.js              # REST API endpoints
│   ├── seed.js                    # Database seeder script
│   └── index.js                   # Server entry point (Port 5000)
│
└── client/                        # React Native Expo Mobile App
    ├── App.js                     # Root entry point
    ├── src/
    │   ├── components/            # Header, SearchBar, CategoryGrid, BottomNavigation, etc.
    │   ├── context/               # ThemeContext (Dark Mode), CartContext, OrderContext
    │   ├── screens/               # Home, Categories, Cart, Orders, Profile, Chat, Reminders
    │   ├── services/api.js        # API service client
    │   └── theme/colors.js        # Design System tokens (#22C55E, #BBF7D0)
    └── package.json
```

