let handleNewProjectCallback = null;
let handleNewTaskCallback = null;
let handleRemoveProjectCallback = null;
let handleTaskCompleteCallback = null;

export const DOMManager = (() => {
    const menu = document.querySelector("#newItemMenu");
    const newBtn = document.querySelector(".add-button");
    const newProjectBtn = document.querySelector("#newProjectBtn");
    const newTaskBtn = document.querySelector("#newTaskBtn");
    const projectsGrid = document.querySelector("#projectsGrid");

    const sharedMenu = document.createElement("div");
    sharedMenu.className = "project-menu";
    sharedMenu.innerHTML = `
        <div class="rename-option">Rename</div>
        <div class="delete-option">Delete</div>
    `;
    document.body.appendChild(sharedMenu);
    sharedMenu.style.display = "none";

    let currentProjectEl = null;
    let currentRenameInput = null;
    let currentProject = null;

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
        
        taskCard.addEventListener("click", () => {
            console.log("Task -> " + JSON.stringify(task));
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
            sharedMenu.style.left = `${rect.right - 20 + window.scrollX}px`;
            sharedMenu.style.top = `${rect.bottom + 5 + window.scrollY}px`;
            sharedMenu.style.display = "flex";
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

    sharedMenu.querySelector(".rename-option").addEventListener("click", () => {
        sharedMenu.style.display = "none";

        if (currentRenameInput) {
            const prevTitle = currentRenameInput.originalTitle;
            handleNewProjectCallback(prevTitle);
            currentRenameInput.container.remove();
            currentRenameInput = null;
        }

        const currentTitle = currentProjectEl.textContent.trim().split("⋮")[0].trim();

        const inputCard = document.createElement("div");
        inputCard.classList.add("project-input-card");
        inputCard.innerHTML = `
            <input type="text" value="${currentTitle}" />
            <div class="btn-group">
                <button class="saveRename">Save</button>
                <button class="cancelRename">Cancel</button>
            </div>
        `;

        currentProjectEl.replaceWith(inputCard);
        const input = inputCard.querySelector("input");
        input.focus();

        currentRenameInput = {
            container: inputCard,
            originalTitle: currentTitle,
        };

        inputCard.querySelector(".saveRename").addEventListener("click", () => {
            const newName = input.value.trim();
            if (!newName) return;
            handleNewProjectCallback(newName);
            inputCard.remove();
            currentRenameInput = null;
        });

        inputCard.querySelector(".cancelRename").addEventListener("click", () => {
            handleNewProjectCallback(currentTitle);
            inputCard.remove();
            currentRenameInput = null;
        });
    });

    sharedMenu.querySelector(".delete-option").addEventListener("click", () => {
        sharedMenu.style.display = "none";
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
        if (!sharedMenu.contains(event.target)) {
            sharedMenu.style.display = "none";
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
            <input type="text" placeholder="Project name" id="projectInput" />
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
        const modal = document.querySelector("#popupModal");
        const closeBtn = document.querySelector("#closeModalBtn");
        const addBtn = document.querySelector("#addTaskBtn");
        const form = document.querySelector("#taskForm");

        menu.style.display = "none";
        if (!currentProject) return;

        modal.style.display = "block";

  
        closeBtn.onclick = () => {
            modal.style.display = "none";
            form.reset();
        };
        
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = "none";
                form.reset();
            }
        };

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                modal.style.display = "none";
                form.reset();
            }
        });

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

            handleNewTaskCallback(
                currentProject?.title || "General", title, 
                description, `${day}-${month}-${year}`, priority, notes, "false"
            );

            modal.style.display = "none";
            form.reset();
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
    };
})();
