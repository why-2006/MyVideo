import type { RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import HuggingFaceDemo from '@/views/HuggingFaceDemo.vue';
import UserCenter from '@/views/UserCenter.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Profile from '@/views/Profile.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/hugging-face',
    name: 'HuggingFaceDemo',
    component: HuggingFaceDemo,
  },
  {
    path: '/user-center',
    name: 'UserCenter',
    component: UserCenter,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
];

export default routes;
