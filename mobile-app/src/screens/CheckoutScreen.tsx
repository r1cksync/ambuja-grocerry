import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES } from '../constants/config';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { orderAPI, couponAPI } from '../services/api';
import { Address } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CheckoutScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { cart, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Select default address if available
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [user]);

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const response = await couponAPI.apply(couponCode.trim());
      setAppliedCoupon({
        code: couponCode.trim(),
        discount: response.data.discount,
      });
      Alert.alert('Success', `Coupon applied! You saved ${formatPrice(response.data.discount)}`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (!cart || cart.items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        shippingAddress: selectedAddress,
        paymentMethod,
        notes,
        couponCode: appliedCoupon?.code,
      };

      const response = await orderAPI.create(orderData);
      await clearCart();
      
      Alert.alert(
        'Order Placed!',
        `Your order #${response.data.order.orderNumber} has been placed successfully.`,
        [
          {
            text: 'View Order',
            onPress: () => navigation.replace('OrderDetail', { orderId: response.data.order._id }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color={COLORS.gray[300]} />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('Main', { screen: 'Home' } as any)}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const subtotal = cart.subtotal;
  const discount = appliedCoupon?.discount || cart.discount;
  const deliveryCharge = cart.deliveryCharge;
  const total = subtotal - discount + deliveryCharge;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Addresses')}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>

          {selectedAddress ? (
            <View style={styles.addressCard}>
              <View style={styles.addressBadge}>
                <Text style={styles.addressBadgeText}>{selectedAddress.type}</Text>
              </View>
              <Text style={styles.addressName}>{selectedAddress.name}</Text>
              <Text style={styles.addressText}>
                {selectedAddress.street}
                {selectedAddress.landmark && `, ${selectedAddress.landmark}`}
              </Text>
              <Text style={styles.addressText}>
                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
              </Text>
              <Text style={styles.addressPhone}>{selectedAddress.phone}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => navigation.navigate('AddAddress')}
            >
              <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.addAddressText}>Add Delivery Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            {cart.items.map((item) => (
              <View key={item.product._id} style={styles.orderItem}>
                <Text style={styles.orderItemName} numberOfLines={1}>
                  {item.product.name} x {item.quantity}
                </Text>
                <Text style={styles.orderItemPrice}>{formatPrice(item.price)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Coupon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apply Coupon</Text>
          {appliedCoupon ? (
            <View style={styles.appliedCoupon}>
              <View style={styles.couponInfo}>
                <Ionicons name="ticket-outline" size={20} color={COLORS.success} />
                <Text style={styles.couponText}>{appliedCoupon.code}</Text>
                <Text style={styles.couponDiscount}>-{formatPrice(appliedCoupon.discount)}</Text>
              </View>
              <TouchableOpacity onPress={removeCoupon}>
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponInput}>
              <TextInput
                style={styles.couponTextInput}
                placeholder="Enter coupon code"
                placeholderTextColor={COLORS.gray[400]}
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyCoupon}
                disabled={isApplyingCoupon}
              >
                {isApplyingCoupon ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.applyButtonText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'COD' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod('COD')}
          >
            <View style={styles.radioOuter}>
              {paymentMethod === 'COD' && <View style={styles.radioInner} />}
            </View>
            <Ionicons name="cash-outline" size={24} color={COLORS.gray[700]} />
            <Text style={styles.paymentText}>Cash on Delivery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'ONLINE' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod('ONLINE')}
          >
            <View style={styles.radioOuter}>
              {paymentMethod === 'ONLINE' && <View style={styles.radioInner} />}
            </View>
            <Ionicons name="card-outline" size={24} color={COLORS.gray[700]} />
            <Text style={styles.paymentText}>Pay Online</Text>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Instructions (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any special instructions for delivery..."
            placeholderTextColor={COLORS.gray[400]}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Bottom Summary */}
      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
        </View>
        {discount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount</Text>
            <Text style={[styles.totalValue, styles.discountValue]}>-{formatPrice(discount)}</Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Delivery</Text>
          <Text style={styles.totalValue}>
            {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>{formatPrice(total)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderButton, !selectedAddress && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder || !selectedAddress}
        >
          {isPlacingOrder ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Text style={styles.placeOrderPrice}>{formatPrice(total)}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: SIZES.lg,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.lg,
  },
  shopButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.base,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: SIZES.base,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  changeText: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  addressCard: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addressBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  addressBadgeText: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  addressName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  addressText: {
    fontSize: SIZES.md,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  addressPhone: {
    fontSize: SIZES.md,
    color: COLORS.gray[600],
    marginTop: SPACING.xs,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  addAddressText: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  summaryCard: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
    padding: SPACING.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  orderItemName: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.gray[700],
  },
  orderItemPrice: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginLeft: SPACING.md,
  },
  appliedCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.success + '15',
    padding: SPACING.md,
    borderRadius: 8,
  },
  couponInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginLeft: SPACING.sm,
  },
  couponDiscount: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: SPACING.md,
  },
  couponInput: {
    flexDirection: 'row',
  },
  couponTextInput: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: SIZES.md,
    marginRight: SPACING.sm,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    borderRadius: 8,
  },
  applyButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: SIZES.md,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginBottom: SPACING.sm,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  paymentText: {
    fontSize: SIZES.md,
    color: COLORS.gray[700],
    marginLeft: SPACING.sm,
  },
  notesInput: {
    backgroundColor: COLORS.gray[100],
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: SIZES.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bottomBar: {
    backgroundColor: COLORS.white,
    padding: SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  totalLabel: {
    fontSize: SIZES.md,
    color: COLORS.gray[600],
  },
  totalValue: {
    fontSize: SIZES.md,
    color: COLORS.gray[900],
  },
  discountValue: {
    color: COLORS.success,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginVertical: SPACING.sm,
  },
  grandTotalLabel: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  grandTotalValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  placeOrderButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  placeOrderButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  placeOrderText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.base,
  },
  placeOrderPrice: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.base,
  },
});
