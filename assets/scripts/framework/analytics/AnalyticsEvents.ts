/**
 * Centralized analytics event names.
 *
 * Why: avoid passing raw strings to analytics adapters.
 * Add new events here as your project grows.
 */

export const AnalyticsEvent = {
  AppBootEnter: 'app_boot_enter',
  AppHomeEnter: 'app_home_enter',
  AppGameplayEnter: 'app_gameplay_enter',
  AppResultEnter: 'app_result_enter',

  ShopBuyClick: 'shop_buy_click',
} as const;

export type AnalyticsEventName = typeof AnalyticsEvent[keyof typeof AnalyticsEvent];
