export const formatCompactNumber = (value: number) =>
  Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(value)
    .toLowerCase();

export const formatDate = (value?: string) => {
  if (!value) return "Daily";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Daily";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};
