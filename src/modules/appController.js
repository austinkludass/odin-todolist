import { createProject, createTodo } from "./projectFactory";
import { ProjectListManager } from "./projectManager";
import { DOMManager } from "./domManager";

export const AppController = (() => {
    const handleNewProject = (name) => {
        const project = createProject(name);
        const result = ProjectListManager.addProject(project);
        if (result) {
            DOMManager.addNewProject(project);
            updateStorageData();
        }
    };

    const handleNewTask = (project, name, desc, duedate, priority, notes, complete) => {
        const task = createTodo(name, desc, duedate, priority, notes, complete);
        const projectObj = ProjectListManager.addToDo(project, task);
        if (projectObj) {
            DOMManager.renderTasks(projectObj);
            updateStorageData();
        }
    };

    const handleRemoveProject = (project) => {
        ProjectListManager.removeProject(project);

        updateStorageData();
    };

    const handleTaskComplete = (project, task) => {
        const updatedProj = ProjectListManager.changeTaskComplete(project, task);
        DOMManager.updateCurrentProject(updatedProj);
        DOMManager.renderTasks(updatedProj);
        
        updateStorageData();
    };

    const handleRemoveTask = (project, task) => {
        ProjectListManager.removeTask(project, task);

        updateStorageData();
    };

    const handleUpdatedTask = (project, task) => {
        ProjectListManager.updateTask(project, task);

        updateStorageData();
    }

    const updateStorageData = () => {
        ProjectListManager.updateStorage();
    };


    const getStorageData = () => {
        const projects = ProjectListManager.getProjectsFromStorage();
        if (projects) {
            projects.forEach(proj => {
                DOMManager.addNewProject(proj);
            });
        }
    };

    DOMManager.setNewProjectHandler(handleNewProject);
    DOMManager.setNewTaskHandler(handleNewTask);
    DOMManager.setRemoveProjectCallback(handleRemoveProject);
    DOMManager.setTaskCompleteCallback(handleTaskComplete);
    DOMManager.setRemoveTaskCallback(handleRemoveTask);
    DOMManager.setUpdatedTaskCallback(handleUpdatedTask);

    return {
        init: () => {
            getStorageData();
        },
    };
})();
