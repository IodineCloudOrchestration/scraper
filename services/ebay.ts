import {BaseTaskService} from "./base";
import {Browser} from "puppeteer";
import {Task, TaskWorker} from "../definitions";
import {fetchEbayProductsByQuery} from "../api/ebay";


export class Ebay extends BaseTaskService {
  async createTaskWorker(): Promise<TaskWorker> {
    return {
      doTask: async (task: Task) => {
        const products = await fetchEbayProductsByQuery(task.query, 10)
        return {id: task.id, products}
      },
    }
  }
}