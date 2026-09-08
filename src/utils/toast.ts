import Toast from "react-native-toast-message";

type ToastType = "success" | "error" | "info";

interface ShowToastOptions {
  type: ToastType;
  message: string;
  title?: string;
}

export const showToast = ({ type, message, title }: ShowToastOptions) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: "top",
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
  });
};
