import { configureStore } from '@reduxjs/toolkit';
import galleryReducer from '../features/gallery/gallerySlice';
import treeReducer from '../features/tree/treeSlice';

export const store = configureStore({
    reducer: {
        gallery: galleryReducer,
        tree: treeReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
