const formatText = (value) => {
  if (!value) return "-";

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const capitalize = (value) => {
  if (!value) return "-";

  return value.charAt(0).toUpperCase() + value.slice(1);
};

export { capitalize, formatText };

