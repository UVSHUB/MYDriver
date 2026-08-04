import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

interface SavedPlace {
  id: string;
  type: 'home' | 'work' | 'airport' | 'other';
  title: string;
  address: string;
  latitude: number;
  longitude: number;
}

export default function SavedPlacesScreen({ navigation }: any) {
  const [places, setPlaces] = useState<SavedPlace[]>([
    {
      id: '1',
      type: 'home',
      title: 'Home 🏠',
      address: 'No. 45, Galle Road, Colombo 03',
      latitude: 6.9271,
      longitude: 79.8612,
    },
    {
      id: '2',
      type: 'work',
      title: 'Work 💼',
      address: 'World Trade Center, Echelon Square, Colombo 01',
      latitude: 6.9344,
      longitude: 79.8428,
    },
    {
      id: '3',
      type: 'airport',
      title: 'Bandaranaike Airport ✈️',
      address: 'Katunayake Airport Access Rd, Katunayake',
      latitude: 7.1808,
      longitude: 79.8841,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');

  const handleAddPlace = () => {
    if (!title.trim() || !address.trim()) {
      Alert.alert('Missing Info', 'Please provide a title and address.');
      return;
    }
    const newPlace: SavedPlace = {
      id: Date.now().toString(),
      type: 'other',
      title: title.trim(),
      address: address.trim(),
      latitude: 6.9271,
      longitude: 79.8612,
    };
    setPlaces(prev => [...prev, newPlace]);
    setTitle('');
    setAddress('');
    setShowAddModal(false);
    Alert.alert('Saved 🎉', 'New place added to your shortcuts!');
  };

  const handleDelete = (id: string) => {
    setPlaces(prev => prev.filter(p => p.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'home': return 'home';
      case 'work': return 'briefcase';
      case 'airport': return 'airplane';
      default: return 'location';
    }
  };

  const renderItem = ({ item }: { item: SavedPlace }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Ionicons name={getIcon(item.type)} size={22} color={COLORS.black} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.placeTitle}>{item.title}</Text>
          <Text style={styles.placeAddress} numberOfLines={2}>{item.address}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Places 📍</Text>
      </View>

      <FlatList
        data={places}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.sectionHeader}>YOUR QUICK DESTINATION SHORTCUTS</Text>
        }
      />

      {showAddModal && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add New Favorite Place</Text>
          <TextInput style={styles.input} placeholder="Label (e.g. Gym 🏋️, Beach 🏖️)" value={title} onChangeText={setTitle} />
          <TextInput style={styles.input} placeholder="Full Address / Location" value={address} onChangeText={setAddress} />
          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddPlace}>
              <Text style={styles.saveTxt}>Save Place</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!showAddModal && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)} activeOpacity={0.85}>
            <Ionicons name="add" size={22} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add New Favorite Place</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.textPrimary },
  listContent: { padding: SPACING.xl, gap: 12 },
  sectionHeader: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.2, marginBottom: 8 },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.cardBorder },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  placeTitle: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.textPrimary },
  placeAddress: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2, lineHeight: 18 },
  deleteButton: { padding: 8 },
  formContainer: { backgroundColor: COLORS.surface, padding: SPACING.xl, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: COLORS.cardBorder, gap: 12 },
  formTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  input: { backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md, height: 48, paddingHorizontal: SPACING.base, borderWidth: 1, borderColor: COLORS.cardBorder, fontSize: FONT_SIZES.base },
  formButtons: { flexDirection: 'row', gap: 12, marginTop: 6 },
  cancelBtn: { flex: 1, height: 48, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center' },
  cancelTxt: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.textPrimary },
  saveBtn: { flex: 1, height: 48, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  saveTxt: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.white },
  footer: { padding: SPACING.xl, paddingBottom: 36 },
  addButton: { backgroundColor: COLORS.primary, height: 54, borderRadius: BORDER_RADIUS.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...SHADOWS.md },
  addButtonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
});
