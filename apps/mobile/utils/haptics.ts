import * as Haptics from 'expo-haptics';

// COMPLIANCE-REVIEW: Mobile UX accessibility guidelines - subtle haptic cues for cart actions & order confirmation.

/**
 * Triggers light haptic feedback when adding items to cart.
 */
export const triggerCartHaptic = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Graceful fallback for non-supported devices
  }
};

/**
 * Triggers success haptic feedback upon order completion.
 */
export const triggerOrderSuccessHaptic = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Graceful fallback
  }
};

/**
 * Triggers error haptic feedback for failed validation/actions.
 */
export const triggerErrorHaptic = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Graceful fallback
  }
};
