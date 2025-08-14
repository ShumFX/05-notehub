import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNote } from '../../services/noteService';
import type { Note } from '../../types/note';
import css from './NoteList.module.css';

interface NoteListProps {
  notes: Note[];
}

const NoteList: React.FC<NoteListProps> = ({ notes }) => {
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setDeletingNoteId(null);
    },
    onError: () => {
      setDeletingNoteId(null);
    },
  });

  const handleDelete = (id: string) => {
    setDeletingNoteId(id);
    deleteNoteMutation.mutate(id);
  };

  return (
    <ul className={css.list}>
      {notes.map((note) => {
        const isDeletingThisNote = deletingNoteId === note.id;
        
        return (
          <li key={note.id} className={css.listItem}>
            <h2 className={css.title}>{note.title}</h2>
            <p className={css.content}>{note.content}</p>
            <div className={css.footer}>
              <span className={css.tag}>{note.tag}</span>
              <button 
                className={css.button}
                onClick={() => handleDelete(note.id)}
                disabled={isDeletingThisNote}
              >
                {isDeletingThisNote ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default NoteList;