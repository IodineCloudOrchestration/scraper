import {AliExpress} from "../../services/aliexpress";
import {Result, Task} from "../../definitions";
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

test("aliexpress-service", async () => {
  const tasks = new TestTasks(pathToMockTasks)

  const aliexpress = new AliExpress(browser)

  aliexpress.addTasks(tasks.getNextTasks(4))

  aliexpress.on("tasks:empty", () => {
    aliexpress.addTasks(tasks.getNextTasks(6))
  })
  const results: Result[] = []
  aliexpress.on("result", (res: Result) => {
    results.push(res)
    if (tasks.totalLength === results.length) {
      aliexpress.shutDown()
    }
  })
  aliexpress.setWorkersCount(5)

  await new Promise(res => aliexpress.on("shutdown", () => res(null)))

}, 60_000);
