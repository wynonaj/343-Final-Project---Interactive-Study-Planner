// wait for page to load
document.addEventListener("DOMContentLoaded", function() {
  // get the task box element where we'll display tasks
  var taskBox = document.getElementById("home-task-list");
  if (!taskBox) return; // exit if not found
  
  // get tasks from localStorage - convert from string to object
  var tasks = JSON.parse(localStorage.getItem("items") || "[]");
  
  // show message if no tasks exist yet
  if (tasks.length === 0) {
    taskBox.innerHTML = "<p>No tasks yet.</p>";
    return;
  }
  
  // show each task in a simple preview card on the home page
  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];
    
    // create a new div for this task
    var div = document.createElement("div");
    div.className = "home-task-card";
    
    // fill the div with task info
    div.innerHTML = 
      "<strong>" + task.name + "</strong><br>" +
      "<small>Due: " + task.due + "</small>";
      
    // add the div to the page
    taskBox.appendChild(div);
  }
}); 