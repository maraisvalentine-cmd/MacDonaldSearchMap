import axios from "axios";

const nominatimApi = axios.create({
    baseURL: 'https://nominatim.openstreetmap.org/',
    allowAbsoluteUrls: false
});

nominatimApi.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error),
);

nominatimApi.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);


export const search = (config = {}) => nominatimApi.get("search", config);
export const reverse = (config = {}) => nominatimApi.get("reverse", config);
export const lookup = (config = {}) => nominatimApi.get("lookup", config);
export const details = (config = {}) => nominatimApi.get("details", config);

export default nominatimApi;
