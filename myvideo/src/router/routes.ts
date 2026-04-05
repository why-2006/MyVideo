import type { RouteRecordRaw } from "vue-router";
import Home from "@/views/Home.vue";
import UserCenter from "@/views/UserCenter.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import Profile from "@/views/Profile.vue";
import TextModel from "@/views/TextModel.vue";
import AudioModel from "@/views/AudioModel.vue";
import ImageModel from "@/views/ImageModel.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/user-center",
    name: "UserCenter",
    component: UserCenter,
    meta: { requiresAuth: true },
  },
  {
    path: "/text-models",
    name: "TextModel",
    component: TextModel,
  },
  {
    path: "/audio-models",
    name: "AudioModel",
    component: AudioModel,
  },
  {
    path: "/image-models",
    name: "ImageModel",
    component: ImageModel,
  },
  {
    path: "/hugging-face",
    name: "HuggingFace",
    redirect: "/",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: { requiresAuth: false },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
];

export default routes;
