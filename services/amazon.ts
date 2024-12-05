import {BaseTaskService} from "./base";
import {Browser} from "puppeteer";
import {Task, TaskWorker} from "../definitions";
import {fetchAmazonProductsByQuery} from "../scrapers/amazon";


export class Amazon extends BaseTaskService {
  browser: Browser

  constructor(browser: Browser) {
    super()
    this.browser = browser
  }

  async createTaskWorker(): Promise<TaskWorker> {
    const page = await this.browser.newPage()
    return {
      close: () => page.close(),
      doTask: async (task: Task) => {
        const products = await fetchAmazonProductsByQuery(page, task.query, 10)
        return {id: task.id, products}
      },
    }
  }

  async shutDown() {
    await super.shutDown()
    await this.browser.close()
  }
}