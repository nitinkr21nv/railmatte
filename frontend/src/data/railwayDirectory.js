/**
 * Official Indian Railways Reference Directory (Scheduled / Static Reference Data)
 * 
 * Provides verified Indian Railways station codes and premier train numbers
 * based on published IRCTC / Indian Railways national schedule references.
 * 
 * DISCLAIMER:
 * This directory represents scheduled reference information. It does NOT
 * provide or claim to provide live GPS train tracking, real-time delays,
 * live platform assignments, or official CRIS/IRCTC reservation chart modification.
 */

export const RAILWAY_REFERENCE_DISCLAIMER = {
  dataSource: 'Indian Railways Scheduled Network Directory (Reference)',
  isLiveGpsTracking: false,
  isOfficialTicketing: false,
  notice: 'Timetable and station directory reflects official Indian Railways reference schedules. Real-time train positions, delays, platform allocations, and PNR reservations are managed exclusively by Indian Railways (IRCTC/CRIS).'
};

export const STATIONS = [
  { code: 'NDLS', name: 'New Delhi', city: 'New Delhi', state: 'Delhi', zone: 'NR' },
  { code: 'DLI', name: 'Old Delhi Junction', city: 'Delhi', state: 'Delhi', zone: 'NR' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'New Delhi', state: 'Delhi', zone: 'NR' },
  { code: 'ANVT', name: 'Anand Vihar Terminal', city: 'Delhi', state: 'Delhi', zone: 'NR' },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', zone: 'WR' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra', zone: 'CR' },
  { code: 'BDTS', name: 'Bandra Terminus', city: 'Mumbai', state: 'Maharashtra', zone: 'WR' },
  { code: 'LTT', name: 'Lokmanya Tilak Terminus', city: 'Mumbai', state: 'Maharashtra', zone: 'CR' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', zone: 'ER' },
  { code: 'SDAH', name: 'Sealdah', city: 'Kolkata', state: 'West Bengal', zone: 'ER' },
  { code: 'SBC', name: 'KSR Bengaluru City Junction', city: 'Bengaluru', state: 'Karnataka', zone: 'SWR' },
  { code: 'YPR', name: 'Yesvantpur Junction', city: 'Bengaluru', state: 'Karnataka', zone: 'SWR' },
  { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu', zone: 'SR' },
  { code: 'MS', name: 'Chennai Egmore', city: 'Chennai', state: 'Tamil Nadu', zone: 'SR' },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar', zone: 'ECR' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh', zone: 'NCR' },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh', zone: 'NR' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh', zone: 'NR' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra', zone: 'CR' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', zone: 'WR' },
  { code: 'BRC', name: 'Vadodara Junction', city: 'Vadodara', state: 'Gujarat', zone: 'WR' },
  { code: 'ST', name: 'Surat', city: 'Surat', state: 'Gujarat', zone: 'WR' },
  { code: 'KOTA', name: 'Kota Junction', city: 'Kota', state: 'Rajasthan', zone: 'WCR' },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh', zone: 'WCR' },
  { code: 'RKMP', name: 'Rani Kamlapati', city: 'Bhopal', state: 'Madhya Pradesh', zone: 'WCR' },
  { code: 'HYB', name: 'Hyderabad Deccan (Nampally)', city: 'Hyderabad', state: 'Telangana', zone: 'SCR' },
  { code: 'SC', name: 'Secunderabad Junction', city: 'Hyderabad', state: 'Telangana', zone: 'SCR' },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', state: 'Uttar Pradesh', zone: 'NER' },
  { code: 'JAT', name: 'Jammu Tawi', city: 'Jammu', state: 'Jammu and Kashmir', zone: 'NR' },
  { code: 'CDG', name: 'Chandigarh Junction', city: 'Chandigarh', state: 'Chandigarh', zone: 'NR' },
  { code: 'AGC', name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh', zone: 'NCR' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan', zone: 'NWR' },
  { code: 'GHY', name: 'Guwahati', city: 'Guwahati', state: 'Assam', zone: 'NFR' },
  { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram', state: 'Kerala', zone: 'SR' },
  { code: 'ERS', name: 'Ernakulam Junction', city: 'Kochi', state: 'Kerala', zone: 'SR' },
  { code: 'R', name: 'Raipur Junction', city: 'Raipur', state: 'Chhattisgarh', zone: 'SECR' },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra', zone: 'CR' },
  { code: 'PURI', name: 'Puri', city: 'Puri', state: 'Odisha', zone: 'ECoR' },
  { code: 'BBS', name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', zone: 'ECoR' },
  { code: 'GWL', name: 'Gwalior Junction', city: 'Gwalior', state: 'Madhya Pradesh', zone: 'NCR' },
  { code: 'VGLJ', name: 'Virangana Lakshmibai Jhansi', city: 'Jhansi', state: 'Uttar Pradesh', zone: 'NCR' },
  { code: 'PRYJ', name: 'Prayagraj Junction', city: 'Prayagraj', state: 'Uttar Pradesh', zone: 'NCR' },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Junction', city: 'Mughalsarai', state: 'Uttar Pradesh', zone: 'ECR' },
  { code: 'ASR', name: 'Amritsar Junction', city: 'Amritsar', state: 'Punjab', zone: 'NR' },
  { code: 'MYS', name: 'Mysuru Junction', city: 'Mysuru', state: 'Karnataka', zone: 'SWR' },
  { code: 'CBE', name: 'Coimbatore Junction', city: 'Coimbatore', state: 'Tamil Nadu', zone: 'SR' }
];

export const TRAINS = [
  {
    number: '12952',
    name: 'Mumbai Rajdhani Express',
    origin: 'New Delhi (NDLS)',
    destination: 'Mumbai Central (MMCT)',
    classes: ['1A', '2A', '3A'],
    type: 'Rajdhani'
  },
  {
    number: '12951',
    name: 'Mumbai Rajdhani Express',
    origin: 'Mumbai Central (MMCT)',
    destination: 'New Delhi (NDLS)',
    classes: ['1A', '2A', '3A'],
    type: 'Rajdhani'
  },
  {
    number: '12953',
    name: 'August Kranti Rajdhani Express',
    origin: 'Mumbai Central (MMCT)',
    destination: 'Hazrat Nizamuddin (NZM)',
    classes: ['1A', '2A', '3A'],
    type: 'Rajdhani'
  },
  {
    number: '12954',
    name: 'August Kranti Rajdhani Express',
    origin: 'Hazrat Nizamuddin (NZM)',
    destination: 'Mumbai Central (MMCT)',
    classes: ['1A', '2A', '3A'],
    type: 'Rajdhani'
  },
  {
    number: '12028',
    name: 'Shatabdi Express',
    origin: 'KSR Bengaluru (SBC)',
    destination: 'MGR Chennai Central (MAS)',
    classes: ['EC', 'CC'],
    type: 'Shatabdi'
  },
  {
    number: '12027',
    name: 'Shatabdi Express',
    origin: 'MGR Chennai Central (MAS)',
    destination: 'KSR Bengaluru (SBC)',
    classes: ['EC', 'CC'],
    type: 'Shatabdi'
  },
  {
    number: '22436',
    name: 'Vande Bharat Express',
    origin: 'New Delhi (NDLS)',
    destination: 'Varanasi (BSB)',
    classes: ['EC', 'CC'],
    type: 'Vande Bharat'
  },
  {
    number: '22435',
    name: 'Vande Bharat Express',
    origin: 'Varanasi (BSB)',
    destination: 'New Delhi (NDLS)',
    classes: ['EC', 'CC'],
    type: 'Vande Bharat'
  },
  {
    number: '12002',
    name: 'Bhopal Shatabdi Express',
    origin: 'New Delhi (NDLS)',
    destination: 'Rani Kamlapati (RKMP)',
    classes: ['EC', 'CC'],
    type: 'Shatabdi'
  },
  {
    number: '12001',
    name: 'Bhopal Shatabdi Express',
    origin: 'Rani Kamlapati (RKMP)',
    destination: 'New Delhi (NDLS)',
    classes: ['EC', 'CC'],
    type: 'Shatabdi'
  },
  {
    number: '12301',
    name: 'Howrah Rajdhani Express',
    origin: 'Howrah (HWH)',
    destination: 'New Delhi (NDLS)',
    classes: ['1A', '2A', '3A'],
    type: 'Rajdhani'
  },
  {
    number: '12302',
    name: 'Howrah Rajdhani Express',
    origin: 'New Delhi (NDLS)',
    destination: 'Howrah (HWH)',
    classes: ['1A', '2A', '3A'],
    type: 'Rajdhani'
  },
  {
    number: '12626',
    name: 'Kerala Express',
    origin: 'New Delhi (NDLS)',
    destination: 'Thiruvananthapuram (TVC)',
    classes: ['2A', '3A', 'SL'],
    type: 'Superfast'
  },
  {
    number: '12625',
    name: 'Kerala Express',
    origin: 'Thiruvananthapuram (TVC)',
    destination: 'New Delhi (NDLS)',
    classes: ['2A', '3A', 'SL'],
    type: 'Superfast'
  },
  {
    number: '12802',
    name: 'Purushottam Express',
    origin: 'New Delhi (NDLS)',
    destination: 'Puri (PURI)',
    classes: ['2A', '3A', 'SL'],
    type: 'Superfast'
  },
  {
    number: '12556',
    name: 'Gorakhdham Express',
    origin: 'Bathinda (BTI)',
    destination: 'Gorakhpur (GKP)',
    classes: ['1A', '2A', '3A', 'SL'],
    type: 'Superfast'
  },
  {
    number: '12616',
    name: 'Grand Trunk Express',
    origin: 'New Delhi (NDLS)',
    destination: 'MGR Chennai Central (MAS)',
    classes: ['1A', '2A', '3A', 'SL'],
    type: 'Superfast'
  },
  {
    number: '12724',
    name: 'Telangana Express',
    origin: 'New Delhi (NDLS)',
    destination: 'Hyderabad (HYB)',
    classes: ['1A', '2A', '3A', 'SL'],
    type: 'Superfast'
  }
];

export function searchStations(query, limit = 8) {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  return STATIONS.filter(
    (s) =>
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q)
  ).slice(0, limit);
}

export function searchTrains(query, limit = 8) {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  return TRAINS.filter(
    (t) =>
      t.number.includes(q) ||
      t.name.toLowerCase().includes(q)
  ).slice(0, limit);
}

export function formatStationLabel(station) {
  if (!station) return '';
  return `${station.name} (${station.code})`;
}
