import './style.css';
import pubSub from './pubSub';
import domController from './domController';

function Task(propObj) {
  let { title } = propObj;
  let { description } = propObj;
  let { dueDate } = propObj;
  let { priority } = propObj;

  function setTitle(newTitle) {
    title = newTitle;
  }
  function setDescription(newDescription) {
    description = newDescription;
  }
  function setDueDate(newDueDate) {
    dueDate = newDueDate;
  }
  function setPriority(newPriority) {
    priority = newPriority;
  }
  function getTitle() {
    return title;
  }
  function getDescription() {
    return description;
  }
  function getDueDate() {
    return dueDate;
  }
  function getPriority() {
    return priority;
  }

  return {
    setTitle,
    getTitle,
    setDescription,
    getDescription,
    setDueDate,
    getDueDate,
    setPriority,
    getPriority,
    title,
    description,
    dueDate,
    priority,
  };
}
function Project(propObj) {
  let { title } = propObj;
  const tasks = [];

  function setTitle(newTitle) {
    title = newTitle;
  }
  function getTitle() {
    return title;
  }
  function addTask(taskObj) {
    this.tasks.push(Task(taskObj));
    pubSub.publish('editProjectTask');
  }
  return {
    tasks,
    title,
    setTitle,
    getTitle,
    addTask,
  };
}

const todoController = (function () {
  const projects = [];

  pubSub.subscribe('addNewProject', validateProject);

  function initialize() {
    if (utility.localStorageHasItems('project')) {
      console.log('there is shit');
      utility.restoreFromLocalStorage();
      return;
    }
    console.log('adding default obj');
    validateProject({ title: 'Default' });
  }
  function displayAllProjects() {
    const projectList = [];
    projects.forEach((project) => {
      projectList.push(project.getTitle());
    });
    return projectList;
  }

  function validateProject(projObj) {
    console.log('before pushing project', projects);
    projObj = Project(projObj);
    const status = utility.hasDuplicateTitle(projects, projObj);
    if (status) {
      console.log('Cannot have duplicate names');
      pubSub.publish('error-duplicate', 'Cannot have duplicate names');
      return;
    }
    addProject(projObj);
    utility.addToLocalStorage();
  }
  function addProject(projObj) {
    console.log('adding...', projObj);
    projects.push(projObj);
    pubSub.publish('addToProjectList', projObj);
    if (projects.length === 1) {
      const projectIndex = 0;
      pubSub.publish('loadHomePage', projectIndex);
    }

    console.log('Updated Full List', projects);
  }
  const utility = (function () {
    const projectName = 'project';

    pubSub.subscribe('editProjectTask', editProjectTask);

    function editProjectTask() {
      addToLocalStorage();
      pubSub.publish('overwriteProjectListing', projects);
      pubSub.publish('newTask');
    }
    function addToLocalStorage() {
      const tempArray = [];
      localStorage.clear();

      for (let i = 0; i < projects.length; i++) {
        tempArray.push(projects[i]);
      }
      localStorage.setItem(projectName, JSON.stringify(tempArray));
    }
    function hasDuplicateTitle(sourceList, obj) {
      let status;
      sourceList.forEach((project) => {
        console.log('project title:', project.title);
        console.log('obj title:', obj.title);
        if (project.title == obj.title) {
          status = true;
        }
      });
      return status;
    }
    function restoreFromLocalStorage() {
      if (localStorageHasItems('project')) {
        // an array with objects [no methods]
        console.log('here');
        const limitedProjObj = JSON.parse(localStorage.getItem('project'));
        let taskArray = [];
        // let restoredProjObj = [];
        // restore the methods for Project and Task objs
        limitedProjObj.forEach((project) => {
          for (let i = 0; i < project.tasks.length; i++) {
            taskArray.push(Task(project.tasks[i]));
          }
          console.log('taskarr', taskArray);
          const newProj = Project(project); // restore Project object methods
          if (project.tasks) {
            newProj.tasks = taskArray;
          }
          // restoredProjObj.push(newProj); //add the restored object to array
          addProject(newProj); // add the restored object to array
          console.log('restoredObj', newProj);
          taskArray = [];
        });
      }
    }
    function localStorageHasItems(key) {
      return localStorage.getItem(key);
    }
    return {
      addToLocalStorage, restoreFromLocalStorage, localStorageHasItems, hasDuplicateTitle,
    };
  }());
  return {
    displayAllProjects, projects, initialize, utility, validateProject,
  };
}());

(() => {
  domController();
  todoController.initialize();
  console.log('-------------------------------------');
  console.log('Projects: ', todoController.displayAllProjects());
  console.log('Projects(ALL):', todoController.projects);
})();
