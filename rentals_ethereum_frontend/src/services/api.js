import axios from 'axios';
import {getToken} from './storage';

export const BASE_URL = 'http://localhost:8082/api/';
// export const BASE_URL = 'http://184.105.189.233:8082/api/';

export const USER_LOGIN = BASE_URL + 'user';
export const FETCH_USER_URL = BASE_URL + 'user';
export const UPDATE_USER_URL = BASE_URL + 'user';

export const FETCH_PROPERTY_LIST = BASE_URL + 'noauth/property/list';

export const CREATE_NEW_PROPERTY = BASE_URL + 'user/property';

export const CREATE_RENTAL_REQUEST = BASE_URL + 'user/rental_request';

export const CREATE_DEPOSIT_RENTAL_REQUEST = BASE_URL + 'user/property/depositSecurity/';
export const CREATE_PAY_RENTAL_REQUEST = BASE_URL + 'user/property/payrent/';

export const FETCH_OWNER_RENTAL_REQUEST = BASE_URL + 'noauth/rental_request/list';
export const FETCH_TENANT_RENTAL_REQUEST = BASE_URL + 'noauth/rental_request/list';

export const APPROVE_RENTAL_REQUEST = BASE_URL + 'user/rental_request';

export const SET_RENT_AMOUNT = BASE_URL + 'user/property/setRent/';

export const GET_CONTRACT_DETAILS = BASE_URL + 'user/property/getContractDetails/';

export const SET_PROPERTY_STATUS_ACTIVE = BASE_URL + 'user/property/changeStatus/activate/'
export const SET_PROPERTY_STATUS_IN_ACTIVE = BASE_URL + 'user/property/changeStatus/deactivate/'


export const api = {
    get: async (url, params) => {
        const token = getToken();
        let config = {
            headers: {
                'x-public-key': `${token}`,
                'Access-Control-Allow-Origin':'*',
            },
            params,
        };
        return axios.get(url, config);
    },
    post: async (url, params) => {
        const token = getToken();
        let config = {
            method: 'post',
            url,
            headers: {
                'x-public-key': `${token}`,
                'Access-Control-Allow-Origin':'*',
            },
            data: params,
        };
        return axios(config);
    },
    patch: async (url, params) => {
        const token = getToken();
        let config = {
            method: 'patch',
            url,
            headers: {
                'x-public-key': `${token}`,
                'Access-Control-Allow-Origin':'*',
            },
            data: params,
        };
        return axios(config);
    },
    endpoints: {},
};
