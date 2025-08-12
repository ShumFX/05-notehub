import axios, { AxiosResponse } from 'axios';
import type { Note, CreateNotePayload } from '../types/note';

const BASE_URL = 'https://notehub-public.goit.study/api';
const token = import.meta.env.VITE_NOTEHUB_TOKEN;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
  totalNotes: number;
  currentPage: number;
  perPage: number;
}

export interface CreateNoteResponse {
  note: Note;
}

export interface DeleteNoteResponse {
  note: Note;
}

export const fetchNotes = async (params: FetchNotesParams = {}): Promise<FetchNotesResponse> => {
  const { page = 1, perPage = 12, search } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  });

  if (search && search.trim() !== '') {
    queryParams.append('search', search);
  }

  const response: AxiosResponse<FetchNotesResponse> = await api.get(
    `/notes?${queryParams.toString()}`
  );

  return response.data;
};

export const createNote = async (payload: CreateNotePayload): Promise<Note> => {
  const response: AxiosResponse<CreateNoteResponse> = await api.post('/notes', payload);
  return response.data.note;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const response: AxiosResponse<DeleteNoteResponse> = await api.delete(`/notes/${id}`);
  return response.data.note;
};