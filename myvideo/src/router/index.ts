import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import HuggingFaceDemo from "@/views/HuggingFaceDemo.vue";
import UserCenter from "@/views/UserCenter.vue";
import Login from "@/views/Login.vue";
import Profile from "@/views/Profile.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/hugging-face",
      name: "hugging-face",
      component: HuggingFaceDemo,
    },
    {
      path: "/user-center",
      name: "user-center",
      component: UserCenter,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/profile",
      name: "profile",
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
