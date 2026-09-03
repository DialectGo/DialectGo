export const STREAK_ASSETS = {
  1: require('../../../assets/images/streak_assets_images/streak_day_1.png'),
  2: require('../../../assets/images/streak_assets_images/streak_day_2.png'),
  3: require('../../../assets/images/streak_assets_images/streak_day_3.png'),
  4: require('../../../assets/images/streak_assets_images/streak_day_4.png'),
  5: require('../../../assets/images/streak_assets_images/streak_day_5.png'),
  6: require('../../../assets/images/streak_assets_images/streak_day_6.png'),
  7: require('../../../assets/images/streak_assets_images/streak_day_7.png'),
};

/**
 * Returns the correct streak asset based on the current streak count.
 * It will adaptively pick the highest available asset if the streak exceeds the mapped days.
 * If the streak is 0 or 1, it will return the day 1 asset.
 */
export const getStreakAsset = (streakCount) => {
  const count = parseInt(streakCount, 10) || 0;
  if (count <= 1) return STREAK_ASSETS[1];
  
  const availableDays = Object.keys(STREAK_ASSETS).map(Number).sort((a, b) => a - b);
  
  let selectedDay = availableDays[0];
  for (const day of availableDays) {
    if (count >= day) {
      selectedDay = day;
    } else {
      break;
    }
  }
  
  return STREAK_ASSETS[selectedDay];
};
