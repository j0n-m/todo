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

  return { setTitle, getTitle, setDescription, getDescription, setDueDate, getDueDate, setPriority, getPriority, title };
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
    tasks.push(taskObj);
    pubSub.publish('updateLocalStorage_task', this);
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
    projObj = Project(projObj);
    projects.push(projObj);
    pubSub.publish('updateProjectList', projObj);
    console.log('current project list:', projects);

  }
  const utility = (function () {
    let projectName = 'project';

    pubSub.subscribe('updateLocalStorage_task', updateLocalStorage);
    function updateLocalStorage(obj) {
      // console.log('updating local storage')
      // console.log('this', obj);
      let oldLS = JSON.parse(localStorage.getItem(projectName));
      console.log('oldLS', oldLS)
      oldLS.find(p => {
        if (p.title == obj.title) {
          p.tasks = obj.tasks;
        }
      })
      console.log('edited oldLS', oldLS);
      localStorage.setItem(projectName, JSON.stringify(oldLS));
      pubSub.publish('newTask', projects);


      // localStorage.setItem(projectName, JSON.stringify(Project(obj)));
    }
    function addToLocalStorage(obj) {
      if (!localStorage.getItem(projectName)) {
        let tempArray = [];
        tempArray.push(Project(obj));
        localStorage.setItem(projectName, JSON.stringify(tempArray));
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
          // projects.push(Object.assign(Project({}), obj));
          let tasksArr = [];
          obj.tasks.forEach(task => {
            task = Task(task);
            tasksArr.push(task);
          })
          let convertedProject = Project(obj);
          convertedProject.tasks = tasksArr;
          // convertedProject.tasks.forEach(task => {
          //   task = Object.assign(Task({}), task);
          // });
          console.log('convertedProj', convertedProject);
          projects.push(convertedProject);
          pubSub.publish('updateProjectList', convertedProject);
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
  todoController.projects[0].addTask({ title: 'dishes' })
})();