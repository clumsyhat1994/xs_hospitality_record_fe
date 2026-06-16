/** Aligns with backend {@code GiftPurchaseCategory}. */
export const GIFT_PURCHASE_CATEGORIES = {
  BEVERAGE: "BEVERAGE",
  BUSINESS_GIFT: "BUSINESS_GIFT",
  TEA: "TEA",
  FRUIT: "FRUIT",
};

export const GIFT_PURCHASE_CATEGORY_LABELS = {
  [GIFT_PURCHASE_CATEGORIES.BEVERAGE]: "酒水",
  [GIFT_PURCHASE_CATEGORIES.BUSINESS_GIFT]: "商务礼品",
  [GIFT_PURCHASE_CATEGORIES.TEA]: "茶叶",
  [GIFT_PURCHASE_CATEGORIES.FRUIT]: "水果",
};

export const GIFT_PURCHASE_CATEGORY_OPTIONS = Object.entries(
  GIFT_PURCHASE_CATEGORY_LABELS,
).map(([value, label]) => ({ value, label }));
