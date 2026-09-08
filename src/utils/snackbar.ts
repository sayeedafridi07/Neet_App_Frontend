// utils/snackbar.js
import { Snackbar } from "react-native-snackbar";

let themeColors = null;

export const setSnackbarTheme = (colors) => {
  themeColors = colors;
};

const Bar = {
  success: (text) => {
    Snackbar.show({
      text: text,
      duration: Snackbar.LENGTH_LONG,
      backgroundColor: themeColors?.success,
      textColor: themeColors?.primaryText,
    });
  },

  error: (txt1, txt2) => {
    const text = txt2 ? `${txt1}: ${txt2}` : txt1;
    Snackbar.show({
      text: text,
      duration: Snackbar.LENGTH_LONG,
      backgroundColor: themeColors?.error,
      textColor: themeColors?.primaryText,
    });
  },

  info: (text) => {
    Snackbar.show({
      text: text,
      duration: Snackbar.LENGTH_SHORT,
      backgroundColor: themeColors?.primary,
      textColor: themeColors?.primaryText,
    });
  },

  warning: (text) => {
    Snackbar.show({
      text: text,
      duration: Snackbar.LENGTH_LONG,
      backgroundColor: themeColors?.warning,
      textColor: themeColors?.primaryText,
    });
  },
};

export default Bar;
