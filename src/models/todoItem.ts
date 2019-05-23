export interface Todo {
  id: string;
  description: string;
  userId: string;
  completed?: boolean;
}

export interface TodoCollection {
  Documents: Todo[];
}
