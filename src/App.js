import React, { useState, useEffect, useMemo, useRef } from 'react';
import { calculateResults, allBaseRate, KRISFLYER_VALUATIONS } from './matcher';
import mccCategories from './data/mcc_categories.json';
import hsbcRevolution from './data/cards/hsbc_revolution.json';
import citiRewards from './data/cards/citi_rewards.json';
import citiCashback from './data/cards/citi_cashback.json';
import citiCashbackPlus from './data/cards/citi_cashback_plus.json';
import uobEvol from './data/cards/uob_evol.json';
import uobPpv from './data/cards/uob_ppv.json';
import ocbcRewards from './data/cards/ocbc_rewards.json';
import ocbc365 from './data/cards/ocbc_365.json';
import uobLadys from './data/cards/uob_ladys.json';
import dbsYuu from './data/cards/dbs_yuu.json';

const ALL_CARDS = [hsbcRevolution, citiRewards, citiCashback, citiCashbackPlus, uobEvol, uobPpv, ocbcRewards, ocbc365, uobLadys, dbsYuu];
const STORAGE_KEY = 'card-optimizer-selected';
const CONFIG_STORAGE_KEY = 'card-optimizer-config';
const SETTINGS_STORAGE_KEY = 'card-optimizer-settings';

// Cards that support Amaze pairing
const AMAZE_COMPATIBLE_CARDS = ['ocbc_rewards', 'citi_rewards'];

// Amaze fee calculation
const calculateAmazeFee = (amount) => Math.max(0.50, amount * 0.01);

// Lucide-style SVG Icons
const Icons = {
  chevronDown: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  chevronLeft: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  chevronRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  globe: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  ),
  wifi: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
      <line x1="12" y1="20" x2="12.01" y2="20"></line>
    </svg>
  ),
  creditCard: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
      <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
  ),
  check: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  alertCircle: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  sparkles: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"></path>
      <path d="M5 19l.5 1.5L7 21l-1.5.5L5 23l-.5-1.5L3 21l1.5-.5L5 19z"></path>
      <path d="M19 13l.5 1.5L21 15l-1.5.5L19 17l-.5-1.5L17 15l1.5-.5L19 13z"></path>
    </svg>
  ),
  dollarSign: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  ),
  plane: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
    </svg>
  ),
  coins: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6"></circle>
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path>
      <path d="M7 6h1v4"></path>
      <path d="M16.71 13.88l.7.71-2.82 2.82"></path>
    </svg>
  ),
  calendar: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
  trophy: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  clock: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  checkAll: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L7 17l-5-5"></path>
      <path d="M22 10l-7.5 7.5L13 16"></path>
    </svg>
  ),
  zap: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  store: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
};

function buildMccSearchList(categories) {
  const list = [];
  Object.entries(categories).forEach(([category, subcats]) => {
    Object.entries(subcats).forEach(([name, data]) => {
      const mcc = typeof data === 'object' ? data.mcc : data;
      const tags = typeof data === 'object' && data.tags ? data.tags : [];
      const searchText = `${category} ${name} ${mcc} ${tags.join(' ')}`.toLowerCase();
      list.push({ category, name, mcc, tags, searchText });
    });
  });
  return list;
}

function loadSelectedCards() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return ALL_CARDS.map(c => c.card_id);
}

function saveSelectedCards(ids) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch (e) {}
}

function loadCardConfigs() {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {};
}

function saveCardConfigs(configs) {
  try { localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs)); } catch (e) {}
}

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return { preferredView: 'miles' };
}

function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)); } catch (e) {}
}

