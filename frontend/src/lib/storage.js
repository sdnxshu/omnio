import { v4 as uuidv4 } from 'uuid';

const KEYS = {
  notes: 'notesApp_notes',
  folders: 'notesApp_folders',
  tags: 'notesApp_tags',
};

function getAll(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveAll(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Notes ---
export function getNotes() {
  return getAll(KEYS.notes);
}

export function getNote(id) {
  return getNotes().find((n) => n.id === id) || null;
}

export function createNote(folderId = null, parentNoteId = null) {
  const notes = getNotes();
  const note = {
    id: uuidv4(),
    title: '',
    content: null,
    folderId,
    parentNoteId,
    tags: [],
    coverImage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  notes.unshift(note);
  saveAll(KEYS.notes, notes);
  return note;
}

export function updateNote(id, updates) {
  const notes = getNotes();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  notes[idx] = { ...notes[idx], ...updates, updatedAt: new Date().toISOString() };
  saveAll(KEYS.notes, notes);
  return notes[idx];
}

export function deleteNote(id) {
  // Recursively collect all descendant note ids
  const allNotes = getNotes();
  const idsToDelete = [id];
  function collectChildren(parentId) {
    allNotes.forEach((n) => {
      if (n.parentNoteId === parentId) {
        idsToDelete.push(n.id);
        collectChildren(n.id);
      }
    });
  }
  collectChildren(id);
  const remaining = allNotes.filter((n) => !idsToDelete.includes(n.id));
  saveAll(KEYS.notes, remaining);
}

export function getChildNotes(parentNoteId) {
  return getNotes().filter((n) => n.parentNoteId === parentNoteId);
}

// --- Folders ---
export function getFolders() {
  return getAll(KEYS.folders);
}

export function getRootFolders() {
  return getFolders().filter((f) => !f.parentId);
}

export function getChildFolders(parentId) {
  return getFolders().filter((f) => f.parentId === parentId);
}

function getAllDescendantFolderIds(folderId) {
  const folders = getFolders();
  const ids = [];
  function collect(parentId) {
    folders.forEach((f) => {
      if (f.parentId === parentId) {
        ids.push(f.id);
        collect(f.id);
      }
    });
  }
  collect(folderId);
  return ids;
}

export function createFolder(name = 'New Folder', parentId = null) {
  const folders = getFolders();
  const folder = {
    id: uuidv4(),
    name,
    parentId,
    createdAt: new Date().toISOString(),
  };
  folders.push(folder);
  saveAll(KEYS.folders, folders);
  return folder;
}

export function updateFolder(id, updates) {
  const folders = getFolders();
  const idx = folders.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  folders[idx] = { ...folders[idx], ...updates };
  saveAll(KEYS.folders, folders);
  return folders[idx];
}

export function deleteFolder(id) {
  const descendantIds = getAllDescendantFolderIds(id);
  const allIdsToDelete = [id, ...descendantIds];
  const folders = getFolders().filter((f) => !allIdsToDelete.includes(f.id));
  saveAll(KEYS.folders, folders);
  // Move notes from deleted folders to unorganized
  const notes = getNotes().map((n) =>
    allIdsToDelete.includes(n.folderId) ? { ...n, folderId: null } : n
  );
  saveAll(KEYS.notes, notes);
}

// --- Tags ---
export function getTags() {
  return getAll(KEYS.tags);
}

export function createTag(name, color = 'gray') {
  const tags = getTags();
  const tag = {
    id: uuidv4(),
    name,
    color,
  };
  tags.push(tag);
  saveAll(KEYS.tags, tags);
  return tag;
}

export function deleteTag(id) {
  const tags = getTags().filter((t) => t.id !== id);
  saveAll(KEYS.tags, tags);
  // Remove tag from all notes
  const notes = getNotes().map((n) => ({
    ...n,
    tags: n.tags.filter((t) => t !== id),
  }));
  saveAll(KEYS.notes, notes);
}

export function updateTag(id, updates) {
  const tags = getTags();
  const idx = tags.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tags[idx] = { ...tags[idx], ...updates };
  saveAll(KEYS.tags, tags);
  return tags[idx];
}

export function duplicateNote(id) {
  const notes = getNotes();
  const original = notes.find((n) => n.id === id);
  if (!original) return null;
  const copy = {
    id: uuidv4(),
    title: (original.title || 'Untitled') + ' (copy)',
    content: original.content ? JSON.parse(JSON.stringify(original.content)) : null,
    folderId: original.folderId,
    parentNoteId: original.parentNoteId,
    tags: [...(original.tags || [])],
    coverImage: original.coverImage,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  notes.unshift(copy);
  saveAll(KEYS.notes, notes);
  return copy;
}

export function moveNote(noteId, targetFolderId, targetParentNoteId = null) {
  const notes = getNotes();
  const idx = notes.findIndex((n) => n.id === noteId);
  if (idx === -1) return null;
  notes[idx] = {
    ...notes[idx],
    folderId: targetFolderId,
    parentNoteId: targetParentNoteId,
    updatedAt: new Date().toISOString(),
  };
  saveAll(KEYS.notes, notes);
  return notes[idx];
}

// Search notes
export function searchNotes(query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return getNotes().filter((n) => {
    const titleMatch = (n.title || '').toLowerCase().includes(q);
    const contentText = extractTextFromContent(n.content);
    const contentMatch = contentText.toLowerCase().includes(q);
    return titleMatch || contentMatch;
  });
}

function extractTextFromContent(content) {
  if (!content) return '';
  if (typeof content === 'string') return content;
  let text = '';
  function walk(node) {
    if (node.text) text += node.text + ' ';
    if (node.content) node.content.forEach(walk);
  }
  walk(content);
  return text;
}
