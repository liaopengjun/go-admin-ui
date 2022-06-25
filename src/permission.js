import router from './router'
import store from './store'
// import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

// 导航守卫 - 路由拦截
router.beforeEach(async(to, from, next) => {
  // 开始进度条
  NProgress.start()

  // 设置页面标题
  document.title = getPageTitle(to.meta.title)

  // 用户是否登录
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      // 登录成功跳转主页
      next({ path: '/' })
      NProgress.done()
    } else {
      // 判断用户是否通过getInfo获取了自己的权限角色
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // 注意：角色必须是对象数组！ 如：['admin'] 或 ,['developer','editor']
          const { roles } = await store.dispatch('user/getInfo')

          // 角色下的路由组
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          // 动态添加可访问路由
          router.addRoutes(accessRoutes)

          // hack 方法来确保 addRoutes 是完整的
          // 设置replace: true，所以导航不会留下历史记录
          next({ ...to, replace: true })
        } catch (error) {
          // 删除令牌重新登录
          await store.dispatch('user/resetToken')
          // Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* 无令牌*/
    if (whiteList.indexOf(to.path) !== -1) {
      // 是否存在白名单中
      next()
    } else {
      // 重定向到登录页面
      next(`/login?redirect=${to.path}`)
      // 进度条加载结束
      NProgress.done()
    }
  }
})

// 导航钩子
router.afterEach(() => {
  // 进度条加载结束
  NProgress.done()
})
