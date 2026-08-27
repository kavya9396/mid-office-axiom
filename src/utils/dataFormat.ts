const formatDatePart = (date: Date): string => {
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

const formatTimePart = (date: Date): string =>
  date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    .toLowerCase();

const createLocalDate = (
  year: string,
  month: string,
  day: string,
  hours = "0",
  minutes = "0",
  seconds = "0",
): Date | null => {
  const yearNumber = Number(year);
  const monthNumber = Number(month);
  const dayNumber = Number(day);
  const hoursNumber = Number(hours);
  const minutesNumber = Number(minutes);
  const secondsNumber = Number(seconds);

  const parsedDate = new Date(
    yearNumber,
    monthNumber - 1,
    dayNumber,
    hoursNumber,
    minutesNumber,
    secondsNumber,
  );

  const isValid =
    parsedDate.getFullYear() === yearNumber &&
    parsedDate.getMonth() === monthNumber - 1 &&
    parsedDate.getDate() === dayNumber &&
    parsedDate.getHours() === hoursNumber &&
    parsedDate.getMinutes() === minutesNumber &&
    parsedDate.getSeconds() === secondsNumber;

  return isValid ? parsedDate : null;
};

export const formatDate = (
  date?: string | Date | null,
  includeTime = true,
): string => {
  if (!date) {
    return "";
  }

  let parsedDate: Date | null;
  let hasTime = false;

  if (date instanceof Date) {
    parsedDate = date;
    hasTime =
      date.getHours() !== 0 ||
      date.getMinutes() !== 0 ||
      date.getSeconds() !== 0 ||
      date.getMilliseconds() !== 0;
  } else {
    const value = date.trim();

    if (!value) {
      return "";
    }

    const isoDateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const dateOnlyMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const standardDateTimeMatch = value.match(
      /^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2}):(\d{2})$/,
    );
    const dateTimeWithoutSecondsMatch = value.match(
      /^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2})$/,
    );
    const hrsDateTimeMatch = value.match(
      /^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2})(\d{2})hrs$/i,
    );

    if (isoDateOnlyMatch) {
      const [, year, month, day] = isoDateOnlyMatch;
      parsedDate = createLocalDate(year, month, day);
    } else if (dateOnlyMatch) {
      const [, day, month, year] = dateOnlyMatch;
      parsedDate = createLocalDate(year, month, day);
    } else if (standardDateTimeMatch) {
      const [, day, month, year, hours, minutes, seconds] =
        standardDateTimeMatch;
      parsedDate = createLocalDate(
        year,
        month,
        day,
        hours,
        minutes,
        seconds,
      );
      hasTime = true;
    } else if (dateTimeWithoutSecondsMatch) {
      const [, day, month, year, hours, minutes] =
        dateTimeWithoutSecondsMatch;
      parsedDate = createLocalDate(year, month, day, hours, minutes);
      hasTime = true;
    } else if (hrsDateTimeMatch) {
      const [, day, month, year, hours, minutes] = hrsDateTimeMatch;
      parsedDate = createLocalDate(year, month, day, hours, minutes);
      hasTime = true;
    } else {
      parsedDate = new Date(value);
      hasTime =
        /T\d{2}:\d{2}/i.test(value) ||
        /\s\d{1,2}:\d{2}/i.test(value);
    }
  }

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const formattedDate = formatDatePart(parsedDate);

  if (!includeTime || !hasTime) {
    return formattedDate;
  }

  return `${formattedDate}, ${formatTimePart(parsedDate)}`;
};
