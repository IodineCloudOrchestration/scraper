import {EventEmitter} from "node:events"
import {Result, Task} from "../definitions";
import {Browser, Page} from "puppeteer";

export abstract class BaseService extends EventEmitter {
  taskResolves: ((task: Task) => void)[]
  tasks: Task[]
  browser: Browser
  isShutDown: boolean

  runWorkersCount: number
  limitWorkersCount: number

  constructor(browser: Browser) {
    super()
    this.tasks = []
    this.taskResolves = []
    this.browser = browser
    this.limitWorkersCount = 0
    this.runWorkersCount = 0
    this.isShutDown = false
  }

  setWorkersCount(count: number): void {
    if (this.isShutDown) throw Error("Service is shut down")
    this.limitWorkersCount = count
    while (this.runWorkersCount < this.limitWorkersCount) {
      this.runWorkersCount++
      this.runWorker().finally(() => {
        this.runWorkersCount--
        if (!this.runWorkersCount) {
          this.emit("workers:down")
        }
      })
    }
  }

  async shutDown(): Promise<void> {
    this.isShutDown = true
    if (this.runWorkersCount) {
      this.limitWorkersCount = 0
      this.taskResolves.forEach(res => res(null)) // shut down all workers that wait for a next task
      await new Promise(res => {
        this.once("workers:down", () => res(null))
      })
    }
    await this.browser.close()
  }

  async runWorker(): Promise<void> {
    const page = await this.browser.newPage()
    try {
      while (true) {
        const task = await this.waitForTask()
        if (task === null) return // shut down worker
        const result = await this.doTask(page, task)
        this.emit("result", result)
        await page.goto("about:blank")
      }
    } catch (e) {
      throw e
    } finally {
      await page.close()
    }
  }

  abstract doTask(page: Page, task: Task): Promise<Result>

  addTasks(tasks: Task[]): void {
    if (this.isShutDown) throw Error("Service is shut down")
    let index = 0
    while (this.taskResolves.length) {
      const res = this.taskResolves.shift()
      res(tasks[index++])
    }
    this.tasks = this.tasks.concat(tasks.slice(index))
  }

  async waitForTask(): Promise<Task | null> {
    if (this.runWorkersCount > this.limitWorkersCount) {
      return null // shut down signal
    }
    if (this.tasks.length === 0) {
      return new Promise(res => {
        this.taskResolves.push(res)
      })
    }
    const task = this.tasks.shift()
    if (this.tasks.length === 0) {
      this.emit("tasks:empty")
    }
    return task
  }
}

