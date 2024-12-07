import winston from "winston";
import {CloudWatchTransport} from "./aws/cloud-watch"
import {getEnv} from "./config";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new CloudWatchTransport(
      getEnv("AWS_CLOUD_WATCH_GROUP_NAME"),
      getEnv("AWS_CLOUD_WATCH_STREAM_NAME"),
    )
  ]
})