export default function App() {
  const [selectedCards, setSelectedCards] = useState(loadSelectedCards);
  const [cardConfigs, setCardConfigs] = useState(loadCardConfigs);
  const [cardDropdownOpen, setCardDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMcc, setSelectedMcc] = useState(null);
  const [selectedMccName, setSelectedMccName] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [mccEditMode, setMccEditMode] = useState(false);
  const [channel, setChannel] = useState('online');
  const [amount, setAmount] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(loadSettings);
  const [resultViews, setResultViews] = useState({});

  const cardDropdownRef = useRef(null);
  const mccDropdownRef = useRef(null);
  const mccInputRef = useRef(null);
  const settingsRef = useRef(null);

  const mccSearchList = useMemo(() => buildMccSearchList(mccCategories.categories), []);

  // Combined MCC search - handles both text and numeric input
  const filteredMcc = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim().replace(/\s+/g, ''); // Remove spaces for matching
    
    const isManualMcc = /^\d{4}$/.test(q);
    const results = mccSearchList.filter(item => item.searchText.replace(/\s+/g, '').includes(q));
    
    if (isManualMcc && !results.some(r => r.mcc === parseInt(q))) {
      results.unshift({ category: 'Manual Entry', name: `MCC ${q}`, mcc: parseInt(q), isManual: true });
    }
    
    return results;
  }, [searchQuery, mccSearchList]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (cardDropdownRef.current && !cardDropdownRef.current.contains(event.target)) {
        setCardDropdownOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { saveSelectedCards(selectedCards); }, [selectedCards]);
  useEffect(() => { saveCardConfigs(cardConfigs); }, [cardConfigs]);
  useEffect(() => { saveSettings(settings); }, [settings]);

  const results = useMemo(() => {
    if (!selectedMcc || !amount || selectedCards.length === 0) return [];
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return [];
    
    // For Amaze-paired cards, we need to check if Amaze actually helps
    // If the card already earns bonus with the selected channel, don't apply Amaze fees
    const amazeCards = selectedCards.filter(id => 
      cardConfigs[id]?.amaze && AMAZE_COMPATIBLE_CARDS.includes(id)
    );
    const nonAmazeCards = selectedCards.filter(id => 
      !cardConfigs[id]?.amaze || !AMAZE_COMPATIBLE_CARDS.includes(id)
    );
    
    // Calculate non-Amaze cards with selected channel
    const nonAmazeResults = nonAmazeCards.length > 0 
      ? calculateResults(ALL_CARDS, nonAmazeCards, selectedMcc, channel, amt, new Date(), cardConfigs, selectedMerchant)
      : [];
    
    // Calculate Amaze cards - check if Amaze actually provides benefit
    const amazeResults = amazeCards.length > 0
      ? amazeCards.map(cardId => {
          const card = ALL_CARDS.find(c => c.card_id === cardId);
          const cardConfig = cardConfigs[cardId] || {};
          
          // Calculate result with original channel (without Amaze)
          const originalResult = calculateResults(ALL_CARDS, [cardId], selectedMcc, channel, amt, new Date(), cardConfigs, selectedMerchant)[0];
          
          // Calculate result with 'online' channel (with Amaze)
          const amazeResult = calculateResults(ALL_CARDS, [cardId], selectedMcc, 'online', amt, new Date(), cardConfigs, selectedMerchant)[0];
          
          const amazeFee = calculateAmazeFee(amt);
          
          // Only apply Amaze if it provides bonus AND original channel doesn't
          // Or if Amaze gives higher rate than original
          const originalHasBonus = originalResult.is_bonus;
          const amazeHasBonus = amazeResult.is_bonus;
          
          if (amazeHasBonus && !originalHasBonus) {
            // Amaze helps - apply fee
            return {
              ...amazeResult,
              amaze: true,
              amaze_fee: amazeFee,
              value_low: amazeResult.value_low - amazeFee,
              value_mid: amazeResult.value_mid - amazeFee,
              value_high: amazeResult.value_high - amazeFee,
            };
          } else if (amazeHasBonus && originalHasBonus && amazeResult.rate > originalResult.rate) {
            // Both have bonus but Amaze is higher - apply fee
            return {
              ...amazeResult,
              amaze: true,
              amaze_fee: amazeFee,
              value_low: amazeResult.value_low - amazeFee,
              value_mid: amazeResult.value_mid - amazeFee,
              value_high: amazeResult.value_high - amazeFee,
            };
          } else {
            // Original channel is same or better - no Amaze benefit, no fee
            return {
              ...originalResult,
              amaze: true,
              amaze_fee: 0,
            };
          }
        })
      : [];
    
    // Combine and sort by value
    return [...nonAmazeResults, ...amazeResults].sort((a, b) => b.value_mid - a.value_mid);
  }, [selectedMcc, channel, amount, selectedCards, cardConfigs, selectedMerchant]);

  const isNoBonus = allBaseRate(results);
  const toggleCard = (id) => setSelectedCards(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const removeCard = (id) => setSelectedCards(p => p.filter(x => x !== id));
  const selectAllCards = () => setSelectedCards(ALL_CARDS.map(c => c.card_id));
  const selectMcc = (item, query) => { 
    setSelectedMcc(item.mcc); 
    setSelectedMccName(`${item.name} (${item.mcc})`); 
    // Store original search query for merchant matching (e.g., "cold storage" even if selecting "Supermarket")
    setSelectedMerchant(query || item.name);
    setSearchQuery(''); 
    setMccEditMode(false);
  };
  const clearMcc = () => { 
    setSelectedMcc(null); 
    setSelectedMccName(''); 
    setSelectedMerchant(null);
    setSearchQuery(''); 
    setMccEditMode(false);
  };
  const startMccEdit = () => {
    setMccEditMode(true);
    setSearchQuery('');
    setTimeout(() => mccInputRef.current?.focus(), 0);
  };
  
  const updateCardConfig = (cardId, key, value) => {
    setCardConfigs(prev => ({
      ...prev,
      [cardId]: { ...prev[cardId], [key]: value }
    }));
  };

  const getResultView = (cardId) => resultViews[cardId] || settings.preferredView;
  const cycleView = (cardId, direction) => {
    const views = ['points', 'miles', 'value'];
    const current = getResultView(cardId);
    const idx = views.indexOf(current);
    const newIdx = direction === 'left' 
      ? (idx - 1 + views.length) % views.length 
      : (idx + 1) % views.length;
    setResultViews(prev => ({ ...prev, [cardId]: views[newIdx] }));
  };

  // Get points expiry from card data
  const getPointsExpiry = (cardId) => {
    const card = ALL_CARDS.find(c => c.card_id === cardId);
    if (!card) return null;
    return card.points_expiry || null;
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Card Optimizer</h1>
            <p style={styles.subtitle}>Singapore • KrisFlyer Miles</p>
          </div>
          <div style={styles.settingsContainer} ref={settingsRef}>
            <button 
              onClick={() => setSettingsOpen(!settingsOpen)} 
              style={styles.settingsButton}
            >
              {Icons.settings}
            </button>
            {settingsOpen && (
              <div style={styles.settingsPanel}>
                <div style={styles.settingsPanelTitle}>Settings</div>
                <div style={styles.settingsItem}>
                  <span style={styles.settingsLabel}>Default View</span>
                  <select 
                    value={settings.preferredView}
                    onChange={(e) => setSettings(prev => ({ ...prev, preferredView: e.target.value }))}
                    style={styles.settingsSelect}
                  >
                    <option value="points">Points</option>
                    <option value="miles">Miles</option>
                    <option value="value">Value</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Card Selection */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Your Cards</h2>
          
          <div style={styles.dropdownContainer} ref={cardDropdownRef}>
            <button 
              onClick={() => setCardDropdownOpen(!cardDropdownOpen)} 
              style={{
                ...styles.dropdownTrigger,
                borderColor: cardDropdownOpen ? '#3b82f6' : '#e2e8f0'
              }}
            >
              <span>Select Cards ({selectedCards.length})</span>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center',
                transform: cardDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                transition: 'transform 0.2s ease' 
              }}>{Icons.chevronDown}</span>
            </button>
            
            {cardDropdownOpen && (
              <div style={styles.dropdownMenu}>
                {/* Header with Select/Deselect All */}
                <div style={styles.dropdownHeader}>
                  <span style={styles.dropdownHeaderTitle}>Your Cards</span>
                  {selectedCards.length === ALL_CARDS.length ? (
                    <button onClick={() => setSelectedCards([])} style={styles.selectAllLink}>Deselect All</button>
                  ) : (
                    <button onClick={selectAllCards} style={styles.selectAllLink}>Select All</button>
                  )}
                </div>
                
                {/* Card List */}
                <div style={styles.cardList}>
                  {ALL_CARDS.map(card => {
                    const isSelected = selectedCards.includes(card.card_id);
                    const config = cardConfigs[card.card_id] || {};
                    const isAmazeCompatible = AMAZE_COMPATIBLE_CARDS.includes(card.card_id);
                    const hasConfigurableCategory = !!card.configurable_category;
                    const needsConfig = isSelected && (isAmazeCompatible || hasConfigurableCategory);
                    
                    return (
                      <div key={card.card_id} style={styles.cardItem}>
                        <button 
                          onClick={() => toggleCard(card.card_id)} 
                          style={styles.cardRow}
                        >
                          <div style={{ 
                            ...styles.checkbox, 
                            backgroundColor: isSelected ? '#3b82f6' : '#fff', 
                            borderColor: isSelected ? '#3b82f6' : '#d1d5db' 
                          }}>
                            {isSelected && <span style={styles.checkIcon}>{Icons.check}</span>}
                          </div>
                          <img src={card.image} alt={card.card_name} style={styles.cardImage} />
                          <div style={{ flex: 1 }}>
                            <div style={styles.cardName}>{card.card_name}</div>
                            <div style={styles.cardMeta}>
                              {card.bank} • {card.currency === 'cashback' ? 'Cashback' : 'Miles'}
                            </div>
                          </div>
                          <span style={{
                            ...styles.cardBadge,
                            backgroundColor: card.currency === 'cashback' ? '#dcfce7' : '#dbeafe',
                            color: card.currency === 'cashback' ? '#16a34a' : '#1d4ed8'
                          }}>
                            {card.currency === 'cashback' ? 'Cashback' : 'Miles'}
                          </span>
                        </button>
                        
                        {/* Config panel - inline under selected cards that need config */}
                        {needsConfig && (
                          <div style={styles.configPanel}>
                            {hasConfigurableCategory && (
                              <div style={styles.configRow}>
                                <span style={styles.configLabelText}>Bonus category:</span>
                                <select
                                  value={config.category || card.configurable_category.default}
                                  onChange={(e) => updateCardConfig(card.card_id, 'category', e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  style={styles.configSelectDropdown}
                                >
                                  {card.configurable_category.options.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            
                            {isAmazeCompatible && (
                              <div style={styles.configRow}>
                                <label style={styles.amazeToggle} onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={config.amaze || false}
                                    onChange={(e) => updateCardConfig(card.card_id, 'amaze', e.target.checked)}
                                    style={styles.amazeCheckbox}
                                  />
                                  <span style={styles.amazeLabel}>
                                    {Icons.zap}
                                    Amaze pairing
                                  </span>
                                </label>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Selected Cards Chips - Clean with config badges */}
          {selectedCards.length > 0 && (
            <div style={styles.chipsContainer}>
              {selectedCards.map(id => {
                const card = ALL_CARDS.find(c => c.card_id === id);
                if (!card) return null;
                const config = cardConfigs[id] || {};
                const hasAmaze = config.amaze && AMAZE_COMPATIBLE_CARDS.includes(id);
                const hasCategory = card.configurable_category;
                const categoryName = hasCategory 
                  ? card.configurable_category.options.find(o => o.id === (config.category || card.configurable_category.default))?.name
                  : null;
                
                return (
                  <div key={id} style={styles.chip}>
                    <img src={card.image} alt={card.card_name} style={styles.chipImage} />
                    <span style={styles.chipText}>{card.card_name}</span>
                    {hasAmaze && <span style={styles.chipConfigAmaze}>+ Amaze</span>}
                    {categoryName && <span style={styles.chipConfigCategory}>· {categoryName}</span>}
                    <button onClick={() => removeCard(id)} style={styles.chipRemove}>{Icons.x}</button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* MCC Search - Combined */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>What are you buying?</h2>
          
          <div style={styles.searchContainer} ref={mccDropdownRef}>
            {selectedMcc && !mccEditMode ? (
              <div style={styles.selectedMcc} onClick={startMccEdit}>
                <span style={styles.selectedMccIcon}>{Icons.search}</span>
                <span style={styles.selectedMccText}>{selectedMccName}</span>
                <button onClick={(e) => { e.stopPropagation(); clearMcc(); }} style={styles.clearButton}>{Icons.x}</button>
              </div>
            ) : (
              <>
                <div style={styles.searchInputWrapper}>
                  <span style={styles.searchIcon}>{Icons.search}</span>
                  <input
                    ref={mccInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => { if (selectedMcc && !searchQuery) setMccEditMode(false); }}
                    placeholder={selectedMcc ? selectedMccName : "Search category or enter MCC..."}
                    style={styles.searchInput}
                  />
                  {selectedMcc && (
                    <button onClick={clearMcc} style={styles.clearButtonInline}>{Icons.x}</button>
                  )}
                </div>
                {filteredMcc.length > 0 && (
                  <div style={styles.searchResults}>
                    {filteredMcc.map((item, i) => (
                      <button 
                        key={`${item.mcc}-${i}`} 
                        onClick={() => selectMcc(item, searchQuery)} 
                        style={styles.searchResultItem}
                      >
                        <div style={styles.resultInfo}>
                          <span style={styles.resultName}>{item.name}</span>
                          <span style={styles.resultMeta}>{item.category}</span>
                        </div>
                        <span style={styles.resultMcc}>{item.mcc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Payment Method */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Payment Method</h2>
          <div style={styles.channelGrid}>
            {[
              { id: 'online', icon: Icons.globe, label: 'Online', desc: 'Website / App' },
              { id: 'contactless', icon: Icons.wifi, label: 'Tap', desc: 'Contactless / Mobile Wallet' },
              { id: 'offline', icon: Icons.creditCard, label: 'Chip', desc: 'Insert / Swipe' }
            ].map(ch => (
              <button 
                key={ch.id} 
                onClick={() => setChannel(ch.id)} 
                style={{
                  ...styles.channelButton,
                  borderColor: channel === ch.id ? '#3b82f6' : '#e2e8f0',
                  backgroundColor: channel === ch.id ? '#eff6ff' : '#fff',
                  color: channel === ch.id ? '#3b82f6' : '#64748b'
                }}
              >
                <span style={styles.channelIcon}>{ch.icon}</span>
                <span style={{
                  ...styles.channelLabel,
                  color: channel === ch.id ? '#1e293b' : '#64748b'
                }}>{ch.label}</span>
                <span style={styles.channelDesc}>{ch.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Amount */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Amount</h2>
          <div style={styles.amountContainer}>
            <span style={styles.currencySymbol}>S$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={styles.amountInput}
            />
          </div>
        </section>

        {/* Results */}
        {results.length > 0 && (
          <section style={styles.resultsSection}>
            <div style={styles.resultsTitleRow}>
              <h2 style={styles.resultsTitle}>
                {isNoBonus ? (
                  <span style={styles.resultsTitleWarning}>{Icons.alertCircle} No Bonus Earned</span>
                ) : (
                  <span style={styles.resultsTitleSuccess}>{Icons.sparkles} Results</span>
                )}
              </h2>
              <span style={styles.valuationInline}>
                KrisFlyer miles valued at {KRISFLYER_VALUATIONS.low}–{KRISFLYER_VALUATIONS.high} ¢/mile
              </span>
            </div>

            {isNoBonus && (
              <div style={styles.noBonusWarning}>
                <p>None of your cards earn bonus for this transaction.</p>
                <p style={styles.noBonusHint}>Consider a card that covers this category.</p>
              </div>
            )}

            {results.map((r, i) => {
              const currentView = getResultView(r.card_id);
              const pointsExpiry = getPointsExpiry(r.card_id);
              
              return (
                <div 
                  key={r.card_id} 
                  style={{ 
                    ...styles.resultCard, 
                    borderLeftColor: r.color,
                    opacity: isNoBonus ? 0.7 : 1 
                  }}
                >
                  {i === 0 && !isNoBonus && (
                    <div style={styles.bestBadge}>{Icons.trophy} BEST</div>
                  )}

                  <div style={styles.resultHeader}>
                    <div style={styles.resultCardInfo}>
                      <img src={r.image || ALL_CARDS.find(c => c.card_id === r.card_id)?.image} alt={r.card_name} style={styles.resultCardImage} />
                      <div>
                        <div style={styles.resultCardName}>{r.card_name}</div>
                        <div style={styles.resultBank}>{r.bank}</div>
                      </div>
                    </div>
                    <div style={styles.resultMpd}>
                      {r.currency === 'cashback' ? (
                        <>
                          <span style={styles.mpdValue}>{r.rate.toFixed(1)}%</span>
                          <span style={styles.mpdLabel}>cashback</span>
                        </>
                      ) : (
                        <>
                          <span style={styles.mpdValue}>{r.mpd.toFixed(2)}</span>
                          <span style={styles.mpdLabel}>mpd</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ 
                    ...styles.resultRule, 
                    backgroundColor: r.is_bonus ? '#f0fdf4' : '#fef2f2', 
                    color: r.is_bonus ? '#166534' : '#991b1b' 
                  }}>
                    {r.is_bonus ? Icons.sparkles : Icons.info} 
                    <span style={{ marginLeft: 6 }}>{r.rule_name}</span>
                    {r.amaze && <span style={styles.amazeBadge}>+ Amaze</span>}
                    {r.is_merchant_specific && (
                      <span style={styles.merchantBadge}>
                        {Icons.store}
                        <span>Selected merchants</span>
                      </span>
                    )}
                  </div>

                  {/* Stats Section */}
                  <div style={styles.resultStats}>
                    {r.currency === 'cashback' ? (
                      <>
                        <div style={styles.statItem}>
                          <div style={styles.statValue}>${r.cashback.toFixed(2)}</div>
                          <div style={styles.statLabel}>Cashback</div>
                        </div>
                        <div style={styles.statDivider} />
                        <div style={styles.statItem}>
                          <div style={{ ...styles.statValue, color: '#22c55e' }}>${r.value_mid.toFixed(2)}</div>
                          <div style={styles.statLabel}>Value</div>
                        </div>
                      </>
                    ) : (
                      /* Miles card - Segmented view toggle */
                      <div style={styles.milesStatsContainer}>
                        <div style={styles.segmentedToggle}>
                          <button
                            onClick={() => setResultViews(prev => ({ ...prev, [r.card_id]: 'points' }))}
                            style={{
                              ...styles.segmentButton,
                              ...(currentView === 'points' ? styles.segmentButtonActive : {})
                            }}
                          >Points</button>
                          <button
                            onClick={() => setResultViews(prev => ({ ...prev, [r.card_id]: 'miles' }))}
                            style={{
                              ...styles.segmentButton,
                              ...(currentView === 'miles' ? styles.segmentButtonActive : {})
                            }}
                          >Miles</button>
                          <button
                            onClick={() => setResultViews(prev => ({ ...prev, [r.card_id]: 'value' }))}
                            style={{
                              ...styles.segmentButton,
                              ...(currentView === 'value' ? styles.segmentButtonActive : {})
                            }}
                          >Value</button>
                        </div>
                        
                        <div style={styles.milesValueDisplay}>
                          {currentView === 'points' && (
                            <>
                              <div style={styles.bigValue}>{r.points.toLocaleString()}</div>
                              <div style={styles.bigValueLabel}>{ALL_CARDS.find(c => c.card_id === r.card_id)?.currency_name || 'Points'}</div>
                            </>
                          )}
                          {currentView === 'miles' && (
                            <>
                              <div style={styles.bigValue}>{Math.floor(r.miles).toLocaleString()}</div>
                              <div style={styles.bigValueLabel}>KrisFlyer Miles</div>
                            </>
                          )}
                          {currentView === 'value' && (
                            <>
                              <div style={{ ...styles.bigValue, color: '#22c55e' }}>
                                ${r.value_low.toFixed(2)} – ${r.value_high.toFixed(2)}
                              </div>
                              <div style={styles.bigValueLabel}>Estimated Value</div>
                              {r.amaze && (
                                <div style={styles.amazeFeeNote}>(-${r.amaze_fee.toFixed(2)} tx fee)</div>
                              )}
                            </>
                          )}
                        </div>
                        
                        {/* Points expiry - only show in Points tab */}
                        {currentView === 'points' && pointsExpiry && (
                          <div style={styles.expiryNote}>
                            {Icons.clock}
                            <span>Expires: {pointsExpiry}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={styles.resultMeta}>
                    {r.cap && (
                      <div style={styles.resultCap}>
                        {Icons.alertCircle}
                        <span>Cap: {r.cap_type === 'cashback' ? `$${r.cap}` : `$${r.cap.toLocaleString()} spend`}/month</span>
                      </div>
                    )}
                    {r.min_spend && (
                      <div style={styles.resultMinSpend}>
                        {Icons.info}
                        <span>Min spend: ${r.min_spend}/month</span>
                      </div>
                    )}
                    {r.promo && (
                      <div style={styles.resultPromo}>
                        {Icons.calendar}
                        <span>Promo until {r.promo.end}</span>
                      </div>
                    )}
                  </div>

                  {/* Card type indicator */}
                  <div style={styles.cardTypeIndicator}>
                    {r.currency === 'cashback' ? (
                      <span style={styles.cashbackIndicator}>{Icons.coins} Cashback</span>
                    ) : (
                      <span style={styles.milesIndicator}>{Icons.plane} Miles</span>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      <footer style={styles.footer}>
        <p>Data as of Jan 2025 • Not financial advice</p>
      </footer>
    </div>
  );
}

const styles = {
  container: { 
    minHeight: '100vh', 
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  header: { 
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
    padding: '24px 20px', 
    color: '#fff' 
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    maxWidth: 480,
    margin: '0 auto'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 700, 
    margin: 0, 
    letterSpacing: '-0.5px' 
  },
  subtitle: { 
    fontSize: 13, 
    opacity: 0.7, 
    marginTop: 4,
    fontWeight: 400
  },
  settingsContainer: {
    position: 'relative'
  },
  settingsButton: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: 8,
    padding: 8,
    cursor: 'pointer',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s ease'
  },
  settingsPanel: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    padding: 16,
    minWidth: 200,
    zIndex: 30
  },
  settingsPanelTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  settingsItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  settingsLabel: {
    fontSize: 14,
    color: '#1e293b'
  },
  settingsSelect: {
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    fontSize: 13,
    color: '#1e293b',
    cursor: 'pointer'
  },
  main: { 
    maxWidth: 480, 
    margin: '0 auto', 
    padding: '0 16px 32px' 
  },
  section: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    marginTop: 16, 
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' 
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: 600, 
    color: '#94a3b8', 
    textTransform: 'uppercase', 
    letterSpacing: '0.5px', 
    marginBottom: 16 
  },

  // Dropdown styles
  dropdownContainer: { position: 'relative' },
  dropdownTrigger: { 
    width: '100%', 
    padding: '14px 16px', 
    fontSize: 14, 
    fontWeight: 500, 
    border: '2px solid #e2e8f0', 
    borderRadius: 12, 
    background: '#fff', 
    cursor: 'pointer', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    color: '#1e293b',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  dropdownMenu: { 
    position: 'absolute', 
    top: '100%', 
    left: 0, 
    right: 0, 
    backgroundColor: '#fff', 
    border: '1px solid #e2e8f0', 
    borderRadius: 12, 
    marginTop: 8, 
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)', 
    zIndex: 20,
    overflow: 'hidden'
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  dropdownHeaderTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#475569'
  },
  selectAllLink: {
    fontSize: 12,
    fontWeight: 500,
    color: '#3b82f6',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0
  },
  cardList: {
    maxHeight: 360,
    overflowY: 'auto'
  },
  cardItem: {
    borderBottom: '1px solid #f1f5f9'
  },
  cardRow: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 12, 
    width: '100%', 
    padding: '12px 16px', 
    border: 'none', 
    background: 'none', 
    cursor: 'pointer', 
    textAlign: 'left',
    transition: 'background-color 0.15s ease'
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: 500,
    padding: '3px 6px',
    borderRadius: 4
  },
  configPanel: {
    backgroundColor: '#f8fafc',
    padding: '10px 16px 12px 46px',
    borderTop: '1px solid #e2e8f0'
  },
  configRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  configLabelText: {
    fontSize: 12,
    color: '#64748b'
  },
  configSelectDropdown: {
    padding: '6px 10px',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    fontSize: 12,
    color: '#1e293b',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  amazeToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer'
  },
  amazeCheckbox: {
    width: 16,
    height: 16,
    accentColor: '#8b5cf6',
    cursor: 'pointer'
  },
  amazeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: 500
  },
  selectAllButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '10px 16px',
    border: 'none',
    background: '#f0f9ff',
    cursor: 'pointer',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0',
    color: '#3b82f6',
    fontWeight: 500,
    fontSize: 13
  },
  checkbox: { 
    width: 20, 
    height: 20, 
    borderRadius: 6, 
    border: '2px solid', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexShrink: 0,
    transition: 'all 0.15s ease'
  },
  checkIcon: { color: '#fff', display: 'flex' },
  cardImage: { 
    width: 48, 
    height: 30, 
    objectFit: 'cover', 
    borderRadius: 4,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  cardName: { fontSize: 14, fontWeight: 600, color: '#1e293b' },
  cardMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },

  // Chips styles - clean with config badges
  chipsContainer: { 
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: 8, 
    marginTop: 14 
  },
  chip: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 8, 
    padding: '5px 10px 5px 5px', 
    borderRadius: 20, 
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    fontSize: 13, 
    fontWeight: 500
  },
  chipImage: {
    width: 28,
    height: 18,
    objectFit: 'cover',
    borderRadius: 3
  },
  chipText: { color: '#1e293b' },
  chipConfigAmaze: {
    fontSize: 11,
    color: '#7c3aed',
    fontWeight: 500
  },
  chipConfigCategory: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 400
  },
  chipRemove: { 
    background: 'none', 
    border: 'none', 
    color: '#94a3b8', 
    cursor: 'pointer', 
    padding: 0, 
    display: 'flex',
    transition: 'color 0.15s ease'
  },

  // Search styles
  searchContainer: { position: 'relative' },
  searchInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    color: '#94a3b8',
    display: 'flex',
    pointerEvents: 'none'
  },
  searchInput: { 
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px 40px 14px 44px', 
    fontSize: 14, 
    border: '2px solid #e2e8f0', 
    borderRadius: 12, 
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    fontFamily: 'inherit'
  },
  searchResults: { 
    position: 'absolute', 
    top: '100%', 
    left: 0, 
    right: 0, 
    backgroundColor: '#fff', 
    border: '1px solid #e2e8f0', 
    borderRadius: 12, 
    marginTop: 8, 
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)', 
    zIndex: 10, 
    maxHeight: 280, 
    overflow: 'auto' 
  },
  searchResultItem: { 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%', 
    padding: '12px 16px', 
    border: 'none', 
    background: 'none', 
    textAlign: 'left', 
    cursor: 'pointer', 
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease'
  },
  resultInfo: { display: 'flex', flexDirection: 'column' },
  resultName: { fontSize: 14, fontWeight: 500, color: '#1e293b' },
  resultMeta: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  resultMcc: { 
    fontSize: 12, 
    fontWeight: 600, 
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '4px 8px',
    borderRadius: 6,
    fontFamily: 'monospace'
  },
  selectedMcc: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 10,
    padding: '14px 16px', 
    backgroundColor: '#f0fdf4', 
    border: '2px solid #86efac', 
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease'
  },
  selectedMccIcon: {
    color: '#16a34a',
    display: 'flex',
    flexShrink: 0
  },
  selectedMccText: { fontSize: 14, fontWeight: 500, color: '#166534', flex: 1 },
  clearButton: { 
    background: 'none', 
    border: 'none', 
    color: '#64748b', 
    cursor: 'pointer', 
    padding: 4,
    display: 'flex',
    borderRadius: 6,
    transition: 'background-color 0.15s ease'
  },
  clearButtonInline: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    borderRadius: 6
  },

  // Channel styles
  channelGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  channelButton: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    padding: '16px 8px', 
    border: '2px solid', 
    borderRadius: 12, 
    background: '#fff', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease',
    minHeight: 88
  },
  channelIcon: { display: 'flex', marginBottom: 6 },
  channelLabel: { fontSize: 13, fontWeight: 600, marginTop: 4 },
  channelDesc: { fontSize: 9, color: '#94a3b8', marginTop: 2, textAlign: 'center' },

  // Amount styles
  amountContainer: { display: 'flex', alignItems: 'center', gap: 8 },
  currencySymbol: { fontSize: 18, fontWeight: 600, color: '#64748b' },
  amountInput: { 
    flex: 1,
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px 16px', 
    fontSize: 24, 
    fontWeight: 600, 
    border: '2px solid #e2e8f0', 
    borderRadius: 12, 
    textAlign: 'right', 
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease'
  },

  // Results styles
  resultsSection: { marginTop: 24 },
  resultsTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8
  },
  resultsTitle: { 
    fontSize: 16, 
    fontWeight: 700, 
    color: '#1e293b', 
    display: 'flex', 
    alignItems: 'center', 
    gap: 8,
    margin: 0
  },
  resultsTitleWarning: { display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' },
  resultsTitleSuccess: { display: 'flex', alignItems: 'center', gap: 8, color: '#1e293b' },
  valuationInline: {
    fontSize: 11,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: 20
  },
  noBonusWarning: { 
    backgroundColor: '#fef2f2', 
    border: '1px solid #fecaca', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    fontSize: 14, 
    color: '#991b1b' 
  },
  noBonusHint: { marginTop: 6, fontSize: 13, color: '#b91c1c' },
  resultCard: { 
    position: 'relative', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 12, 
    borderLeft: '4px solid', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  bestBadge: { 
    position: 'absolute', 
    top: 12, 
    right: 12, 
    padding: '4px 10px', 
    fontSize: 10, 
    fontWeight: 700, 
    color: '#fff', 
    backgroundColor: '#22c55e', 
    borderRadius: 20, 
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  resultHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 12 
  },
  resultCardInfo: { display: 'flex', alignItems: 'center', gap: 12 },
  resultCardImage: { 
    width: 56, 
    height: 35, 
    objectFit: 'cover', 
    borderRadius: 6,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  resultCardName: { fontSize: 15, fontWeight: 700, color: '#1e293b' },
  resultBank: { fontSize: 12, color: '#64748b', marginTop: 2 },
  resultMpd: { textAlign: 'right' },
  mpdValue: { fontSize: 28, fontWeight: 700, color: '#1e293b' },
  mpdLabel: { fontSize: 11, color: '#64748b', marginLeft: 2 },
  resultRule: { 
    fontSize: 13, 
    padding: '8px 12px', 
    borderRadius: 8, 
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center'
  },
  amazeBadge: {
    marginLeft: 'auto',
    fontSize: 10,
    fontWeight: 600,
    color: '#7c3aed',
    backgroundColor: '#ede9fe',
    padding: '2px 8px',
    borderRadius: 10
  },
  merchantBadge: {
    marginLeft: 8,
    fontSize: 10,
    fontWeight: 500,
    color: '#d97706',
    backgroundColor: '#fef3c7',
    padding: '2px 8px',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  resultStats: { 
    display: 'flex', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    padding: '14px 0', 
    borderTop: '1px solid #f1f5f9', 
    borderBottom: '1px solid #f1f5f9' 
  },
  statItem: { textAlign: 'center', flex: 1 },
  statValue: { fontSize: 16, fontWeight: 700, color: '#1e293b' },
  statLabel: { fontSize: 10, color: '#94a3b8', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.3px' },
  statDivider: { width: 1, height: 32, backgroundColor: '#f1f5f9' },
  
  // Miles card segmented toggle
  milesStatsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12
  },
  segmentedToggle: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2
  },
  segmentButton: {
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 500,
    border: 'none',
    background: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    color: '#64748b',
    transition: 'all 0.2s ease'
  },
  segmentButtonActive: {
    backgroundColor: '#fff',
    color: '#1e293b',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  milesValueDisplay: {
    textAlign: 'center',
    padding: '8px 0'
  },
  bigValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1e293b'
  },
  bigValueLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4
  },
  amazeFeeNote: {
    fontSize: 11,
    color: '#f59e0b',
    marginTop: 4
  },
  expiryNote: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4
  },
  
  resultMeta: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 },
  resultCap: { fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 },
  resultMinSpend: { fontSize: 12, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6 },
  resultPromo: { fontSize: 12, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 6 },
  cardTypeIndicator: { 
    marginTop: 12, 
    paddingTop: 12, 
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  milesIndicator: { 
    fontSize: 11, 
    fontWeight: 600, 
    color: '#0ea5e9', 
    display: 'flex', 
    alignItems: 'center', 
    gap: 4,
    backgroundColor: '#f0f9ff',
    padding: '4px 10px',
    borderRadius: 20
  },
  cashbackIndicator: { 
    fontSize: 11, 
    fontWeight: 600, 
    color: '#22c55e', 
    display: 'flex', 
    alignItems: 'center', 
    gap: 4,
    backgroundColor: '#f0fdf4',
    padding: '4px 10px',
    borderRadius: 20
  },
  footer: { 
    textAlign: 'center', 
    padding: '24px 16px', 
    fontSize: 12, 
    color: '#94a3b8' 
  },
};
