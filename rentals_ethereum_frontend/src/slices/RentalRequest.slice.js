import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {api, FETCH_OWNER_RENTAL_REQUEST} from "../services/api";

export const fetchOwnerRentalRequests = createAsyncThunk(FETCH_OWNER_RENTAL_REQUEST, async (params, {dispatch}) => {
    dispatch(toggleLoading());

    const response = await api.get(FETCH_OWNER_RENTAL_REQUEST, params);
    return response.data;
});



const rentalRequestSlice = createSlice({
    name: 'rentalRequest',
    initialState: {
        loading: false,
        ownerRentalRequests: null,
    },
    reducers: {
        toggleLoading: state => {
            state.loading = !state.loading;
        }
    },
    extraReducers: {

        [fetchOwnerRentalRequests.fulfilled]: (state, action) => {
            state.loading = false;
            state.ownerRentalRequests = action.payload?.data;
        },
    }
});

export const {toggleLoading} = rentalRequestSlice.actions;
export default rentalRequestSlice.reducer;
