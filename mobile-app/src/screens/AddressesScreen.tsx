import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES } from '../constants/config';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuthStore } from '../store/authStore';
import { userAPI } from '../services/api';
import { Address } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AddressesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const addresses = user?.addresses || [];

  const handleSetDefault = async (addressId: string) => {
    setIsLoading(true);
    try {
      const response = await userAPI.updateAddresses(
        addresses.map((a) => ({
          ...a,
          isDefault: a._id === addressId,
        }))
      );
      setUser({ ...user!, addresses: response.data.addresses });
    } catch (error) {
      Alert.alert('Error', 'Failed to update default address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const updatedAddresses = addresses.filter((a) => a._id !== addressId);
              const response = await userAPI.updateAddresses(updatedAddresses);
              setUser({ ...user!, addresses: response.data.addresses });
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <View style={[styles.addressCard, item.isDefault && styles.defaultCard]}>
      <View style={styles.addressHeader}>
        <View style={[styles.typeBadge, { backgroundColor: item.type === 'home' ? COLORS.primary + '20' : COLORS.warning + '20' }]}>
          <Ionicons
            name={item.type === 'home' ? 'home-outline' : 'business-outline'}
            size={16}
            color={item.type === 'home' ? COLORS.primary : COLORS.warning}
          />
          <Text style={[styles.typeBadgeText, { color: item.type === 'home' ? COLORS.primary : COLORS.warning }]}>
            {item.type.toUpperCase()}
          </Text>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>DEFAULT</Text>
          </View>
        )}
      </View>

      <Text style={styles.addressName}>{item.name}</Text>
      <Text style={styles.addressText}>
        {item.street}
        {item.landmark && `, ${item.landmark}`}
      </Text>
      <Text style={styles.addressText}>
        {item.city}, {item.state} - {item.pincode}
      </Text>
      <Text style={styles.addressPhone}>{item.phone}</Text>

      <View style={styles.addressActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item._id!)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.actionText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item._id!)}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      <FlatList
        data={addresses}
        renderItem={renderAddress}
        keyExtractor={(item) => item._id || item.pincode}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color={COLORS.gray[300]} />
            <Text style={styles.emptyTitle}>No addresses saved</Text>
            <Text style={styles.emptySubtitle}>
              Add your first delivery address
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddAddress')}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  listContent: {
    padding: SPACING.base,
    paddingBottom: 100,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  defaultCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    marginLeft: 4,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  addressName: {
    fontSize: SIZES.base,
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
  addressActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  actionText: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: SIZES.md,
    color: COLORS.gray[500],
    marginTop: SPACING.sm,
  },
  addButton: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.base,
    right: SPACING.base,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.base,
    borderRadius: 12,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: SIZES.base,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
});
