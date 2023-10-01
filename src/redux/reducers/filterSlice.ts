import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { Filter } from '../../scenes/approved_subjects/IFilter'
import { FiltersEnum } from '../../scenes/approved_subjects/FiltersEnum'

// Define a type for the slice state
interface FilterState {
  actualFilter: Filter
}

// Define the initial state using that type
const initialState: FilterState = {
  actualFilter: { title: '', type: FiltersEnum.None, value: '' } as Filter
}

export const filterSlice = createSlice({
  name: 'filter',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setFilter: (state, action: PayloadAction<Filter>) => {
      state.actualFilter = action.payload
    },
    setFilterToCorrelative: (state, action: PayloadAction<string>) => {
      state.actualFilter = { title: '', type: FiltersEnum.Correlative, value: action.payload } as Filter
    },
    setFilterToYear: (state, action: PayloadAction<string>) => {
      state.actualFilter = { title: '', type: FiltersEnum.Year, value: action.payload } as Filter
    },
    setFilterToName: (state, action: PayloadAction<string>) => {
      state.actualFilter = { title: '', type: FiltersEnum.Name, value: action.payload } as Filter
    },
    setFilterToNone: (state) => {
      state.actualFilter = { title: '', type: FiltersEnum.None, value: '' } as Filter
    }
  }
})

export const { setFilter, setFilterToCorrelative, setFilterToYear, setFilterToName, setFilterToNone } = filterSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectActualFilter = (state: RootState) => state.filter.actualFilter

export default filterSlice.reducer