export const Typography = {
  // Regular body text and general-purpose content.
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },

  // Main heading of a screen or major section.
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },

  // Secondary heading or supporting text below a title.
  subtitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },

  // Secondary/supporting information.
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },

  // Small text that needs emphasis, such as labels or metadata.
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600" as const,
  },

  // Text used for links or navigational actions.
  link: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500" as const,
  },
};
