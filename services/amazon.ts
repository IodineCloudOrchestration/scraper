import {BaseService} from "./base";
import {Page} from "puppeteer";
import {fetchAmazonProductsByQuery} from "../scraper/amazon"
import {Result, Task} from "../definitions"



export class Amazon extends BaseService {
  async doTask(page: Page, task: Task): Promise<Result> {
    return {
      id: task.id,
      products: await fetchAmazonProductsByQuery(page, task.query, 10)
    }
  }
}