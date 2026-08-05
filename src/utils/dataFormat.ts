export const formatDate = (date?: string | Date | null): string => {
  if (!date) return "";

  let d: Date;

  if (date instanceof Date) {
    d = date;
  } else if (/^\d{2}\/\d{2}\/\d{4},\s\d{4}hrs$/i.test(date)) {
    // Handles: 01/04/2026, 1300hrs
    const [datePart, timePart] = date.split(", ");
    const [day, month, year] = datePart.split("/").map(Number);

    const hours = Number(timePart.substring(0, 2));
    const minutes = Number(timePart.substring(2, 4));

    d = new Date(year, month - 1, day, hours, minutes);
  } else {
    // Handles: 2026-04-10 10:15 AM, ISO strings, etc.
    d = new Date(date);
  }

  if (isNaN(d.getTime())) {
    return "";
  }

  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();

  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).toLowerCase();

  return `${day} ${month} ${year}, ${time}`;
};

export const formatDiscrepancy = (value?: string | null): string => {
  if (!value?.trim()) return "";

  return value
    .trim()
    .split(/\s+/)
    .map(item => `#${item}`)
    .join("");
};
