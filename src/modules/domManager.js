import { formatDistanceToNow, parse } from "date-fns";

let handleNewProjectCallback = null;
let handleNewTaskCallback = null;
let handleRemoveProjectCallback = null;
let handleTaskCompleteCallback = null;
let handleRemoveTaskCallback = null;
let handleUpdatedTaskCallback = null;

export const DOMManager = (() => {
    const menu = document.querySelector("#newItemMenu");
    const newBtn = document.querySelector(".add-button");
    const newProjectBtn = document.querySelector("#newProjectBtn");
    const newTaskBtn = document.querySelector("#newTaskBtn");
    const projectsGrid = document.querySelector("#projectsGrid");

    const projectMenu = document.createElement("div");
    projectMenu.className = "project-menu";
    projectMenu.innerHTML = `
        <div class="delete-option">Delete</div>
    `;
    document.body.appendChild(projectMenu);
    projectMenu.style.display = "none";

    const taskMenu = document.createElement("div");
    taskMenu.className = "task-menu";
    taskMenu.innerHTML = `
        <div class="task-edit-option">Edit</div>
        <div class="task-delete-option">Delete</div>
    `;
    document.body.appendChild(taskMenu);
    taskMenu.style.display = "none";

    let currentProjectEl = null;
    let currentProject = null;
    let currentTaskCard = null;
    let currentTask = null;
    let currentEditingTask = null;

    const renderTasks = (project) => {
        document.querySelectorAll(".todo-card").forEach(card => card.remove());
        project.todoList.forEach(task => {
            addNewTask(task);
        });
    };

    const addNewTask = (task) => {
        const taskGrid = document.querySelector(".todo-container");
        const taskCard = document.createElement("div");
        const complete = task.complete === "true";
        taskCard.className = `todo-card ${complete ? "todo-complete" : ""}`;
        taskCard.innerHTML = `
            <input class="todo-checkbox" ${complete ? "checked" : ""} type="checkbox" />
            <div class="todo-task">${task.title}</div>
            <div class="todo-priority priority-${task.priority}">${task.priority}</div>
            <div class="todo-duedate">${task.dueDate}</div>
            <div data-todo="${task.title}" class="todo-options">⋮</div>
        `;
        
        const checkbox = taskCard.querySelector(".todo-checkbox");
        checkbox.addEventListener("change", (e) => {
            e.stopPropagation();
            task.complete = e.target.checked;
            taskCard.classList.toggle("todo-complete", task.complete);
            handleTaskCompleteCallback(currentProject, task);
        });

        checkbox.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        const taskOps = taskCard.querySelector(".todo-options");
        taskOps.addEventListener("click", (e) => {
            e.stopPropagation();

            currentTaskCard = taskCard;
            currentTask = task;

            const rect = taskOps.getBoundingClientRect();
            taskMenu.style.left = `${rect.right - 100 + window.scrollX}px`;
            taskMenu.style.top = `${rect.bottom + 5 + window.scrollY}px`;
            taskMenu.style.display = "flex";
        });
        
        taskCard.addEventListener("click", () => {
            const modal = document.querySelector(".todo-details-modal");
            const title = modal.querySelector("#details-title");
            const desc = modal.querySelector("#details-desc");
            const priority = modal.querySelector("#details-priority");
            const due = modal.querySelector("#details-due");
            const notes = modal.querySelector("#details-notes");
            
            title.textContent = task.title;
            desc.textContent = task.description;
            priority.textContent = task.priority[0].toUpperCase() + task.priority.slice(1);
            priority.className = `${task.priority}`;

            const dueDate = parse(task.dueDate, 'dd-MM-yyyy', new Date());
            due.textContent = `${formatDistanceToNow(dueDate, { addSuffix: true })}`;
            notes.textContent = task.notes === "" ? "Notes..." : task.notes;

            modal.style.display = "block";

            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    modal.style.display = "none";
                }
            });

            window.onclick = (event) => {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            };
        });

        document.addEventListener("click", (event) => {
            if (!taskMenu.contains(event.target)) {
                taskMenu.style.display = "none";
            }
    
            if (!menu.contains(event.target) && !newBtn.contains(event.target)) {
                menu.style.display = "none";
            }
        });

        taskGrid.appendChild(taskCard);
    };

    const addNewProject = (project) => {
        const newProject = document.createElement("div");
        newProject.className = "project-card";
        newProject.innerHTML = `
            ${project.title}
            <div data-project="${project.title}" class="project-options">⋮</div>
        `;
        projectsGrid.appendChild(newProject);

        newProject.addEventListener("click", () => {
            document.querySelectorAll(".project-card").forEach(card => {
                card.classList.remove("selected");
            });

            newProject.classList.add("selected");
            currentProject = project;
            renderTasks(currentProject);
            updateTodoHeader(project.title);
        });
        
        const projectOps = newProject.querySelector(".project-options");
        projectOps.addEventListener("click", (e) => {
            e.stopPropagation();
            currentProjectEl = newProject;
            const rect = projectOps.getBoundingClientRect();
            projectMenu.style.left = `${rect.right - 20 + window.scrollX}px`;
            projectMenu.style.top = `${rect.bottom + 5 + window.scrollY}px`;
            projectMenu.style.display = "flex";
        });

        newProject.click();
    };

    const updateTodoHeader = (title) => {
        const todoHeader = document.querySelector(".todo-header");
        if (todoHeader) {
            todoHeader.textContent = title;
        }
    };

    const removeTasks = () => {
        document.querySelectorAll(".todo-card").forEach(card => {
            card.remove();
        });
    };

    const updateCurrentProject = (project) => {
        currentProject = project;
    };

    projectMenu.querySelector(".delete-option").addEventListener("click", () => {
        projectMenu.style.display = "none";
        if (currentProjectEl) {
            currentProjectEl.remove();
            handleRemoveProjectCallback(currentProject);
            const firstProject = document.querySelector(".project-card");
            if (firstProject) firstProject.click();
            else {
                currentProject = null;
                removeTasks();
                updateTodoHeader("");
            }
        } 
    });

    document.addEventListener("click", (event) => {
        if (!projectMenu.contains(event.target)) {
            projectMenu.style.display = "none";
        }

        if (!menu.contains(event.target) && !newBtn.contains(event.target)) {
            menu.style.display = "none";
        }
    });

    newBtn.addEventListener("click", () => {
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    newProjectBtn.addEventListener("click", () => {
        menu.style.display = "none";

        if (document.querySelector(".project-input-card")) return;

        const inputCard = document.createElement("div");
        inputCard.classList.add("project-input-card");

        inputCard.innerHTML = `
            <input type="text" maxlength="12" placeholder="Project name" id="projectInput" />
            <div class="btn-group">
                <button id="addProjectBtn">Add</button>
                <button id="cancelProjectBtn">Cancel</button>
            </div>
        `;

        projectsGrid.appendChild(inputCard);
        const input = inputCard.querySelector("#projectInput");
        input.focus();

        inputCard.querySelector("#addProjectBtn").addEventListener("click", () => {
            const name = input.value.trim();
            if (!name) return;
            handleNewProjectCallback(name);
            inputCard.remove();
        });

        inputCard.querySelector("#cancelProjectBtn").addEventListener("click", () => {
            inputCard.remove();
        });
    });

    newTaskBtn.addEventListener("click", () => {

        menu.style.display = "none";
        if (!currentProject) return;

        modal.style.display = "block";

  
        closeBtn.onclick = () => {
            modal.style.display = "none";
            form.reset();

            currentEditingTask = null;
            modal.querySelector("h2").textContent = "Add Task";
            addBtn.textContent = "ADD";
        };
        
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = "none";
                form.reset();

                currentEditingTask = null;
                modal.querySelector("h2").textContent = "Add Task";
                addBtn.textContent = "ADD";
            }
        };

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                modal.style.display = "none";
                form.reset();

                currentEditingTask = null;
                modal.querySelector("h2").textContent = "Add Task";
                addBtn.textContent = "ADD";
            }
        });

    });
    
    const modal = document.querySelector("#popupModal");
    const closeBtn = document.querySelector("#closeModalBtn");
    const addBtn = document.querySelector("#addTaskBtn");
    const form = document.querySelector("#taskForm");
    
    addBtn.onclick = (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const title = document.querySelector("#taskTitle").value;
        const description = document.querySelector("#taskDescription").value;
        const notes = document.querySelector("#taskNotes").value;
        const dueDate = document.querySelector("#taskDueDate").value;
        const [year, month, day] = dueDate.split("-");
        const priority = document.querySelector('input[name="priority"]:checked')?.value;

        if (currentEditingTask) {
            currentEditingTask.title = title;
            currentEditingTask.description = description;
            currentEditingTask.notes = notes;
            currentEditingTask.dueDate = `${day}-${month}-${year}`;
            currentEditingTask.priority = priority;

            renderTasks(currentProject);
            handleUpdatedTaskCallback(currentProject, currentTask);
            currentEditingTask = null;
        } else {
            handleNewTaskCallback(
                currentProject?.title || "General", title, 
                description, `${day}-${month}-${year}`, priority, notes, "false"
            );
        }

        modal.style.display = "none";
        form.reset();
        modal.querySelector("h2").textContent = "Add Task";
        addBtn.textContent = "ADD";
    };

    document.addEventListener("click", (e) => {
        if (e.target.matches(".task-edit-option")) {
            taskMenu.style.display = "none";

            if (!currentTask || !currentProject) return;

            currentEditingTask = currentTask;

            const modal = document.querySelector("#popupModal");
            document.querySelector("#taskTitle").value = currentTask.title;
            document.querySelector("#taskDescription").value = currentTask.description;
            document.querySelector("#taskNotes").value = currentTask.notes;

            const [day, month, year] = currentTask.dueDate.split("-");
            document.querySelector("#taskDueDate").value = `${year}-${month}-${day}`;
            document.querySelector(`#priority${currentTask.priority[0].toUpperCase() + currentTask.priority.slice(1)}`).checked = true;
            modal.querySelector("h2").textContent = "Edit Task";
            document.querySelector("#addTaskBtn").textContent = "UPDATE";

            modal.style.display = "block";

            closeBtn.onclick = () => {
                modal.style.display = "none";
                form.reset();
    
                currentEditingTask = null;
                modal.querySelector("h2").textContent = "Add Task";
                addBtn.textContent = "ADD";
            };
            
            window.onclick = (event) => {
                if (event.target == modal) {
                    modal.style.display = "none";
                    form.reset();
    
                    currentEditingTask = null;
                    modal.querySelector("h2").textContent = "Add Task";
                    addBtn.textContent = "ADD";
                }
            };
    
            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    modal.style.display = "none";
                    form.reset();
    
                    currentEditingTask = null;
                    modal.querySelector("h2").textContent = "Add Task";
                    addBtn.textContent = "ADD";
                }
            });
        }
      
        if (e.target.matches(".task-delete-option")) {
            taskMenu.style.display = "none";
          
            if (currentTaskCard && currentProject && currentTask) {
                currentTaskCard.remove();
          
                currentProject.todoList = currentProject.todoList.filter(
                    task => task !== currentTask
                );

                handleRemoveTaskCallback(currentProject, currentTask);
            }
          
            currentTaskCard = null;
            currentTask = null;
          }
      });

    return {
        addNewProject,
        renderTasks,
        updateCurrentProject,
        setNewProjectHandler: (cb) => {
            handleNewProjectCallback = cb;
        },
        setNewTaskHandler: (cb) => {
            handleNewTaskCallback = cb;
        },
        setRemoveProjectCallback: (cb) => {
            handleRemoveProjectCallback = cb;
        },
        setTaskCompleteCallback: (cb) => {
            handleTaskCompleteCallback = cb;
        },
        setRemoveTaskCallback: (cb) => {
            handleRemoveTaskCallback = cb;
        },
        setUpdatedTaskCallback: (cb) => {
            handleUpdatedTaskCallback = cb;
        }
    };
})();
