export const getCurrencySymbol = () => localStorage.getItem("currencySymbol") || "$";

const nf = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatNumber = (v) => nf.format(Number(v) || 0);
export const formatMoney = (v) => `${getCurrencySymbol()}${nf.format(Number(v) || 0)}`;

export const round2 = (v) => Math.round((Number(v) + Number.EPSILON) * 100) / 100;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return String(value);
  return `${String(d.getDate()).padStart(2, "0")}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
};

export const formatMonth = (value) => {
  const d = new Date(value);
  if (isNaN(d)) return String(value);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const toISO = (dt) => {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const todayISO = () => toISO(new Date());

export const getDateRange = (period) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  switch (period) {
    case "Today": {
      const t = toISO(new Date(y, m, d));
      return { from: t, to: t };
    }
    case "Week": {
      const start = new Date(y, m, d - now.getDay()); // week starts Sunday
      return { from: toISO(start), to: toISO(new Date(y, m, d)) };
    }
    case "Year":
      return { from: toISO(new Date(y, 0, 1)), to: toISO(new Date(y, 11, 31)) };
    case "Month":
    default:
      return { from: toISO(new Date(y, m, 1)), to: toISO(new Date(y, m + 1, 0)) };
  }
};