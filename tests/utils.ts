import fs, {PathOrFileDescriptor} from "fs"
import {Task} from "../definitions";

export class TestTasks {
  private index: number
  private tasks: Task[]

  constructor(path: PathOrFileDescriptor) {
    this.index = 0
    this.tasks = JSON.parse(fs.readFileSync(path, {encoding: "utf8"}))
  }

  getNextTasks(limit: number): Task[] {
    const tasks = this.tasks.slice(this.index, this.index + limit)
    this.index += tasks.length
    return tasks
  }
  
  get totalLength() {
    return this.tasks.length
  }
}



