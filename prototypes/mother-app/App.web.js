import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  MOCK_MOTHERS, 
  INDONESIAN_FOODS, 
  KIT_TYPES, 
  VACCINATION_SCHEDULE, 
  POSYANDU_LOCATIONS,
  HEALTH_MILESTONES 
} from './src/data/mockData';

export default function App() {
  const [selectedTab, setSelectedTab] = React.useState('timeline');
  const [selectedMother] = React.useState(MOCK_MOTHERS[0]);
  const [daysInJourney, setDaysInJourney] = React.useState(0);
  const [currentPhase, setCurrentPhase] = React.useState('pregnancy');

  React.useEffect(() => {
    // Calculate days since conception
    const conceptionDate = new Date('2025-06-01');
    const today = new Date();
    const days = Math.floor((today - conceptionDate) / (1000 * 60 * 60 * 24));
    setDaysInJourney(days);

    if (days < 280) setCurrentPhase('pregnancy');
    else if (days < 645) setCurrentPhase('infant');
    else setCurrentPhase('toddler');
  }, []);

  const timelineData = [
    {
      time: 'Hari 1-90',
      title: 'Trimester Pertama',
      description: 'Perkembangan neural kritis',
      icon: '🤰',
      active: currentPhase === 'pregnancy' && daysInJourney < 90,
    },
    {
      time: 'Hari 91-180',
      title: 'Trimester Kedua',
      description: 'Fase pertumbuhan cepat',
      icon: '🤰',
      active: currentPhase === 'pregnancy' && daysInJourney >= 90 && daysInJourney < 180,
    },
    {
      time: 'Hari 181-280',
      title: 'Trimester Ketiga',
      description: 'Persiapan akhir',
      icon: '🤰',
      active: currentPhase === 'pregnancy' && daysInJourney >= 180,
    },
    {
      time: 'Hari 280',
      title: 'Kelahiran',
      description: 'Selamat datang di dunia!',
      icon: '👶',
      active: daysInJourney >= 280,
    },
    {
      time: 'Bulan 0-6',
      title: 'ASI Eksklusif',
      description: 'Membangun kekebalan tubuh',
      icon: '🍼',
      active: currentPhase === 'infant' && daysInJourney < 460,
    },
    {
      time: 'Bulan 6-12',
      title: 'Makanan Pendamping',
      description: 'Pengenalan makanan padat',
      icon: '🥣',
      active: currentPhase === 'infant' && daysInJourney >= 460,
    },
    {
      time: 'Bulan 12-24',
      title: 'Nutrisi Balita',
      description: 'Diet beragam untuk pertumbuhan',
      icon: '🍎',
      active: currentPhase === 'toddler',
    },
    {
      time: 'Hari 1000',
      title: '1000 Hari Pertama Selesai',
      description: 'Fondasi kehidupan terbentuk',
      icon: '🎉',
      active: daysInJourney >= 1000,
    },
  ];

  const renderTimeline = () => (
    <ScrollView style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Perjalanan 1000 Hari Pertama</Text>
        <View style={styles.progressCard}>
          <Text style={styles.dayCount}>{daysInJourney}</Text>
          <Text style={styles.dayLabel}>Hari dalam Perjalanan</Text>
          <Text style={styles.remaining}>{1000 - daysInJourney} hari tersisa</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fase Saat Ini</Text>
        <Text style={styles.phaseText}>
          {currentPhase === 'pregnancy' ? '🤰 Kehamilan' : 
           currentPhase === 'infant' ? '👶 Bayi (0-12 bulan)' : 
           '🧒 Balita (12-24 bulan)'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profil Ibu</Text>
        <Text style={styles.text}>Nama: {selectedMother.name}</Text>
        <Text style={styles.text}>Usia: {selectedMother.age} tahun</Text>
        <Text style={styles.text}>Desa: {selectedMother.village}</Text>
        <Text style={styles.text}>Provinsi: {selectedMother.region.toUpperCase()}</Text>
        <Text style={styles.text}>
          Status BPJS: {selectedMother.bpjsStatus ? '✅ Terdaftar' : '❌ Belum Terdaftar'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Timeline 1000 Hari</Text>
        {timelineData.map((item, index) => (
          <View key={index} style={[styles.timelineItem, item.active && styles.timelineItemActive]}>
            <View style={styles.timelineIconContainer}>
              <Text style={styles.timelineIcon}>{item.icon}</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTime}>{item.time}</Text>
              <Text style={styles.timelineTitle}>{item.title}</Text>
              <Text style={styles.timelineDesc}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Milestone Mendatang</Text>
        <View style={styles.milestoneItem}>
          <Text style={styles.milestoneIcon}>💉</Text>
          <View style={styles.milestoneInfo}>
            <Text style={styles.milestoneTitle}>Vaksinasi Berikutnya</Text>
            <Text style={styles.milestoneDate}>Dalam 14 hari</Text>
          </View>
        </View>
        <View style={styles.milestoneItem}>
          <Text style={styles.milestoneIcon}>⚖️</Text>
          <View style={styles.milestoneInfo}>
            <Text style={styles.milestoneTitle}>Pemeriksaan Pertumbuhan</Text>
            <Text style={styles.milestoneDate}>Dalam 21 hari</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderFoodHack = () => {
    const foodsArray = Object.values(INDONESIAN_FOODS);
    
    return (
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Food Hack</Text>
          <Text style={styles.subtitle}>Kenali Makanan Lokal Bergizi dengan Kamera</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📸 Cara Menggunakan</Text>
          <Text style={styles.text}>1. Ambil foto bahan makanan mentah</Text>
          <Text style={styles.text}>2. AI akan mengenali jenis makanan</Text>
          <Text style={styles.text}>3. Lihat informasi nutrisi lengkap</Text>
          <Text style={styles.text}>4. Dapatkan rekomendasi resep</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>📷 Buka Kamera (Simulasi)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Makanan Lokal Bergizi</Text>
          <Text style={styles.textSmall}>Makanan tradisional Indonesia yang baik untuk ibu hamil dan menyusui</Text>
        </View>

        {foodsArray.map((food, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.foodTitle}>🥬 {food.name}</Text>
            <View style={styles.nutrientRow}>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientLabel}>Protein</Text>
                <Text style={styles.nutrientValue}>{food.protein}g</Text>
              </View>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientLabel}>Zat Besi</Text>
                <Text style={styles.nutrientValue}>{food.iron}mg</Text>
              </View>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientLabel}>Kalsium</Text>
                <Text style={styles.nutrientValue}>{food.calcium}mg</Text>
              </View>
            </View>
            <Text style={styles.text}>
              <Text style={styles.boldText}>Vitamin: </Text>
              {food.vitamins.join(', ')}
            </Text>
            <Text style={styles.benefitText}>💚 {food.maternalBenefits}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderKitRequest = () => (
    <ScrollView style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Permintaan Kit</Text>
        <Text style={styles.subtitle}>Kit Kesehatan Ibu & Bayi Gratis</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📦 Cara Mendapatkan Kit</Text>
        <Text style={styles.text}>1. Pilih kit yang Anda butuhkan</Text>
        <Text style={styles.text}>2. Verifikasi identitas dengan DID</Text>
        <Text style={styles.text}>3. Kit akan dikirim ke Posyandu terdekat</Text>
        <Text style={styles.text}>4. Ambil kit dengan menunjukkan QR code</Text>
      </View>

      {KIT_TYPES.map((kit, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.kitTitle}>{kit.icon} {kit.name}</Text>
          <Text style={styles.priceText}>Nilai: Rp {kit.price.toLocaleString('id-ID')}</Text>
          <Text style={styles.text}>Isi Kit:</Text>
          {kit.items.map((item, i) => (
            <Text key={i} style={styles.listItem}>• {item}</Text>
          ))}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>🛒 Minta Kit Ini</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderHealthBook = () => (
    <ScrollView style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Buku Kesehatan Digital</Text>
        <Text style={styles.subtitle}>Riwayat Kesehatan dengan NFC</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📱 Fitur NFC</Text>
        <Text style={styles.text}>Tap ponsel Anda di Posyandu untuk:</Text>
        <Text style={styles.listItem}>• Update catatan imunisasi</Text>
        <Text style={styles.listItem}>• Catat hasil pemeriksaan</Text>
        <Text style={styles.listItem}>• Sinkronisasi data kesehatan</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>📲 Aktifkan NFC (Simulasi)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💉 Jadwal Imunisasi</Text>
        {VACCINATION_SCHEDULE.map((vaccine, index) => (
          <View key={index} style={styles.vaccineItem}>
            <View style={styles.vaccineCheck}>
              <Text style={styles.checkIcon}>{index < 2 ? '✅' : '⏳'}</Text>
            </View>
            <View style={styles.vaccineInfo}>
              <Text style={styles.vaccineTitle}>{vaccine.name}</Text>
              <Text style={styles.vaccineAge}>Usia: {vaccine.age}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏥 Posyandu Terdekat</Text>
        {POSYANDU_LOCATIONS.map((posyandu, index) => (
          <View key={index} style={styles.posyanduItem}>
            <Text style={styles.posyanduName}>{posyandu.name}</Text>
            <Text style={styles.posyanduLocation}>{posyandu.village}, {posyandu.region}</Text>
            <Text style={styles.posyanduSchedule}>📅 Jadwal: Setiap Rabu, 08:00 - 12:00</Text>
            {index === 0 && (
              <Text style={styles.nearestBadge}>📍 Terdekat (2.5 km)</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.appHeader}>
        <Text style={styles.appTitle}>NutriSakti</Text>
        <Text style={styles.appSubtitle}>Guardian Interface - Mother App</Text>
      </View>

      {/* Content */}
      {selectedTab === 'timeline' && renderTimeline()}
      {selectedTab === 'food' && renderFoodHack()}
      {selectedTab === 'kit' && renderKitRequest()}
      {selectedTab === 'health' && renderHealthBook()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, selectedTab === 'timeline' && styles.navButtonActive]}
          onPress={() => setSelectedTab('timeline')}
        >
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navText}>Timeline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, selectedTab === 'food' && styles.navButtonActive]}
          onPress={() => setSelectedTab('food')}
        >
          <Text style={styles.navIcon}>📸</Text>
          <Text style={styles.navText}>Food Hack</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, selectedTab === 'kit' && styles.navButtonActive]}
          onPress={() => setSelectedTab('kit')}
        >
          <Text style={styles.navIcon}>📦</Text>
          <Text style={styles.navText}>Kit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, selectedTab === 'health' && styles.navButtonActive]}
          onPress={() => setSelectedTab('health')}
        >
          <Text style={styles.navIcon}>📖</Text>
          <Text style={styles.navText}>Kesehatan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  appHeader: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 40,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  dayCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  dayLabel: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  remaining: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 10,
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  textSmall: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  phaseText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timelineItemActive: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  timelineIconContainer: {
    width: 50,
    alignItems: 'center',
  },
  timelineIcon: {
    fontSize: 32,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 14,
    color: '#666',
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  milestoneIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  milestoneDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  foodTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  nutrientItem: {
    alignItems: 'center',
  },
  nutrientLabel: {
    fontSize: 12,
    color: '#666',
  },
  nutrientValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  benefitText: {
    fontSize: 14,
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  kitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  listItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vaccineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  vaccineCheck: {
    width: 40,
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 24,
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  vaccineAge: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  posyanduItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  posyanduName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  posyanduLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  posyanduSchedule: {
    fontSize: 14,
    color: '#666',
  },
  nearestBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20,
  },
  navButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  navButtonActive: {
    backgroundColor: '#E8F5E9',
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#333',
  },
});
