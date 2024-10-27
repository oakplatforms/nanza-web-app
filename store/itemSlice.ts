// store/itemSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ItemState {
  items: any[];
}

const initialState: ItemState = {
  items: [],
};

export const itemSlice = createSlice({
  name: 'item',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
    },
  },
});

export const { setItems } = itemSlice.actions;
export default itemSlice.reducer;
