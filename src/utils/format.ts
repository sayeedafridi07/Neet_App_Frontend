// Prices from the API are in paise. e.g. 149600 → "₹1,496", 99950 → "₹999.50"
export const formatPrice = (paise: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(paise / 100);

// e.g. "2026-11-25T10:00:00Z" → "25 Nov 2026"
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
