export default function formatUptime(uptimeInSeconds) {
  const years = Math.floor(uptimeInSeconds / (365 * 86400));
  uptimeInSeconds %= 365 * 86400;
  const days = Math.floor(uptimeInSeconds / 86400);
  uptimeInSeconds %= 86400;
  const hours = Math.floor(uptimeInSeconds / 3600);
  uptimeInSeconds %= 3600;
  const minutes = Math.floor(uptimeInSeconds / 60);
  const seconds = Math.floor(uptimeInSeconds % 60);

  const parts = [];
  if (years > 0) parts.push(`${years}y`);
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}
