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

  return { setTitle, getTitle, setDescription, getDescription, setDueDate, getDueDate, setPriority, getPriority, title, description, dueDate, priority };
}
function Project(propObj) {
  let title = propObj.title;
  let tasks = [];

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
  return { tasks, title, setTitle, getTitle, addTask };
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
    projects.forEach(project => {
      projectList.push(project.getTitle());
    })
    return projectList;
  }
  function validateProject(projObj) {
    console.log('before pushing project', projects);
    projObj = Project(projObj);
    let status = utility.hasDuplicateTitle(projects, projObj);
    if (status) {
      console.log('Cannot have duplicate names');
      pubSub.publish('error-duplicate', 'Cannot have duplicate names')
      return;
    }
    addProject(projObj);
    utility.addToLocalStorage();
  }
  function addProject(projObj) {
    console.log('adding...', projObj)
    projects.push(projObj);
    pubSub.publish('addToProjectList', projObj);
    if (projects.length == 1) {
      let projectIndex = 0;
      pubSub.publish('loadHomePage', projectIndex);
    }

    console.log('Updated Full List', projects);
  }
  const utility = (function () {
    let projectName = 'project';

    pubSub.subscribe('editProjectTask', editProjectTask);

    function editProjectTask() {
      addToLocalStorage();
      pubSub.publish('overwriteProjectListing', projects);
      pubSub.publish('newTask')
    }

    function addToLocalStorage() {
      let tempArray = [];
      localStorage.clear();

      for (let i = 0; i < projects.length; i++) {
        tempArray.push(projects[i]);
      }
      localStorage.setItem(projectName, JSON.stringify(tempArray));
    }

    function getLastStoredLS() {
      let parsedObj = JSON.parse(localStorage.getItem(projectName));
      let parsedArrayLastObj = parsedObj.length - 1;

      return parsedObj[parsedArrayLastObj];
    }
    function hasDuplicateTitle(sourceList, obj) {
      let status;
      sourceList.forEach(project => {
        console.log('project title:', project.title);
        console.log('obj title:', obj.title);
        if (project.title == obj.title) {
          status = true;
        }
      })
      return status;
    }
    function restoreFromLocalStorage() {
      if (localStorageHasItems('project')) {
        //an array with objects [no methods]
        console.log('here')
        let limitedProjObj = JSON.parse(localStorage.getItem('project'));
        let taskArray = [];
        // let restoredProjObj = [];
        //restore the methods for Project and Task objs
        limitedProjObj.forEach(project => {
          for (let i = 0; i < project.tasks.length; i++) {
            taskArray.push(Task(project.tasks[i]))
          }
          console.log('taskarr', taskArray)
          let newProj = Project(project); //restore Project object methods
          if (project.tasks) {
            newProj.tasks = taskArray;
          }
          // restoredProjObj.push(newProj); //add the restored object to array
          addProject(newProj) //add the restored object to array
          console.log('restoredObj', newProj);
          taskArray = [];
        })

      }
    }
    function localStorageHasItems(key) {
      return localStorage.getItem(key);
    }
    return { addToLocalStorage, restoreFromLocalStorage, localStorageHasItems, hasDuplicateTitle };
  })();
  return { displayAllProjects, projects, initialize, utility, validateProject };
})();

(() => {
  todoController.initialize();
  // domController.changeMainContent(todoController.projects[0].getTitle());
  // todoController.projects[0].addTask({ title: 'Car wash' });
  // todoController.projects[1].addTask({ title: 'Eat food' });
  console.log('-------------------------------------');
  console.log('Projects: ', todoController.displayAllProjects())
  console.log('Projects(ALL):', todoController.projects);
})();