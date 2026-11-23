import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Library = 'algorithms' | 'design-patterns' | 'data-structures';

interface CatalogState {
  activeLibrary: Library;
}

const initialState: CatalogState = {
  activeLibrary: 'algorithms',
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    librarySelected(state, action: PayloadAction<Library>) {
      state.activeLibrary = action.payload;
    },
  },
});

export const { librarySelected } = catalogSlice.actions;
export const catalogReducer = catalogSlice.reducer;
