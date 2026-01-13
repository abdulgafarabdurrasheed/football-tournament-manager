import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
}

export const useTodoStore = create<TodoState>()(
  devtools(
    persist(
      (set) => ({
        todos: [],

        addTodo: (text) =>
          set(
            (state) => ({
              todos: [
                ...state.todos,
                {
                  id: crypto.randomUUID(),
                  text,
                  completed: false,
                },
              ],
            }),
            false,
            "addTodo"
          ),

        toggleTodo: (id) =>
          set(
            (state) => ({
              todos: state.todos.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
              ),
            }),
            false,
            "toggleTodo"
          ),

        removeTodo: (id) =>
          set(
            (state) => ({
              todos: state.todos.filter((todo) => todo.id !== id),
            }),
            false,
            "removeTodo"
          ),
      }),
      { name: "todo-storage" }
    ),
    { name: "TodoStore" }
  )
);
