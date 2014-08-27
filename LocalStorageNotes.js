// Load triggers
$(document).ready(function() {	
	// New note handler
	$('#btnNewNote').click(function() {
		openNewNoteModal();
	});
	
	// Clear notes handler
	$('#btnClearNotes').click(function() {
		clearAllNotes();
	});
	
	// Try to restore notes
	if (!restoreNotes()) {
		alert('No local storage support, all your notes will be lost');
	} else {
		updateNotesPanel();
	}
});

function updateNoteHandlers() {
	// Edit note handler
	$('.cmd-edit').unbind('click').click(function() {
		var noteId = $(this).data('id');
		openEditNoteModal(noteId);
	});
	
	// Delete note handler
	$('.cmd-delete').unbind('click').click(function() {
		var noteId = $(this).data('id');
		openDeleteNoteModal(noteId);
	});
	
	// Enable Bootstrap Tooltips for buttons
	$('button').tooltip('enable');
}

// Modal functions
function openNewNoteModal() {
	$('#addOrEditDialogOK').unbind('click').click(function() {
		var title = $('#addOrEditNoteTitle').val();
		var content = $('#addOrEditNoteContent').val();
		addNote(title, content);
		
		$('#addOrEditDialog').modal('hide');
		updateNotesPanel();
	});
	
	$('#addOrEditDialogTitle').html('New note');
	$('#addOrEditNoteTitle').val('');
	$('#addOrEditNoteContent').val('');
	
	// Open modal
	$('#addOrEditDialog').modal();
}

function openEditNoteModal(noteId) {
	$('#addOrEditDialogOK').unbind('click').click(function() {
		var title = $('#addOrEditNoteTitle').val();
		var content = $('#addOrEditNoteContent').val();
		updateNote(noteId, title, content);
		
		$('#addOrEditDialog').modal('hide');
		updateNotesPanel();
	});
	
	var note = getNote(noteId);
	$('#addOrEditDialogTitle').html('Edit note');
	$('#addOrEditNoteTitle').val(note.title);
	$('#addOrEditNoteContent').val(note.content);
	
	// Open modal
	$('#addOrEditDialog').modal();
}

function openDeleteNoteModal(noteId) {
	$('#deleteDialogYes').unbind('click').click(function() {
		deleteNote(noteId);
		$('#deleteDialog').modal('hide');
		updateNotesPanel();
	});
	
	// Open modal
	$('#deleteDialog').modal();
}

// html functions
function updateNotesPanel() {
	var notesHtml = '<div class="row">';
					
	for (var i = 0; i < pageTempStorage.notes.length; i++) {
		notesHtml += ['<div class="col-md-3">', noteToHtml(pageTempStorage.notes[i].id), '</div>'].join('\n');
	}
	
	notesHtml += '</div>';
	
	$('#notesPanel').html(notesHtml);
	
	updateNoteHandlers();
}

function noteToHtml(id) {
	var note = getNote(id);
	
	var htmlNote = '';
	if (note != null) {
		htmlNote =  
		htmlNote = String.format(htmlNoteTemplate, note.id, note.title, note.content);
	}
	
	return htmlNote
}

// Note functions
function addNote(title, content) {
	var id = ++pageTempStorage.idCounter;
	pageTempStorage.notes.push({ id: id, title: title, content: content });
	// Return true because note was successfully created
	saveNotes();
	return true;
}

function updateNote(id, title, content) {
	for (var i = 0; i < pageTempStorage.notes.length; i++) {
		if (pageTempStorage.notes[i].id == id) {
			pageTempStorage.notes[i] = { id: id, title: title, content: content };
			// Return true because note was successfully updated
			saveNotes();
			return true;
		}
	}
	// Note not found
	return false;
}

function getNote(id) {
	for (var i = 0; i < pageTempStorage.notes.length; i++) {
		if (pageTempStorage.notes[i].id == id) {
			// Return that note if found
			return pageTempStorage.notes[i];
		}
	}
	// Return null if note not found
	return null;
}

function deleteNote(id) {
	for (var i = 0; i < pageTempStorage.notes.length; i++) {
		if (pageTempStorage.notes[i].id == id) {
			pageTempStorage.notes.splice(i, 1);
			// Return true because note was successfully deleted
			saveNotes();
			return true;
		}
	}
	// Note not found
	return false;
}

function clearAllNotes() {
	pageTempStorage = {
		idCounter: 0,
		notes: []
	};
	
	saveNotes();
	updateNotesPanel();
}

// Storage functions
function saveNotes() {
	if (typeof(Storage) !== 'undefined') {
		localStorage.setItem('LocalStorageNotes', JSON.stringify(pageTempStorage));
		return true;
	}
	
	return false;
}

function restoreNotes() {
	if (typeof(Storage) !== 'undefined') {
		var notes = null;
		try {
			notes = JSON.parse(localStorage.getItem('LocalStorageNotes'));
		}
		// Se não tiver notas, cria as notas iniciais
		catch (err) {}
		
		if (notes == null) {
			notes = {
				idCounter: 0,
				notes: []
			};
		}
		
		pageTempStorage = notes;
		return true;
	}
	
	return false;
}

// Global variable with all the notes
var pageTempStorage = {
	idCounter: 0,
	notes: []
};

// Template for note, {0} => id, {1} => title, {2} => content
var htmlNoteTemplate = [
	'<div class="panel panel-default">', 
	'	<div class="panel-heading">',
	'		<h3 class="panel-title">',
	'			{1}',
	'			<div class="btn-group pull-right">',
	'				<button type="button" class="btn btn-sm btn-default cmd-edit" data-id="{0}" data-toggle="tooltip" title="Edit">',
	'					<span class="glyphicon glyphicon-pencil"></span>',  
	'				</button>', 
	'				<button type="button" class="btn btn-sm btn-default cmd-delete" data-id="{0}" data-toggle="tooltip" title="Delete">', 
	'					<span class="glyphicon glyphicon-remove"></span>', 
	'				</button>', 
	'			</div>', 
	'		</h3>', 
	'		<div class="clearfix"></div>', 
	'	</div>', 
	'	<div class="panel-body">', 
	'		<p>{2}</p>', 
	'	</div>', 
	'</div>'
].join('\n');

// String.format, http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number] 
        : match
      ;
    });
  };
}
