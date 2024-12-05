export interface Product {
  name: string;
  price: number;
  valuta: string;
  productUrl: string;
  imageUrl: string;
}

export interface Task {
  id: string,
  query: string
}

export interface Result {
  id: string,
  products: Product[]
}

export interface TaskWorker {
  doTask: (task: Task) => Promise<Result>
  close?: () => Promise<void>,
}