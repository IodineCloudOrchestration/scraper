import {BaseService} from "./base";
import puppeteer, {Page} from "puppeteer";
import {fetchAliExpressProductByQuery} from "../scrapers/aliexpress"
import {Result, Task} from "../definitions"


export class AliExpress extends BaseService {
  async doTask(page: Page, task: Task): Promise<Result> {
    return {
      id: task.id,
      products: await fetchAliExpressProductByQuery(page, task.query, 10)
    }
  }
}