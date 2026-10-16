import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '@/lib/wallet-context';

export function LockScreen() {
  const router = useRouter();
  const { unlockWallet, resetWallet } = useWallet();
  const [pin, setPin] = useState('');

  const handlePress = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 6) {
        handleUnlock(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleUnlock = async (code: string) => {
    const success = await unlockWallet(code);
    if (!success) {
      Alert.alert('Error', 'Incorrect PIN');
      setPin('');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Wallet',
      'Are you sure? This will delete all local data and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetWallet },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>DAIO Wallet</Text>
        <Text style={styles.subtitle}>Enter PIN to unlock</Text>

        <View style={styles.dotsRow}>
          {[...Array(6)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                pin.length > i && styles.dotFilled,
              ]}
            />
          ))}
        </View>

        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              onPress={() => handlePress(num.toString())}
            >
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.key} onPress={handleReset}>
            <Text style={styles.keyReset}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.key}
            onPress={() => handlePress('0')}
          >
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={handleDelete}>
            <Text style={styles.keyDelete}>⌫</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.recoveryLink}
          onPress={() => router.push('/recovery' as any)}
        >
          <Text style={styles.recoveryText}>Forgot PIN? Recover Access via Heirs</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#3B82F6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 48,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 64,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  dotFilled: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  keyDelete: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  keyReset: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  recoveryLink: {
    marginTop: 48,
    padding: 12,
  },
  recoveryText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
});
