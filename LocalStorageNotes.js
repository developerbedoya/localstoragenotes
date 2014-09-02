// Load triggers
$(document).ready(function() {	
	// Load editor plugin on new and edit modals
	$('#addOrEditNoteContent').ckeditor();

	// New note handler
	$('#btnNewNote').click(function() {
		var newTitle = 'New Note';
		var newContent = '';
		addNote(newTitle, newContent);
		updateNotesPanel();
	});
	
	// Clear notes handler
	$('#btnClearNotes').click(function() {
		clearAllNotes();
	});
	
	// Adjust ckeditor config for avoiding leading and trailing <p>
	CKEDITOR.on( 'instanceCreated', function( event ) {
		var editor = event.editor;
		editor.config.autoParagraph = false;
	});
	
	// Try to restore notes
	if (!restoreNotes()) {
		alert('No local storage support, all your notes will be lost');
	} else {
		updateNotesPanel();
	}

});

function updateEditNoteHandler() {
	// Edit note title handler
	$('.div-title-editable').blur(function() {
		var noteId = $(this).data('id');
		var title = $(this).html();
		
		// Delete \n and \t
		title = title.replace(/\t/g,'').replace(/\n/g,'');
		var content = getNote(noteId).content;
		
		updateNote(noteId, title, content);
		updateNotesPanel();
	});
	$('.div-title-editable').ckeditor();
	
	// Edit note content handler
	$('.div-content-editable').blur(function() {
		var noteId = $(this).data('id');
		var content = $(this).html();
		
		// Delete \n and \t
		content = content.replace(/\t/g,'').replace(/\n/g,'');
		var title = getNote(noteId).title;
		
		updateNote(noteId, title, content);
		updateNotesPanel();
	});
	$('.div-content-editable').ckeditor();
}

function updateNoteHandlers() {
	updateEditNoteHandlers();
	
	// Delete note handler
	$('.cmd-delete').unbind('click').click(function() {
		var noteId = $(this).data('id');
		openDeleteNoteModal(noteId);
	});
	
	// Enable Bootstrap Tooltips for buttons
	$('button').tooltip('enable');
	
}

// Modal functions

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
		// Se nÃ£o tiver notas, cria as notas iniciais
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
	'			<div class="div-title-editable pull-left" contenteditable="true" data-id="{0}">{1}</div>',
	'			<div class="btn-group pull-right">',
	'				<button type="button" class="btn btn-sm btn-default cmd-delete" data-id="{0}" data-toggle="tooltip" title="Delete">', 
	'					<span class="glyphicon glyphicon-remove"></span>', 
	'				</button>', 
	'			</div>', 
	'		</h3>', 
	'		<div class="clearfix"></div>', 
	'	</div>', 
	'	<div class="panel-body div-content-editable" contenteditable="true" data-id="{0}">', 
	'		{2}', 
	'	</div>', 
	'</div>'
].join('\n');

// String.format, http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.format) {
	String.format = function(format) {
		var args = Array.prototype.slice.call(arguments, 1);
		return format.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}
