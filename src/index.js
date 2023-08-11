import dates from 'date-fns';
import './style.css';

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
  return { tasks, title, setTitle, getTitle };
}

const todoController = (function () {
  const projects = [];

  initialize();
  function initialize() {
    // if (localStorage.getItem('projects')) {
    //   projects.push(JSON.parse(localStorage.getItem('projects')));
    // }
    if (!projects.length) {
      let dproject = Project({ title: 'Default' });
      projects.push(dproject);
      console.log(`Created default project to array`);
    }
  }
  function getAllProjects() {
    return projects.forEach(project => console.log(project.getTitle()));
  }
  function addProject() {

  }



  return { getAllProjects };
})();

console.log(todoController.getAllProjects());
console.log(localStorage.getItem('projects'));