import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PhotoItem, GalleryState } from './types';

const initialState: GalleryState = {
    photos: [],
    filters: [],
};

const gallerySlice = createSlice({
    name: 'gallery',
    initialState,
    reducers: {
        setPhotos: (state, action: PayloadAction<PhotoItem[]>) => {
            state.photos = action.payload;
        },
        addPhoto: (state, action: PayloadAction<PhotoItem>) => {
            state.photos.push(action.payload);
        },
        updatePhoto: (state, action: PayloadAction<PhotoItem>) => {
            const index = state.photos.findIndex((photo) => photo.id === action.payload.id);
            if (index !== -1) {
                state.photos[index] = action.payload;
            }
        },
        deletePhoto: (state, action: PayloadAction<number>) => {
            state.photos = state.photos.filter((photo) => photo.id !== action.payload);
        },
    },
});

export const { setPhotos, addPhoto, updatePhoto, deletePhoto } = gallerySlice.actions;
export default gallerySlice.reducer;
