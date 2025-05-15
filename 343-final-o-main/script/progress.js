// when page loads, update everything
document.addEventListener("DOMContentLoaded", function() {
  updateStatistics();
  loadCompletedTasks();
});

// calculate and show all the stats
function updateStatistics() {
  var tasks = JSON.parse(localStorage.getItem("items") || "[]");
  
  // count completed vs total tasks
  var completedTasks = [];
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].completed) {
      completedTasks.push(tasks[i]);
    }
  }
  
  var totalTasks = tasks.length;
  var pendingTasks = totalTasks - completedTasks.length;
  
  // figure out completion percentage
  var completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  
  // high priority task stats
  var highPriorityTasks = [];
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].priority === "high") {
      highPriorityTasks.push(tasks[i]);
    }
  }
  
  var highPriorityCompleted = [];
  for (var i = 0; i < highPriorityTasks.length; i++) {
    if (highPriorityTasks[i].completed) {
      highPriorityCompleted.push(highPriorityTasks[i]);
    }
  }
  
  var highPriorityRate = highPriorityTasks.length > 0 ? 
    Math.round((highPriorityCompleted.length / highPriorityTasks.length) * 100) : 0;
  
  // find tasks due soon (within 7 days)
  var today = new Date();
  today.setHours(0, 0, 0, 0); // reset time part to compare just dates
  
  var upcomingTasks = [];
  for (var i = 0; i < tasks.length; i++) {
    var dueDate = new Date(tasks[i].due);
    var diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24)); // days difference
    if (diffDays >= 0 && diffDays <= 7 && !tasks[i].completed) {
      upcomingTasks.push(tasks[i]);
    }
  }
  
  // update all the numbers on the page
  document.getElementById("total-tasks").textContent = totalTasks;
  document.getElementById("completed-tasks").textContent = completedTasks.length;
  document.getElementById("pending-tasks").textContent = pendingTasks;
  document.getElementById("completion-rate").textContent = completionRate + "%";
  document.getElementById("upcoming-tasks").querySelector("span").textContent = upcomingTasks.length;
  document.getElementById("high-priority").querySelector("span").textContent = highPriorityRate + "%";
}

// show list of completed tasks
function loadCompletedTasks() {
  var completedList = document.getElementById("completed-list");
  var tasks = JSON.parse(localStorage.getItem("items") || "[]");
  
  // get just the completed ones
  var completedTasks = [];
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].completed) {
      completedTasks.push(tasks[i]);
    }
  }
  
  // show message if none
  if (completedTasks.length === 0) {
    completedList.innerHTML = "<p class='empty-state'>No completed tasks yet. Keep up the good work!</p>";
    return;
  }
  
  completedList.innerHTML = "";
  
  // show each completed task with checkmark
  for (var i = 0; i < completedTasks.length; i++) {
    var task = completedTasks[i];
    var taskEl = document.createElement("div");
    taskEl.className = "completed-item";
    
    // Create priority text if it exists
    var priorityText = task.priority ? "Priority: " + task.priority : "";
    
    // Build the HTML
    taskEl.innerHTML = 
      '<i class="fas fa-check-circle"></i>' +
      '<div>' +
        '<strong>' + task.name + '</strong>' +
        '<div class="task-meta">' +
          '<span>Category: ' + (task.category || 'N/A') + '</span>' +
          '<span>' + priorityText + '</span>' +
        '</div>' +
      '</div>';
    
    completedList.appendChild(taskEl);
  }
}
