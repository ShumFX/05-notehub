import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { fetchNotes, createNote, deleteNote } from '../../services/noteService';
import type { CreateNotePayload } from '../../types/note';
import NoteList from '../NoteList/NoteList';
import SearchBox from '../SearchBox/SearchBox';
import Pagination from '../Pagination/Pagination';
import Modal from '../Modal/Modal';
import NoteForm from '../NoteForm/NoteForm';
import css from './App.module.css';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const perPage = 12;

  const {
    data: notesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['notes', currentPage, debouncedSearchQuery],
    queryFn: () => fetchNotes({ 
      page: currentPage, 
      perPage,
      search: debouncedSearchQuery 
    }),
    placeholderData: (previousData) => previousData,
  });

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsModalOpen(false);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage + 1); // react-paginate uses 0-based indexing
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCreateNote = (payload: CreateNotePayload) => {
    createNoteMutation.mutate(payload);
  };

  const handleDeleteNote = (id: string) => {
    deleteNoteMutation.mutate(id);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const notes = notesData?.notes || [];
  const totalPages = notesData?.totalPages || 0;
  const hasNotes = notes.length > 0;
  const shouldShowPagination = totalPages > 1;

  if (isLoading) {
    return <div className={css.loading}>Loading...</div>;
  }

  if (isError) {
    return <div className={css.error}>Error loading notes. Please try again.</div>;
  }

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox 
          value={searchQuery}
          onChange={handleSearchChange}
        />
        
        {shouldShowPagination && (
          <Pagination
            pageCount={totalPages}
            currentPage={currentPage - 1} // react-paginate uses 0-based indexing
            onPageChange={handlePageChange}
          />
        )}

        <button 
          className={css.button}
          onClick={handleOpenModal}
        >
          Create note +
        </button>
      </header>

      {hasNotes && (
        <NoteList 
          notes={notes}
          onDelete={handleDeleteNote}
          isDeleting={deleteNoteMutation.isPending}
        />
      )}

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <NoteForm
            onSubmit={handleCreateNote}
            onCancel={handleCloseModal}
            isSubmitting={createNoteMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
};

export default App;