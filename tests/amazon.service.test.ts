import {Browser, launch} from "puppeteer";
import {Amazon} from "../services/amazon";
import {Result, Task} from "../definitions";
import {TestTasks} from "./utils";
import path from "path"

const pathToMockTasks = path.join(__dirname, "mock-tasks.json")

test("amazon-service", async () => {
  let isDoneResolve;

  const tasks = new TestTasks(pathToMockTasks)
  const results: Result[] = []

  const browser = await launch()
  const amazon = new Amazon(browser)

  amazon.addTasks(tasks.getNextTasks(4))

  amazon.on("tasks:empty", () => {
    amazon.addTasks(tasks.getNextTasks(6))
    amazon.setWorkersCount(5)
  })
  amazon.on("result", (res: Result) => {
    results.push(res)
    if (tasks.totalLength === results.length) {
      isDoneResolve(true)
    }
  })
  amazon.setWorkersCount(2)

  await new Promise(res => isDoneResolve = res)
  await amazon.shutDown()
}, 60_000);
