export const formatDate = (
  date?: string | Date | null,
): string => {
  if (!date) return "";

  let parsedDate: Date;

  if (date instanceof Date) {
    parsedDate = date;
  } else {
    const value = date.trim();

    // Handles: 19/08/2026, 01:12:30
    const standardDateTimeMatch = value.match(
      /^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2}):(\d{2})$/,
    );

    // Handles: 01/04/2026, 1300hrs
    const hrsDateTimeMatch = value.match(
      /^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2})(\d{2})hrs$/i,
    );

    if (standardDateTimeMatch) {
      const [, day, month, year, hours, minutes, seconds] =
        standardDateTimeMatch;

      parsedDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
        Number(seconds),
      );
    } else if (hrsDateTimeMatch) {
      const [, day, month, year, hours, minutes] =
        hrsDateTimeMatch;

      parsedDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
      );
    } else {
      // Handles ISO strings and other browser-supported formats
      parsedDate = new Date(value);
    }
  }

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const day = parsedDate.getDate();
  const month = parsedDate.toLocaleString("en-US", {
    month: "short",
  });
  const year = parsedDate.getFullYear();

  const time = parsedDate
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    .toLowerCase();

  return `${day} ${month} ${year}, ${time}`;
};