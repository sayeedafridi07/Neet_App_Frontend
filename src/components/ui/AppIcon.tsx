import { useTheme } from "@/theme/use-theme";
import type { LucideProps } from "lucide-react-native";
import * as LucideIcons from "lucide-react-native";

type IconName = keyof typeof LucideIcons;

interface IconProps extends Omit<LucideProps, "size" | "color"> {
  name: IconName;
  size?: number;
  color?: string;
}

const AppIcon = ({ name, size = 24, color, ...props }: IconProps) => {
  const { colors } = useTheme();

  const iconColor = color ?? colors.text;

  const IconComponent = LucideIcons[name] as
    | React.ComponentType<LucideProps>
    | undefined;

  if (!IconComponent) {
    console.warn(`Icon "${String(name)}" not found in Lucide icons`);

    return <LucideIcons.CircleHelp size={size} color={iconColor} {...props} />;
  }

  return <IconComponent size={size} color={iconColor} {...props} />;
};

export default AppIcon;
