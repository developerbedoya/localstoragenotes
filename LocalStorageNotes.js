// Load triggers
$(document).ready(function() {
	// Enable Bootstrap Tooltips for buttons
	$('button').tooltip('enable');
	
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
	var notesHtml = '				<div class="row">';
					
	for (var i = 0; i < pageTempStorage.notes.length; i++) {
		notesHtml += '					<div class="col-md-3">';
		notesHtml += noteToHtml(pageTempStorage.notes[i].id);
		notesHtml += '					</div>';
	}
	
	notesHtml += 	'				</div>';
	
	$('#notesPanel').html(notesHtml);
	
	updateNoteHandlers();
}

function noteToHtml(id) {
	var note = getNote(id);
	
	var htmlNote = '';
	if (note != null) {
		htmlNote = 	'						<div class="panel panel-default">' + 
					'							<div class="panel-heading">' + 
					'								<h3 class="panel-title">' + 
					'									' + note.title + 
					'									<div class="btn-group pull-right">' + 
					'										<button type="button" class="btn btn-sm btn-default cmd-edit" data-id="' + note.id + '" data-toggle="tooltip" title="Edit">' + 
					'											<span class="glyphicon glyphicon-pencil"></span>' + 
					'										</button>' + 
					'										<button type="button" class="btn btn-sm btn-default cmd-delete" data-id="' + note.id + '" data-toggle="tooltip" title="Delete">' + 
					'											<span class="glyphicon glyphicon-remove"></span>' + 
					'										</button>' + 
					'									</div>' + 
					'								</h3>' + 
					'								<div class="clearfix"></div>' + 
					'							</div>' + 
					'							<div class="panel-body">' + 
					'								<p>' + note.content + '</p>' + 
					'							</div>' + 
					'						</div>';
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

// Test function
function test() {
	pageTempStorage = { 
		idCounter: 5,
		notes: [
			{id: 1, title: 'Sample note 1', content: 'A versão mais recente do Android (Lemon Meringue Pie?) está a caminho, trazendo consigo um visual totalmente novo para o Google em geral.'},
			{id: 2, title: 'Sample note 2', content: 'Smartphones com iOS e Android podem ser bloqueados à distância caso sejam roubados; no entanto, este recurso não é ativado por padrão. Isso vai mudar '},
			{id: 3, title: 'Sample note 3', content: 'Certos usuários do Google Imagens viram, esta manhã, alguns resultados normais seguidos de uma mesma imagem, repetida várias vezes, de um acidente de transito'},
			{id: 4, title: 'Sample note 4', content: 'Os aviões nos dão cada vez menos espaço para as pernas, e a situação piora quando o passageiro da frente resolve reclinar o assento.'},
			{id: 5, title: 'Sample note 5', content: 'Aleluia! Oito meses depois de liberar streaming gratuito no iOS e Android, o Spotify agora permite que usuários do Windows Phone escutem suas músicas'}
		]
	};
	
	updateNotesPanel();
}
