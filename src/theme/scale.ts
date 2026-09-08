import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

const SCREEN_WIDTH = 375;

export const WP = (percent) => Math.round((width * percent) / 100);

export const HP = (percent) => Math.round((height * percent) / 100);

export const normalize = (size) => {
  const scale = width / SCREEN_WIDTH;

  const newSize = size * scale;

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const ScreenWidth = width;
export const ScreenHeight = height;
