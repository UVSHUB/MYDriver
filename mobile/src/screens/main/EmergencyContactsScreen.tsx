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

interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export default function EmergencyContactsScreen({ navigation }: any) {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Family Contact', phone: '+94 77 987 6543', relation: 'Spouse' }
  ]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddContact = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please provide contact name and phone number.');
      return;
    }
    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      phone,
      relation: relation || 'Contact',
    };
    setContacts(prev => [...prev, newContact]);
    setName('');
    setPhone('');
    setRelation('');
    setShowAddForm(false);
    Alert.alert('Added', 'Emergency contact saved.');
  };

  const handleDelete = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const renderItem = ({ item }: { item: Contact }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.iconCircle}>
          <Ionicons name="person" size={22} color={COLORS.black} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phone}</Text>
          <Text style={styles.relationBadge}>{item.relation}</Text>
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
        <Text style={styles.headerTitle}>Emergency Contacts 🆘</Text>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.infoBanner}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>
              In the event of an SOS alert during a ride, your active emergency contacts will receive instant SMS notifications with your live GPS location.
            </Text>
          </View>
        }
      />

      {showAddForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add Emergency Contact</Text>
          <TextInput style={styles.input} placeholder="Contact Name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Relation (e.g. Spouse, Parent)" value={relation} onChangeText={setRelation} />
          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.cancelFormBtn} onPress={() => setShowAddForm(false)}>
              <Text style={styles.cancelFormTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveFormBtn} onPress={handleAddContact}>
              <Text style={styles.saveFormTxt}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!showAddForm && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddForm(true)} activeOpacity={0.85}>
            <Ionicons name="add" size={22} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add Contact</Text>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
  },
  infoText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, lineHeight: 18, fontWeight: '500' },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.cardBorder },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  contactName: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.textPrimary },
  contactPhone: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
  relationBadge: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, fontWeight: '700' },
  deleteButton: { padding: 8 },
  formContainer: { backgroundColor: COLORS.surface, padding: SPACING.xl, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: COLORS.cardBorder, gap: 12 },
  formTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  input: { backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md, height: 48, paddingHorizontal: SPACING.base, borderWidth: 1, borderColor: COLORS.cardBorder, fontSize: FONT_SIZES.base },
  formButtons: { flexDirection: 'row', gap: 12, marginTop: 6 },
  cancelFormBtn: { flex: 1, height: 48, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center' },
  cancelFormTxt: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.textPrimary },
  saveFormBtn: { flex: 1, height: 48, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  saveFormTxt: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.white },
  footer: { padding: SPACING.xl, paddingBottom: 36 },
  addButton: { backgroundColor: COLORS.primary, height: 54, borderRadius: BORDER_RADIUS.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...SHADOWS.md },
  addButtonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
});
