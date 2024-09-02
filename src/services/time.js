export const timeSinceOrder = (orderTimestamp) => {
  const now = new Date();
  const orderDate = new Date(orderTimestamp);
  const secondsPast = Math.floor((now - orderDate) / 1000);

  if (secondsPast < 0) {
    return "Just now";
  }

  if (secondsPast < 60) {
    return `${secondsPast} second${secondsPast === 1 ? "" : "s"} ago`;
  }
  if (secondsPast < 3600) {
    const minutes = Math.floor(secondsPast / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (secondsPast < 86400) {
    const hours = Math.floor(secondsPast / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (secondsPast < 2592000) {
    const days = Math.floor(secondsPast / 86400);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  if (secondsPast < 31536000) {
    const months = Math.floor(secondsPast / 2592000);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(secondsPast / 31536000);
  return `${years} year${years === 1 ? "" : "s"} ago`;
};
