import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore();
  //如果用户已认证但试图访问登录或注册页，则重定向到之前的页面或主页
  if (
    authStore.isAuthenticated &&
    (to.path === "/login" || to.path === "/register")
  ) {
    const redirect =
      typeof to.query.redirect === "string" ? to.query.redirect : undefined;
    //确保重定向路径合法且不指向登录或注册页
    const isValidRedirect =
      typeof redirect === "string" &&
      redirect.startsWith("/") &&
      redirect !== "/login" &&
      redirect !== "/register";
    const target = isValidRedirect
      ? redirect
      : from.fullPath !== "/login" && from.fullPath !== "/register"
        ? from.fullPath
        : "/";
    next(target);
    return;
  }
  //如果目标路由需要认证但用户未认证，则重定向到登录页，并携带原目标路径以便登录后重定向回去
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
    return;
  } else {
    next();
  }
}
