import {BaseTaskService} from "./base";
import {Browser} from "puppeteer";
import {Task, TaskWorker} from "../definitions";
import {fetchAliExpressProductByQuery} from "../scrapers/aliexpress";


export class AliExpress extends BaseTaskService {
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
        const products = await fetchAliExpressProductByQuery(page, task.query, 10)
        return {id: task.id, products}
      },
    }
  }

  async shutDown() {
    await super.shutDown()
    await this.browser.close()
  }
}