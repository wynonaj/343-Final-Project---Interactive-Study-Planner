// run when page loads
document.addEventListener("DOMContentLoaded", function() {
  // display existing notes from storage
  loadNotes();
  
  // hook up the add note button
  var addNoteBtn = document.getElementById("add-note");
  if (addNoteBtn) {
    addNoteBtn.addEventListener("click", addNewNote);
  }
});

// get notes from storage and show them
function loadNotes() {
  // get the container where notes will be displayed
  var notesContainer = document.getElementById("sticky-notes-container");
  if (!notesContainer) return;
  
  // get saved notes from localStorage
  var notes = JSON.parse(localStorage.getItem("stickyNotes") || "[]");
  
  // show message if no notes exist yet
  if (notes.length === 0) {
    notesContainer.innerHTML = "<p class='empty-notes'>No notes yet. Click 'Add Note' to create one!</p>";
    return;
  }
  
  // clear the container before adding notes
  notesContainer.innerHTML = "";
  
  // create all the saved notes and add them to page
  for (var i = 0; i < notes.length; i++) {
    createNoteElement(notes[i], i);
  }
}

// make a new note element and add it to page
function createNoteElement(note, index) {
  var notesContainer = document.getElementById("sticky-notes-container");
  
  // create the note div
  var noteEl = document.createElement("div");
  noteEl.className = "sticky-note";
  noteEl.style.backgroundColor = note.color || getRandomColor();
  
  // format the date to be readable
  var dateStr = formatDate(note.date);
  
  // html for the note with delete button and content
  noteEl.innerHTML = 
    '<div class="note-tools">' +
      '<span class="note-date">' + dateStr + '</span>' +
      '<button class="delete-note" data-index="' + index + '" type="button">' +
        '<i class="fas fa-times"></i>' +
      '</button>' +
    '</div>' +
    '<div class="note-content" data-index="' + index + '">' +
      note.content +
    '</div>';
  
  // add the note to the container
  notesContainer.appendChild(noteEl);
  
  // add click handler for delete button
  var deleteButton = noteEl.querySelector(".delete-note");
  deleteButton.addEventListener("click", deleteNote);
  
  // add click handler for editing the note
  var contentDiv = noteEl.querySelector(".note-content");
  contentDiv.addEventListener("click", editNote);
}

// add a new sticky note
function addNewNote() {
  // create new note with default text
  var newNote = {
    content: "Click to edit this note...",
    date: new Date().toISOString(),
    color: getRandomColor()
  };
  
  // get existing notes
  var notes = JSON.parse(localStorage.getItem("stickyNotes") || "[]");
  
  // add new note to array
  notes.push(newNote);
  
  // save back to localStorage
  localStorage.setItem("stickyNotes", JSON.stringify(notes));
  
  // get rid of empty message if it's there
  var emptyMessage = document.querySelector(".empty-notes");
  if (emptyMessage) {
    emptyMessage.remove();
  }
  
  // show the new note
  createNoteElement(newNote, notes.length - 1);
}

// delete a note when x is clicked
function deleteNote(e) {
  // get the note index from the data attribute
  var index = e.currentTarget.dataset.index;
  
  // get all notes from storage
  var notes = JSON.parse(localStorage.getItem("stickyNotes") || "[]");
  
  // remove note at this index
  notes.splice(index, 1);
  
  // save the updated notes list
  localStorage.setItem("stickyNotes", JSON.stringify(notes));
  
  // update the display
  loadNotes(); // reload to fix the indices
}

// edit a note when clicked
function editNote(e) {
  // get the index and content element
  var index = e.currentTarget.dataset.index;
  var noteContent = e.currentTarget;
  var currentText = noteContent.textContent.trim();
  
  // create a textarea for editing
  var textarea = document.createElement("textarea");
  textarea.value = currentText;
  textarea.className = "note-edit-textarea";
  
  // replace content with textarea
  noteContent.innerHTML = "";
  noteContent.appendChild(textarea);
  
  // focus so user can type right away
  textarea.focus();
  
  // save when clicking away from textarea
  textarea.addEventListener("blur", function() {
    saveNoteEdit(textarea.value, index);
  });
  
  // save when pressing Enter key
  textarea.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveNoteEdit(textarea.value, index);
    }
  });
}

// save changes to a note
function saveNoteEdit(newContent, index) {
  // get all notes
  var notes = JSON.parse(localStorage.getItem("stickyNotes") || "[]");
  
  // make sure index is valid
  if (index >= notes.length) return;
  
  // update the note content and edit time
  notes[index].content = newContent;
  notes[index].date = new Date().toISOString(); 
  
  // save and refresh display
  localStorage.setItem("stickyNotes", JSON.stringify(notes));
  loadNotes();
}

// make dates look nicer (like "Oct 12")
function formatDate(dateString) {
  var date = new Date(dateString);
  
  // get month name (short version)
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var month = months[date.getMonth()];
  
  // get day number
  var day = date.getDate();
  
  // combine them
  return month + " " + day;
}

// pick a random color for new notes
function getRandomColor() {
  // array of nice pastel colors
  var colors = [
    "#ffadad", // pink/red
    "#ffd6a5", // orange
    "#fdffb6", // yellow
    "#caffbf", // green
    "#9bf6ff", // light blue
    "#a0c4ff", // blue
    "#bdb2ff", // purple
    "#ffc6ff"  // pink
  ];
  
  // pick a random color from the array
  var randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
} 