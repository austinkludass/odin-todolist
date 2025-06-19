export const createTodo = (title, description, dueDate, priority, notes, complete) => {
    return { title, description, dueDate, priority, notes, complete };
};

export const createProject = (title, todos = []) => {
    return { title, todoList: todos };
};