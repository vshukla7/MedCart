import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { CartProvider } from './src/context/CartContext';
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

function MainApp() {
  const { theme, isDarkMode } = useTheme();
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
      return <LoginScreen onLoginSuccess={setCurrentUser} />;
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onSelectCategory={handleSelectCategory}
            onSelectMedicine={setSelectedMedicine}
            onOpenProfile={() => setActiveTab('profile')}
            onOpenOrders={() => setActiveTab('orders')}
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
            onLogout={() => setCurrentUser(null)}
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
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
    <ThemeProvider>
      <CartProvider>
        <OrderProvider>
          <MainApp />
        </OrderProvider>
      </CartProvider>
    </ThemeProvider>
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
