// wait for everything to load first
document.addEventListener("DOMContentLoaded", function() {
  loadTasks();
  setupEvents();
  setupButtons();
});

// get the form and task list
var form = document.getElementById("task-form");
var taskList = document.getElementById("task-list");

// add the buttons for import/export
function setupButtons() {
  // check if buttons exist
  if (!document.querySelector('.action-buttons')) {
    var actionSection = document.createElement('div');
    actionSection.className = 'action-buttons';
    actionSection.innerHTML = 
      '<button id="export-tasks" class="btn-action"><i class="fas fa-download"></i> Export Tasks</button>' +
      '<button id="import-tasks" class="btn-action"><i class="fas fa-upload"></i> Import Tasks</button>' +
      '<button id="clear-tasks" class="btn-action"><i class="fas fa-trash"></i> Clear All Tasks</button>' +
      '<input type="file" id="import-file" accept=".json" style="display: none;">';
    
    taskList.after(actionSection);

    // hook up buttons when clicked
    document.getElementById('export-tasks').addEventListener('click', exportTasks);
    document.getElementById('import-tasks').addEventListener('click', function() {
      document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importTasks);
    document.getElementById('clear-tasks').addEventListener('click', confirmClearTasks);
  }
}

// save tasks to a file
function exportTasks() {
  var tasks = JSON.parse(localStorage.getItem("items") || "[]");
  if (tasks.length === 0) {
    alert("No tasks to export.");
    return;
  }

  // make the file - JSON.stringify with arguments for pretty printing
  var blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  
  // create a link and click it to download
  var a = document.createElement('a');
  a.href = url;
  a.download = "tasks-backup.json";
  document.body.appendChild(a);
  a.click();
  
  // cleanup after download starts
  setTimeout(function() {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// load tasks from a file
function importTasks(e) {
  var file = e.target.files[0];
  if (!file) return;
  
  var reader = new FileReader();
  reader.onload = function(event) {
    try {
      // parse the file contents
      var importedTasks = JSON.parse(event.target.result);
      
      // validate that it's a tasks array
      if (!Array.isArray(importedTasks)) {
        throw new Error("Invalid format: Not a valid tasks file");
      }
      
      // ask before overwriting existing tasks
      var existingTasks = JSON.parse(localStorage.getItem("items") || "[]");
      if (existingTasks.length > 0) {
        if (confirm("You have " + existingTasks.length + " existing tasks. Replace them with " + importedTasks.length + " imported tasks?")) {
          localStorage.setItem("items", JSON.stringify(importedTasks));
          loadTasks();
          alert("Tasks imported successfully!");
        }
      } else {
        localStorage.setItem("items", JSON.stringify(importedTasks));
        loadTasks();
        alert("Tasks imported successfully!");
      }
    } catch (error) {
      alert("Error importing tasks: " + error.message);
    }
    
    // reset the file input
    e.target.value = '';
  };
  
  reader.readAsText(file);
}

// ask before clearing all tasks
function confirmClearTasks() {
  var tasks = JSON.parse(localStorage.getItem("items") || "[]");
  if (tasks.length === 0) {
    alert("No tasks to clear.");
    return;
  }
  
  if (confirm("Are you sure you want to delete all " + tasks.length + " tasks? You can't undo this!")) {
    localStorage.removeItem("items");
    loadTasks();
    alert("All tasks have been cleared.");
  }
}

// hook up all the event listeners
function setupEvents() {
  // form submit
  form.addEventListener("submit", addTask);
  
  // delegate click events for task card buttons 
  taskList.addEventListener("click", function(e) {
    // for delete buttons
    if (e.target.classList.contains("delete-btn") || e.target.closest(".delete-btn")) {
      var taskCard = e.target.closest(".task-card");
      var index = parseInt(taskCard.dataset.index);
      deleteTask(index);
    }
    
    // for checkboxes
    if (e.target.classList.contains("task-complete")) {
      var index = parseInt(e.target.dataset.index);
      toggleTaskCompletion(index);
    }
  });
}

// delete a task from the list
function deleteTask(index) {
  var tasks = JSON.parse(localStorage.getItem("items") || "[]");
  tasks.splice(index, 1); // remove task at index
  localStorage.setItem("items", JSON.stringify(tasks));
  loadTasks();
}

// toggle task done/not done
function toggleTaskCompletion(index) {
  var tasks = JSON.parse(localStorage.getItem("items") || "[]");
  
  // flip between true/false
  if (tasks[index].completed) {
    tasks[index].completed = false;
  } else {
    tasks[index].completed = true;
  }
  
  localStorage.setItem("items", JSON.stringify(tasks));
  loadTasks();
  
  // show message when task marked complete
  if (tasks[index].completed) {
    var viewProgress = confirm("Task marked as complete! Want to view your progress?");
    if (viewProgress) {
      window.location.href = "progress.html";
    }
  }
}

// show all the tasks on the page
function loadTasks() {
  var tasks = JSON.parse(localStorage.getItem("items") || "[]");
  taskList.innerHTML = "";

  // show message if no tasks
  if (tasks.length === 0) {
    taskList.innerHTML = "<p>No tasks yet. Add some tasks to get started!</p>";
    return;
  }

  // loop through and show each task
  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];
    var div = document.createElement("div");
    div.className = "task-card";
    div.dataset.index = i;
    
    // add priority class
    if (task.priority) {
      div.classList.add("priority-" + task.priority);
    }
    
    // mark completed tasks
    if (task.completed) {
      div.classList.add("completed-task");
    }
    
    // make the checkbox checked if completed
    var isChecked = task.completed ? "checked" : "";
    
    // format the time
    var estimatedTime = task.estimatedTime 
      ? task.estimatedTime + " minutes" 
      : "Not specified";
    
    // build priority badge if needed
    var priorityBadge = task.priority 
      ? '<span class="priority-badge ' + task.priority + '">' + task.priority + '</span>' 
      : '';
      
    // build category info if provided
    var categoryInfo = task.category 
      ? '<p><strong>Category:</strong> ' + task.category + '</p>' 
      : '';
      
    // build recurring task indicator if needed
    var recurringInfo = task.recurring 
      ? '<p><i class="fas fa-sync-alt"></i> Recurring task</p>' 
      : '';
      
    // build notes section if provided
    var notesInfo = task.notes 
      ? '<p><strong>Notes:</strong> ' + task.notes + '</p>' 
      : '';
    
    // put together the HTML for this task
    div.innerHTML = 
      '<div class="task-header">' +
        '<input type="checkbox" class="task-complete" data-index="' + i + '" ' + isChecked + '>' +
        '<h3>' + task.name + '</h3>' +
        priorityBadge + 
      '</div>' +
      '<div class="task-details">' +
        categoryInfo +
        '<p><strong>Due:</strong> ' + task.due + '</p>' +
        '<p><strong>Estimated time:</strong> ' + estimatedTime + '</p>' +
        recurringInfo +
        notesInfo +
      '</div>' +
      '<div class="task-actions">' +
        '<button class="edit-task" data-index="' + i + '"><i class="fas fa-edit"></i> Edit</button>' +
        '<button class="delete-btn" data-index="' + i + '"><i class="fas fa-trash"></i> Delete</button>' +
      '</div>';
      
    taskList.appendChild(div);
  }
}

// add a new task from the form
function addTask(e) {
  e.preventDefault(); // stop form from submitting normally
  
  // get values from form
  var name = document.getElementById("task").value.trim();
  var category = document.getElementById("category").value;
  var due = document.getElementById("due").value;
  
  // find which priority is checked
  var priorityRadios = document.getElementsByName("priority");
  var priority = "";
  for (var i = 0; i < priorityRadios.length; i++) {
    if (priorityRadios[i].checked) {
      priority = priorityRadios[i].value;
      break;
    }
  }
  
  // get rest of form values
  var recurring = document.getElementById("recurring").checked;
  var estimatedTime = document.getElementById("estimated-time").value;
  var notes = document.getElementById("notes").value.trim();

  // check required fields
  if (!name || !due || !category) {
    return;
  }

  // add to task list
  var tasks = JSON.parse(localStorage.getItem("items") || "[]");
  var newTask = { 
    name: name, 
    category: category, 
    due: due, 
    priority: priority, 
    recurring: recurring, 
    estimatedTime: estimatedTime,
    notes: notes,
    completed: false // not done yet
  };
  tasks.push(newTask); 
  localStorage.setItem("items", JSON.stringify(tasks));

  form.reset(); // clear the form
  loadTasks(); // refresh the list
} 