import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../constants/config';

// Screen imports
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CategoryProductsScreen from '../screens/CategoryProductsScreen';
import SearchScreen from '../screens/SearchScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import AddressesScreen from '../screens/AddressesScreen';
import AddAddressScreen from '../screens/AddAddressScreen';

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  ProductDetail: { slug: string };
  CategoryProducts: { slug: string; name: string };
  Search: undefined;
  Checkout: undefined;
  OrderDetail: { orderId: string };
  Addresses: undefined;
  AddAddress: { address?: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetailScreen}
            options={{ headerShown: true, title: 'Product Details' }}
          />
          <Stack.Screen 
            name="CategoryProducts" 
            component={CategoryProductsScreen}
            options={({ route }) => ({ 
              headerShown: true, 
              title: route.params.name,
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            })}
          />
          <Stack.Screen 
            name="Search" 
            component={SearchScreen}
            options={{ headerShown: true, title: 'Search' }}
          />
          <Stack.Screen 
            name="Checkout" 
            component={CheckoutScreen}
            options={{ 
              headerShown: true, 
              title: 'Checkout',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
          <Stack.Screen 
            name="OrderDetail" 
            component={OrderDetailScreen}
            options={{ 
              headerShown: true, 
              title: 'Order Details',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
          <Stack.Screen 
            name="Addresses" 
            component={AddressesScreen}
            options={{ 
              headerShown: true, 
              title: 'My Addresses',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
          <Stack.Screen 
            name="AddAddress" 
            component={AddAddressScreen}
            options={{ 
              headerShown: true, 
              title: 'Add Address',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
