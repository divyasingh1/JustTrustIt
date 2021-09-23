import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {api, FETCH_TENANT_RENTAL_REQUEST} from "../services/api";


export const fetchTenantRentalRequests = createAsyncThunk(FETCH_TENANT_RENTAL_REQUEST, async (params, {dispatch}) => {
    dispatch(toggleLoading());

    const response = await api.get(FETCH_TENANT_RENTAL_REQUEST, params);
    return response.data;
});


const tenantRentalRequestSlice = createSlice({
    name: 'tenantRentalRequest',
    initialState: {
        loading: false,
        tenantRentalRequests: null,
    },
    reducers: {
        toggleLoading: state => {
            state.loading = !state.loading;
        }
    },
    extraReducers: {


        [fetchTenantRentalRequests.fulfilled]: (state, action) => {
            state.loading = false;
            state.tenantRentalRequests = action.payload?.data;
        }
    }
});

export const {toggleLoading} = tenantRentalRequestSlice.actions;
export default tenantRentalRequestSlice.reducer;
