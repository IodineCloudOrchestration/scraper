import {Result} from "../../definitions";
import {TestTasks} from "./utils";
import path from "path"
import {Ebay} from "../../services/ebay";

const pathToMockTasks = path.join(__dirname, "mock-tasks.json")

test("ebay-service", async () => {
  const tasks = new TestTasks(pathToMockTasks)

  const ebay = new Ebay()

  ebay.addTasks(tasks.getNextTasks(4))

  ebay.on("tasks:empty", () => {
    ebay.addTasks(tasks.getNextTasks(6))
  })
  const results: Result[] = []
  ebay.on("result", (res: Result) => {
    results.push(res)
    if (tasks.totalLength === results.length) {
      ebay.shutDown()
    }
  })
  ebay.setWorkersCount(5)

  await new Promise(res => ebay.on("shutdown", () => res(null)))

}, 60_000);
