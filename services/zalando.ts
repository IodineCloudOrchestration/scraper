import {BaseService} from "./base";
import {Page} from "puppeteer";
import {fetchZalandoProductsByQuery} from "../scrapers/zalando"
import {Result, Task} from "../definitions"

export class Zalando extends BaseService {
  async doTask(page: Page, task: Task): Promise<Result> {
    return {
      id: task.id,
      products: await fetchZalandoProductsByQuery(page, task.query, 10)
    }
  }
}