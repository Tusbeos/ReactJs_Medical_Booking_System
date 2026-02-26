import axios from '../axios';

interface ILoginBody {
    username: string;
    password: string;
}

const adminService = {

    /**
     * Đăng nhập hệ thống
     */
    login(loginBody: ILoginBody) {
        return axios.post(`/admin/login`, loginBody)
    },

};

export default adminService;