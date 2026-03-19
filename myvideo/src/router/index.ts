import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { authGuard } from './guards';

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 滚动行为
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// 路由守卫
router.beforeEach(authGuard);

export default router;
