import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:7000/',  // Replace this with your server's base URL
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,  // For authorization
    },
});

export default instance;