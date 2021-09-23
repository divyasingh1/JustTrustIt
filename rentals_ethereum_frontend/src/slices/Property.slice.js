import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {api,FETCH_PROPERTY_LIST} from "../services/api";

export const fetchProperty = createAsyncThunk(
    FETCH_PROPERTY_LIST,
    async (params, {dispatch}) => {
        dispatch(toggleLoading());
        const response = await api.get(FETCH_PROPERTY_LIST,params);
        return response.data;
    },
);

export const propertySlice = createSlice({
    name: 'properties',
    initialState: {
        properties: null,
        loading: false,
    },
    reducers: {
        setProperties: (state, action) => {
            state.properties = action.payload;
        },
        toggleLoading: state => {
            state.loading = !state.loading;
        },
    },
    extraReducers: {
        // Add reducers for additional action types here, and handle loading state as needed
        [fetchProperty.fulfilled]: (state, action) => {
            state.properties = action.payload?.data;
            state.loading = false;
        },
        [fetchProperty.rejected]: (state, action) => {
            state.properties = action.payload?.data;
            state.loading = false;
        },
    },
});

// Action creators are generated for each case reducer function
export const {setProperties, toggleLoading} = propertySlice.actions;

export default propertySlice.reducer;
