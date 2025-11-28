export function formatNumber(n) {
  const num = Number(n) || 0;
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
}

export function formatCurrencyPHP(n) {
  const num = Number(n) || 0;
  // Use Philippine peso sign with thousands separators and two decimals
  return `₱${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
}

export default formatCurrencyPHP;
