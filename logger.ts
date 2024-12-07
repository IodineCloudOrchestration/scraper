import winston from "winston";
import {CloudWatchTransport} from "./aws/cloud-watch"

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new CloudWatchTransport("testing", "ebay")
  ]
})


