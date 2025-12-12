// Matching Engine for Credit Card Rewards

export const KRISFLYER_VALUATIONS = { low: 1.1, mid: 1.5, high: 2.0 };

function mccInRanges(mcc, ranges) {
  if (!ranges) return false;
  return ranges.some(r => mcc >= r.start && mcc <= r.end);
}

function isPromoActive(promo, date = new Date()) {
  if (!promo) return true;
  const start = new Date(promo.start);
  const end = new Date(promo.end);
  end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
}

// Check if merchant matches whitelist (case-insensitive, space-insensitive, partial match)
function merchantMatchesWhitelist(merchant, rule) {
  if (!merchant || !rule.conditions.merchant_whitelist) return false;
  const merchantNorm = merchant.toLowerCase().replace(/\s+/g, '');
  return rule.conditions.merchant_whitelist.some(m => {
    const mNorm = m.toLowerCase().replace(/\s+/g, '');
    return merchantNorm.includes(mNorm) || mNorm.includes(merchantNorm);
  });
}

function mccMatchesWhitelist(mcc, rule, card, cardConfig = {}) {
  if (rule.conditions.mcc_whitelist_mode === "all_except_blacklist") return true;
  
  // Handle configurable category (e.g., UOB Lady's card)
  if (rule.conditions.uses_configurable_category && card.configurable_category) {
    const selectedCategoryId = cardConfig.category || card.configurable_category.default;
    const category = card.configurable_category.options.find(c => c.id === selectedCategoryId);
    if (category && category.mcc_whitelist?.includes(mcc)) return true;
    return false;
  }
  
  if (rule.conditions.mcc_whitelist?.includes(mcc)) return true;
  if (mccInRanges(mcc, rule.conditions.mcc_whitelist_ranges)) return true;
  return false;
}

function mccIsBlacklisted(mcc, rule, card) {
  if (rule.conditions.mcc_blacklist?.includes(mcc)) return true;
  if (card.global_mcc_blacklist?.includes(mcc)) return true;
  if (rule.conditions.excludes_travel) {
    if (card.travel_mcc_blacklist?.includes(mcc)) return true;
    if (mccInRanges(mcc, card.travel_mcc_blacklist_ranges)) return true;
  }
  return false;
}

export function findBestRule(card, mcc, channel, date = new Date(), cardConfig = {}, merchant = null) {
  let best = null;
  let bestIsMerchantSpecific = false;
  
  for (const rule of card.rules) {
    if (!isPromoActive(rule.promo_period, date)) continue;
    if (!rule.conditions.channels?.includes(channel)) continue;
    if (mccIsBlacklisted(mcc, rule, card)) continue;
    
    // Check if rule matches via merchant whitelist
    const hasMerchantWhitelist = rule.conditions.merchant_whitelist?.length > 0;
    const merchantMatched = hasMerchantWhitelist && merchantMatchesWhitelist(merchant, rule);
    
    // Check if rule matches via MCC whitelist
    const mccMatched = mccMatchesWhitelist(mcc, rule, card, cardConfig);
    
    // Rule must match either by merchant OR by MCC (if no merchant whitelist)
    if (hasMerchantWhitelist && !merchantMatched) continue;
    if (!hasMerchantWhitelist && !mccMatched) continue;
    
    if (!best || rule.rate > best.rate) {
      best = rule;
      bestIsMerchantSpecific = merchantMatched && hasMerchantWhitelist;
    }
  }
  
  return { rule: best, isMerchantSpecific: bestIsMerchantSpecific };
}

export function calculateResults(cards, selectedIds, mcc, channel, amount, date = new Date(), cardConfigs = {}, merchant = null) {
  const userCards = cards.filter(c => selectedIds.includes(c.card_id));
  
  const results = userCards.map(card => {
    const cardConfig = cardConfigs[card.card_id] || {};
    const { rule, isMerchantSpecific } = findBestRule(card, mcc, channel, date, cardConfig, merchant);
    const rate = rule ? rule.rate : card.base_rate.rate;
    const isCashback = card.currency === 'cashback';
    const earnBlock = card.earn_block || 1;
    
    let points = 0, miles = 0, mpd = 0, cashback = 0;
    let value_low = 0, value_mid = 0, value_high = 0;
    
    if (isCashback) {
      // Cashback calculation
      cashback = Math.floor(amount) * (rate / 100);
      value_low = value_mid = value_high = cashback;
    } else {
      // Miles calculation with earn block support
      const qualifyingBlocks = Math.floor(amount / earnBlock);
      points = qualifyingBlocks * rate;
      const kfRatio = card.conversions.krisflyer.ratio;
      miles = points / kfRatio;
      mpd = (rate / earnBlock) / kfRatio;
      value_low = miles * KRISFLYER_VALUATIONS.low / 100;
      value_mid = miles * KRISFLYER_VALUATIONS.mid / 100;
      value_high = miles * KRISFLYER_VALUATIONS.high / 100;
    }
    
    return {
      card_id: card.card_id,
      card_name: card.card_name,
      bank: card.bank,
      color: card.color,
      image: card.image,
      currency: card.currency,
      rule: rule,
      rule_name: rule ? rule.description : "Base rate",
      is_bonus: !!rule,
      is_merchant_specific: isMerchantSpecific,
      merchant_whitelist: rule?.conditions?.merchant_whitelist || null,
      rate,
      points,
      miles,
      mpd,
      cashback,
      value_low,
      value_mid,
      value_high,
      cap: rule?.caps?.max_qualifying_spend_monthly || rule?.caps?.max_cashback_monthly,
      cap_type: rule?.caps?.max_cashback_monthly ? 'cashback' : 'spend',
      promo: rule?.promo_period,
      min_spend: card.min_spend_monthly
    };
  });
  
  return results.sort((a, b) => b.value_mid - a.value_mid);
}

export function allBaseRate(results) {
  return results.length > 0 && results.every(r => !r.is_bonus);
}
