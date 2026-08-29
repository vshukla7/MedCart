import React, { useState } from 'react';
import { StyleSheet, View, StatusBar, Platform, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { CartProvider, useCart } from './src/context/CartContext';
import { OrderProvider } from './src/context/OrderContext';
import { BottomNavigation } from './src/components/BottomNavigation';
import { HomeScreen } from './src/screens/HomeScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { CartScreen } from './src/screens/CartScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MedicineDetailsModal } from './src/screens/MedicineDetailsModal';
import { CheckoutModal } from './src/screens/CheckoutModal';
import { RefillRemindersScreen } from './src/screens/RefillRemindersScreen';
import { PharmacistChatScreen } from './src/screens/PharmacistChatScreen';
import { AdminDashboardModal } from './src/components/AdminDashboardModal';
import { StaffDashboardModal } from './src/components/StaffDashboardModal';

// ─── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[MedCart ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={ebStyles.container}>
          <Text style={ebStyles.emoji}>💊</Text>
          <Text style={ebStyles.title}>MedCart ran into a problem</Text>
          <Text style={ebStyles.message}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Text>
          <TouchableOpacity
            style={ebStyles.btn}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={ebStyles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const ebStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#F0FFF4' },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#14532D', textAlign: 'center', marginBottom: 10 },
  message: { fontSize: 13, color: '#166534', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  btn: { backgroundColor: '#22C55E', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
// ─────────────────────────────────────────────────────────────────────────────

function MainApp() {
  const { theme, isDarkMode } = useTheme();
  const { clearCart } = useCart();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modals state
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showStaffDashboard, setShowStaffDashboard] = useState(false);

  const handleSelectCategory = (slug) => {
    setSelectedCategory(slug);
    setActiveTab('categories');
  };

  const handleSuccessOrder = (order) => {
    setActiveTab('orders');
  };

  const renderCurrentScreen = () => {
    if (!currentUser) {
      return (
        <LoginScreen 
          onLoginSuccess={(user) => {
            clearCart();
            setCurrentUser(user);
          }} 
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            currentUser={currentUser}
            onSelectCategory={handleSelectCategory}
            onSelectMedicine={setSelectedMedicine}
            onOpenProfile={() => setActiveTab('profile')}
            onOpenOrders={() => setActiveTab('orders')}
            onOpenChat={() => setShowChat(true)}
          />
        );
      case 'categories':
        return (
          <CategoriesScreen
            initialCategory={selectedCategory}
            onSelectMedicine={setSelectedMedicine}
          />
        );
      case 'cart':
        return (
          <CartScreen
            onProceedCheckout={() => setShowCheckout(true)}
            onBrowseMedicines={() => setActiveTab('categories')}
          />
        );
      case 'orders':
        return <OrdersScreen currentUser={currentUser} />;
      case 'profile':
        return (
          <ProfileScreen
            currentUser={currentUser}
            onLogout={() => {
              clearCart();
              setCurrentUser(null);
            }}
            onOpenReminders={() => setShowReminders(true)}
            onOpenChat={() => setShowChat(true)}
            onOpenOrders={() => setActiveTab('orders')}
            onOpenAdminDashboard={() => setShowAdminDashboard(true)}
            onOpenStaffDashboard={() => setShowStaffDashboard(true)}
            onUpdateUser={setCurrentUser}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      
      <View style={styles.screenBody}>
        {renderCurrentScreen()}
      </View>

      {currentUser && (
        <View style={styles.bottomNav}>
          <BottomNavigation
            activeTab={activeTab}
            onTabPress={setActiveTab}
          />
        </View>
      )}

      {/* Product Details Modal */}
      <MedicineDetailsModal
        visible={!!selectedMedicine}
        medicine={selectedMedicine}
        onClose={() => setSelectedMedicine(null)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        visible={showCheckout}
        currentUser={currentUser}
        onClose={() => setShowCheckout(false)}
        onSuccessOrder={handleSuccessOrder}
        onUpdateUser={setCurrentUser}
      />

      {/* Refill Reminders Screen */}
      <RefillRemindersScreen
        visible={showReminders}
        onClose={() => setShowReminders(false)}
      />

      {/* Pharmacist Chat Screen */}
      <PharmacistChatScreen
        visible={showChat}
        onClose={() => setShowChat(false)}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboardModal
        visible={showAdminDashboard}
        currentUser={currentUser}
        onClose={() => setShowAdminDashboard(false)}
      />

      {/* Staff Dashboard Modal */}
      <StaffDashboardModal
        visible={showStaffDashboard}
        currentUser={currentUser}
        onClose={() => setShowStaffDashboard(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <CartProvider>
            <OrderProvider>
              <MainApp />
            </OrderProvider>
          </CartProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  screenBody: {
    flex: 1
  },
  bottomNav: {
    paddingBottom: Platform.OS === 'ios' ? 10 : 0
  }
});
