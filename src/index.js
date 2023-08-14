import dates from 'date-fns';
import './style.css';
import pubSub from './pubSub';
import domController from './domController';

function Task(propObj) {
  let title = propObj.title;
  let description = propObj.description;
  let dueDate = propObj.dueDate;
  let priority = propObj.priority;

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

  return { setTitle, getTitle, setDescription, getDescription, setDueDate, getDueDate, setPriority, getPriority };
}
function Project(propObj) {
  let title = propObj.title;
  const tasks = [];

  function setTitle(newTitle) {
    title = newTitle;
  }
  function getTitle() {
    return title;
  }
  function addTask(taskObj) {
    tasks.push(taskObj);
  }
  return { tasks, title, setTitle, getTitle, addTask };
}

const todoController = (function () {
  const projects = [];

  pubSub.subscribe('addNewProject', addProject);
  function initialize() {
    if (utility.localStorageHasItems('project')) {
      utility.restoreFromLocalStorage();
    } else {
      console.log('adding default obj');
      addProject(Project({ title: 'Default' }))
    }
  }
  function displayAllProjects() {
    const projectList = [];
    projects.forEach(project => {
      projectList.push(project.getTitle());
    })
    return projectList;
  }
  function addProject(projObj) {
    console.log('adding...', projObj)
    let status = utility.addToLocalStorage(projObj);
    if (status == false) {
      console.log('status is', status);
      return;
    }
    projects.push(Project(projObj));
    pubSub.publish('updateProjectList', projObj);
    console.log('current project list:', projects);

  }
  const utility = (function () {
    let projectName = 'project';

    function addToLocalStorage(obj) {
      if (!localStorage.getItem(projectName)) {
        localStorage.setItem(projectName, JSON.stringify(obj));
        console.log('updated localstorage');
        return;
      }
      let projectList = [];
      const lastStored = projects[projects.length - 1];
      // console.log('laststored: ', lastStored);
      // console.log('current: ', obj);
      if (lastStored && obj.title == lastStored.title) {
        console.log('Cannot have duplicate names');
        pubSub.publish('error-duplicate', 'Cannot have duplicate names')
        return false;
      }
      projectList = projectList.concat(lastStored, obj);
      localStorage.setItem('project', JSON.stringify(projectList));
      console.log('updated localstorage');


    }
    function restoreFromLocalStorage() {
      if (localStorageHasItems('project')) {
        let convertFromLS = JSON.parse(localStorage.getItem('project'));
        let tempArray = [];
        console.log('convertFromLS', convertFromLS)
        if (convertFromLS['title']) {
          tempArray.push(Project(convertFromLS));
          convertFromLS = tempArray;
          console.log(convertFromLS)
          // projects.push(Project(convertFromLS));
        }
        convertFromLS.forEach(obj => {
          projects.push(Project(obj));
          pubSub.publish('updateProjectList', obj);
        });

      }
    }
    function localStorageHasItems(key) {
      return localStorage.getItem(key);
    }
    return { addToLocalStorage, restoreFromLocalStorage, localStorageHasItems };
  })();
  return { displayAllProjects, projects, initialize, addProject, utility };
})();

(() => {
  domController
  todoController.initialize();
  // todoController.addProject(Project({ title: 'test4' }));
  console.log('Projects: ', todoController.displayAllProjects())
  console.log('Projects(ALL):', todoController.projects);
})();