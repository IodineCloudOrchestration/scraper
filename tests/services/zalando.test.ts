import {Zalando} from "../../services/zalando";
import {Result} from "../../definitions";
import {TestTasks} from "./utils";
import path from "path"
import {Browser, launch} from "puppeteer";

const pathToMockTasks = path.join(__dirname, "mock-tasks.json")
let browser: Browser

beforeAll(async () => {
  browser = await launch({headless: false});
});

afterAll(async () => {
  await browser.close();
});

test("zalando-service", async () => {
  const tasks = new TestTasks(pathToMockTasks)

  const zalando = new Zalando(browser)

  // add tasks to queue
  zalando.addTasks(tasks.getNextTasks(4))

  // when there are no new tasks
  zalando.on("tasks:empty", () => {
    zalando.addTasks(tasks.getNextTasks(6))
  })
  const results: Result[] = []
  zalando.on("result", (res: Result) => {
    results.push(res)
    // if all test tasks done then shut down service
    if (tasks.totalLength === results.length) {
      zalando.shutDown()
    }
  })
  // run by setting workersCount
  zalando.setWorkersCount(3)

  await new Promise(res => zalando.once("shutdown", () => res(null)))

}, 60_000);
