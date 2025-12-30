import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES } from '../constants/config';
import { useAuthStore } from '../store/authStore';
import { userAPI } from '../services/api';
import { Address } from '../types';

export default function AddAddressScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home' as 'home' | 'office' | 'other',
    isDefault: false,
  });

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    if (!formData.street.trim()) {
      Alert.alert('Error', 'Please enter street address');
      return;
    }
    if (!formData.city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return;
    }
    if (!formData.state.trim()) {
      Alert.alert('Error', 'Please enter state');
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return;
    }

    setIsLoading(true);
    try {
      const existingAddresses = user?.addresses || [];
      
      // If this is set as default, remove default from others
      const updatedAddresses: Address[] = formData.isDefault
        ? existingAddresses.map((a) => ({ ...a, isDefault: false }))
        : existingAddresses;
      
      // If it's the first address, make it default
      const newAddress: Address = {
        ...formData,
        isDefault: existingAddresses.length === 0 ? true : formData.isDefault,
      };

      const response = await userAPI.updateAddresses([...updatedAddresses, newAddress]);
      setUser({ ...user!, addresses: response.data.addresses });
      
      Alert.alert('Success', 'Address added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add address');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            placeholderTextColor={COLORS.gray[400]}
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
          />
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit phone number"
            placeholderTextColor={COLORS.gray[400]}
            keyboardType="phone-pad"
            maxLength={10}
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text.replace(/[^0-9]/g, ''))}
          />
        </View>

        {/* Street */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Street Address *</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="House/Flat No., Building, Street"
            placeholderTextColor={COLORS.gray[400]}
            multiline
            numberOfLines={2}
            value={formData.street}
            onChangeText={(text) => updateField('street', text)}
          />
        </View>

        {/* Landmark */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Landmark (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nearby landmark"
            placeholderTextColor={COLORS.gray[400]}
            value={formData.landmark}
            onChangeText={(text) => updateField('landmark', text)}
          />
        </View>

        {/* City & State */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor={COLORS.gray[400]}
              value={formData.city}
              onChangeText={(text) => updateField('city', text)}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              placeholder="State"
              placeholderTextColor={COLORS.gray[400]}
              value={formData.state}
              onChangeText={(text) => updateField('state', text)}
            />
          </View>
        </View>

        {/* Pincode */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pincode *</Text>
          <TextInput
            style={styles.input}
            placeholder="6-digit pincode"
            placeholderTextColor={COLORS.gray[400]}
            keyboardType="number-pad"
            maxLength={6}
            value={formData.pincode}
            onChangeText={(text) => updateField('pincode', text.replace(/[^0-9]/g, ''))}
          />
        </View>

        {/* Address Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address Type</Text>
          <View style={styles.typeContainer}>
            {(['home', 'office', 'other'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeButton, formData.type === type && styles.typeButtonActive]}
                onPress={() => updateField('type', type)}
              >
                <Ionicons
                  name={type === 'home' ? 'home-outline' : type === 'office' ? 'business-outline' : 'location-outline'}
                  size={20}
                  color={formData.type === type ? COLORS.white : COLORS.gray[600]}
                />
                <Text style={[styles.typeButtonText, formData.type === type && styles.typeButtonTextActive]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Set as Default */}
        <TouchableOpacity
          style={styles.defaultToggle}
          onPress={() => updateField('isDefault', !formData.isDefault)}
        >
          <Ionicons
            name={formData.isDefault ? 'checkbox' : 'square-outline'}
            size={24}
            color={formData.isDefault ? COLORS.primary : COLORS.gray[400]}
          />
          <Text style={styles.defaultToggleText}>Set as default address</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save Address</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.base,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.gray[100],
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: SIZES.base,
    color: COLORS.gray[900],
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLORS.gray[100],
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    marginLeft: SPACING.xs,
    fontSize: SIZES.md,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: COLORS.white,
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  defaultToggleText: {
    marginLeft: SPACING.sm,
    fontSize: SIZES.base,
    color: COLORS.gray[700],
  },
  bottomBar: {
    padding: SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.base,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: SIZES.base,
    fontWeight: 'bold',
  },
});
