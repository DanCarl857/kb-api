import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "HH:mm:ss" }),
    format.printf(({ level, message, timestamp }) => {
      return `[${level.toUpperCase()}] ${timestamp} ${message}`;
    })
  ),
  transports: [new transports.Console()],
});

export default logger;
