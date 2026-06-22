import React from "react";

type LastLoginProps = {
  lastLogin: string | Date;
};

const getDayWithOrdinal = (day: number) => {
  if (day >= 11 && day <= 13) return `${day}th`;

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

const formatLastLogin = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  const day = getDayWithOrdinal(date.getDate());
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear().toString().slice(-2);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `Last login: ${day} ${month} ’${year} ; ${time.toLowerCase()}`;
};

const LastLogin: React.FC<LastLoginProps> = ({ lastLogin }) => {
  return <span>{formatLastLogin(lastLogin)}</span>;
};



export default LastLogin;