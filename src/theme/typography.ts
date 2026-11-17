export const Typography = {
  // Hero headings, welcome greetings
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },

  // Large screen headings
  heading: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },

  // Main screen titles
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },

  // Section headings
  subtitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },

  // Card titles, lecture names
  cardTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
  },

  // Default body text
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },

  // Emphasized body text
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500" as const,
  },

  // Supporting descriptions
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },

  // Small emphasized text
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600" as const,
  },

  // Links and navigation actions
  link: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500" as const,
  },

  // Button labels
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
  },

  // Timestamps, durations, metadata
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },

  // Categories and tiny labels
  overline: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
} as const;

export type TypographyVariant = keyof typeof Typography;
