import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  PutLogEventsCommand
} from "@aws-sdk/client-cloudwatch-logs";
import {getEnv} from "../config";
import TransportStream from "winston-transport";
import {LogEntry} from "winston";


export const client = new CloudWatchLogsClient({
  region: getEnv("AWS_CLOUD_WATCH_REGION"),
  credentials: {
    accessKeyId: getEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY"),
  },
});


export class CloudWatchTransport extends TransportStream {
  logGroupName: string
  logStreamName: string

  constructor(logGroupName: string, logStreamName: string, opts?: TransportStream.TransportStreamOptions) {
    super(opts);
    this.logGroupName = logGroupName
    this.logStreamName = logStreamName
  }

  private async createLogGroup() {
    try {
      await client.send(new CreateLogGroupCommand({logGroupName: this.logGroupName}));
    } catch (err) {
      if (err.name !== 'ResourceAlreadyExistsException') {
        throw err;
      }
    }
  }

  private async createLogStream() {
    try {
      await client.send(new CreateLogStreamCommand({
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName
      }));
    } catch (err: any) {
      if (err.name !== 'ResourceAlreadyExistsException') {
        throw err;
      }
    }
  }

  log(info: LogEntry, callback: () => void) {
    this.sendLogToCloudWatch(info).then(callback).catch(callback);
  }

  private async sendLogToCloudWatch(info: LogEntry) {
    const logEvent = {
      message: JSON.stringify(info),
      timestamp: Date.now(),
    };

    const params = {
      logEvents: [logEvent],
      logGroupName: this.logGroupName,
      logStreamName: this.logStreamName,
    };
    try {
      await client.send(new PutLogEventsCommand(params));
    } catch (err: any) {
      if (err.name === "ResourceNotFoundException") {
        await this.createLogGroup()
        await this.createLogStream()
        return this.sendLogToCloudWatch(info)
      }
      throw err
    }
  }
}