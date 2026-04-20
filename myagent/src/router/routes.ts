import type { RouteRecordRaw } from "vue-router";
import Home from "@/views/Home.vue";
import UserCenter from "@/views/UserCenter.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import TextModel from "@/views/TextModel.vue";
import AudioModel from "@/views/AudioModel.vue";
import ImageModel from "@/views/ImageModel.vue";
import MultimodalTask from "@/views/MultimodalTask.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresAuth: true },
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
    meta: { requiresAuth: true },
  },
  {
    path: "/audio-models",
    name: "AudioModel",
    component: AudioModel,
    meta: { requiresAuth: true },
  },
  {
    path: "/image-models",
    name: "ImageModel",
    component: ImageModel,
    meta: { requiresAuth: true },
  },
  {
    path: "/multimodal-models",
    name: "MultimodalTask",
    component: MultimodalTask,
    meta: { requiresAuth: true },
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
];

export default routes;
