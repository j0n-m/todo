const pubSub = (function eventHandler() {
  const events = {};
  function subscribe(eventName, func) {
    if (!events[eventName]) {
      events[eventName] = [];
    }
    events[eventName].push(func);
  }
  function publish(eventName, paramData) {
    if (events[eventName]) {
      events[eventName].forEach((e) => {
        e(paramData);
      });
    }
  }
  return { subscribe, publish };
}());

export default pubSub;
