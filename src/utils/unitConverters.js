export const convertTemp = (c, unit) => {
  if (c === null || c === undefined) return 'N/A';
  if (unit === 'F') return ((c * 9) / 5 + 32).toFixed(1);
  return Number(c).toFixed(1);
};

export const convertSpeed = (kmh, unit) => {
  if (kmh === null || kmh === undefined) return 'N/A';
  if (unit === 'ms') return (kmh / 3.6).toFixed(1);
  if (unit === 'mph') return (kmh * 0.621371).toFixed(1);
  return Number(kmh).toFixed(1);
};

export const convertPrecip = (mm, unit) => {
  if (mm === null || mm === undefined) return 'N/A';
  if (unit === 'in') return (mm * 0.0393701).toFixed(2);
  return Number(mm).toFixed(1);
};
