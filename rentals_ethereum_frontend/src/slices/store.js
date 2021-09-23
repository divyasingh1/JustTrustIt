import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../slices/Auth.slice';
import propertyReducer from '../slices/Property.slice';
import rentalRequestReducer from "./RentalRequest.slice";
import tenantRentalRequestReducer from './TenantRentalRequest.slice'


const rootReducer = {
    auth: authReducer,
    properties: propertyReducer,
    rentalRequests : rentalRequestReducer,
    tenantRentalRequest : tenantRentalRequestReducer
};

const store = configureStore({
    reducer: {
        ...rootReducer,
    },
});

export default store;
