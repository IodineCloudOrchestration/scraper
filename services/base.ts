import {EventEmitter} from "node:events"
import {Task, TaskWorker} from "../definitions";


export abstract class BaseTaskService extends EventEmitter {
  taskResolves: ((task: Task) => void)[]
  tasks: Task[]
  isShutDown: boolean

  runWorkersCount: number
  limitWorkersCount: number

  abstract createTaskWorker(): Promise<TaskWorker>

  constructor() {
    super()
    this.tasks = []
    this.taskResolves = []
    this.limitWorkersCount = 0
    this.runWorkersCount = 0
    this.isShutDown = false
  }

  setWorkersCount(count: number): void {
    if (this.isShutDown) throw Error("Service is already shut down")
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
    if (this.isShutDown) throw Error("Service is already shut down")
    this.isShutDown = true
    if (this.runWorkersCount) {
      this.limitWorkersCount = 0
      this.taskResolves.forEach(res => res(null)) // shut down all workers that wait for a next task
      await new Promise(res => {
        this.once("workers:down", () => res(null))
      })
    }
    this.emit("shutdown")
  }

  private async runWorker(): Promise<void> {
    const worker = await this.createTaskWorker()
    while (true) {
      const task = await this.waitForTask()
      if (task === null) {
        if (worker.close) {
          await worker.close()
        }
        return
      }
      try {
        const result = await worker.doTask(task)
        this.emit("result", result)
      } catch (e) {
        this.emit("task:error", task, e)
      }
    }
  }

  addTasks(tasks: Task[]): void {
    if (this.isShutDown) throw Error("Service is already shut down")
    let index = 0
    while (this.taskResolves.length) {
      const res = this.taskResolves.shift()
      res(tasks[index++])
    }
    this.tasks = this.tasks.concat(tasks.slice(index))
  }

  private async waitForTask(): Promise<Task | null> {
    if (this.runWorkersCount > this.limitWorkersCount) {
      return null // close worker signal
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

