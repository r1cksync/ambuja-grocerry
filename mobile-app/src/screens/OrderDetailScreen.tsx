import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES } from '../constants/config';
import { RootStackParamList } from '../navigation/RootNavigator';
import { orderAPI } from '../services/api';
import { Order } from '../types';

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

const statusColors: Record<string, string> = {
  pending: COLORS.warning,
  confirmed: COLORS.info,
  processing: COLORS.info,
  shipped: COLORS.primary,
  delivered: COLORS.success,
  cancelled: COLORS.error,
};

const statusIcons: Record<string, string> = {
  pending: 'time-outline',
  confirmed: 'checkmark-circle-outline',
  processing: 'cog-outline',
  shipped: 'car-outline',
  delivered: 'checkmark-done-outline',
  cancelled: 'close-circle-outline',
};

export default function OrderDetailScreen() {
  const route = useRoute<OrderDetailRouteProp>();
  const navigation = useNavigation();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getById(orderId);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray[300]} />
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Order Status */}
      <View style={styles.statusCard}>
        <View style={[styles.statusIconContainer, { backgroundColor: statusColors[order.status] + '20' }]}>
          <Ionicons
            name={statusIcons[order.status] as any}
            size={32}
            color={statusColors[order.status]}
          />
        </View>
        <Text style={styles.statusTitle}>Order {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Text>
        <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
        <Text style={styles.orderDate}>Placed on {formatDate(order.createdAt)}</Text>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items Ordered</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>
                {item.quantity} x {formatPrice(item.price)}
              </Text>
            </View>
            <Text style={styles.itemTotal}>{formatPrice(item.quantity * item.price)}</Text>
          </View>
        ))}
      </View>

      {/* Payment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Subtotal</Text>
          <Text style={styles.paymentValue}>{formatPrice(order.subtotal)}</Text>
        </View>
        {order.discount > 0 && (
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Discount</Text>
            <Text style={[styles.paymentValue, styles.discountText]}>-{formatPrice(order.discount)}</Text>
          </View>
        )}
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Delivery Charge</Text>
          <Text style={styles.paymentValue}>
            {order.deliveryCharge === 0 ? 'FREE' : formatPrice(order.deliveryCharge)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.paymentRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
        </View>
        <View style={styles.paymentMethod}>
          <Ionicons
            name={order.paymentMethod === 'cod' ? 'cash-outline' : 'card-outline'}
            size={20}
            color={COLORS.gray[600]}
          />
          <Text style={styles.paymentMethodText}>
            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
          </Text>
          <View style={[styles.paymentStatus, { backgroundColor: order.paymentStatus === 'paid' ? COLORS.success : COLORS.warning }]}>
            <Text style={styles.paymentStatusText}>
              {order.paymentStatus.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Delivery Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.addressCard}>
          <Ionicons name="location-outline" size={24} color={COLORS.primary} />
          <View style={styles.addressInfo}>
            <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
            <Text style={styles.addressText}>
              {order.shippingAddress.street}
              {order.shippingAddress.landmark && `, ${order.shippingAddress.landmark}`}
            </Text>
            <Text style={styles.addressText}>
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </Text>
            <Text style={styles.addressPhone}>{order.shippingAddress.phone}</Text>
          </View>
        </View>
      </View>

      {/* Order Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          {order.timeline.map((event, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              {index < order.timeline!.length - 1 && <View style={styles.timelineLine} />}
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>{event.status}</Text>
                <Text style={styles.timelineDate}>{formatDate(event.timestamp)}</Text>
                {event.note && <Text style={styles.timelineNote}>{event.note}</Text>}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Notes */}
      {order.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Instructions</Text>
          <Text style={styles.notesText}>{order.notes}</Text>
        </View>
      )}

      {/* Help Section */}
      <View style={styles.helpSection}>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.helpButtonText}>Need Help?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: SIZES.lg,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
  },
  backButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  orderNumber: {
    fontSize: SIZES.md,
    color: COLORS.gray[600],
    marginTop: SPACING.xs,
  },
  orderDate: {
    fontSize: SIZES.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.base,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: SIZES.base,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  itemQuantity: {
    fontSize: SIZES.sm,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  itemTotal: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  paymentLabel: {
    fontSize: SIZES.md,
    color: COLORS.gray[600],
  },
  paymentValue: {
    fontSize: SIZES.md,
    color: COLORS.gray[900],
  },
  discountText: {
    color: COLORS.success,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  totalValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
  },
  paymentMethodText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: SIZES.md,
    color: COLORS.gray[700],
  },
  paymentStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentStatusText: {
    fontSize: SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressInfo: {
    flex: 1,
    marginLeft: SPACING.md,
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
  timelineItem: {
    flexDirection: 'row',
    paddingLeft: SPACING.sm,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: SPACING.sm + 5,
    top: 16,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.primary + '30',
  },
  timelineContent: {
    flex: 1,
    marginLeft: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  timelineStatus: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[900],
    textTransform: 'capitalize',
  },
  timelineDate: {
    fontSize: SIZES.sm,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  timelineNote: {
    fontSize: SIZES.sm,
    color: COLORS.gray[600],
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  notesText: {
    fontSize: SIZES.md,
    color: COLORS.gray[600],
    lineHeight: 22,
  },
  helpSection: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  helpButtonText: {
    marginLeft: SPACING.sm,
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
