let projectArray = [];

export const ProjectListManager = {
    getProjects: () => projectArray,
    addProject: (project) => {
        if (projectArray.some(proj => proj.title === project.title)) return false;
        
        projectArray.push(project)
        return true;
    },
    removeProject: (project) => projectArray = projectArray.filter(proj => proj.title !== project.title),
    addToDo: (project, task) => {
        for (let item of projectArray) {
            if (item.title === project) {
                item.todoList.push(task);
            }
        }

        return projectArray.filter(item => item.title === project)[0];
    },
    changeTaskComplete: (project, task) => {
        const projectFromArray = projectArray.filter(proj => proj.title === project.title)[0];
        projectFromArray.todoList.forEach(item => {
            if (item.title === task.title && item.dueDate === task.dueDate) {
                item.complete = `${task.complete}`;
            }
        });

        return projectFromArray;
    },
    removeTask: (project, task) => {
        const projectFromArray = projectArray.filter(proj => proj.title === project.title)[0];
        projectFromArray.todoList = projectFromArray.todoList.filter(item => item.title !== task.title);
    },
    updateTask: (project, task) => {
        const projectFromArray = projectArray.filter(proj => proj.title === project.title)[0];
        const taskIndex = projectFromArray.todoList.findIndex(t => t.title === task.title);
        if (taskIndex !== -1) {
            projectFromArray.todoList[taskIndex] = task;
        }
    },
    updateStorage: () => {
        localStorage.setItem("projects", JSON.stringify(projectArray));
    },
    getProjectsFromStorage: () => {
        const data = JSON.parse(localStorage.getItem("projects"));
        if (data) {
            projectArray = data;
        }

        return projectArray;
    }
};
