import {Amazon} from "../../services/amazon";
import {Result} from "../../definitions";
import {TestTasks} from "./utils";
import path from "path"
import {Browser, launch} from "puppeteer";

const pathToMockTasks = path.join(__dirname, "mock-tasks.json")
let browser: Browser

beforeAll(async () => {
  browser = await launch();
});

afterAll(async () => {
  await browser.close();
});

test("amazon-service", async () => {
  const tasks = new TestTasks(pathToMockTasks)

  const amazon = new Amazon(browser)

  // add tasks to queue
  amazon.addTasks(tasks.getNextTasks(4))

  // when there are no new tasks
  amazon.on("tasks:empty", () => {
    amazon.addTasks(tasks.getNextTasks(6))
    amazon.setWorkersCount(5) // set 5 tabs
  })
  const results: Result[] = []
  amazon.on("result", (res: Result) => {
    results.push(res)
    // if all test tasks done then shut down service
    if (tasks.totalLength === results.length) {
      amazon.shutDown()
    }
  })
  // run by setting workersCount
  amazon.setWorkersCount(2) // set 2 tabs

  await new Promise(res => amazon.once("shutdown", () => res(null)))

}, 60_000);
