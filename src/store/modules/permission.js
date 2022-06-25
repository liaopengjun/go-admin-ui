import { asyncRoutes, constantRoutes } from '@/router'
import { getRoutes } from '@/api/sys-auth.js'
import Layout from '@/layout'
import { Message } from 'element-ui'

// 使用 meta.role 判断当前用户是否有权限
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

// 使用 meta.role 判断当前用户是否有权限2
function hasPathPermission(paths, route) {
  if (route.path) {
    return paths.some(path => route.path === path.path)
  } else {
    return true
  }
}

// 通过递归过滤异步路由表
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}
// 通过递归过滤异步路由表2
export function filterAsyncPathRoutes(routes, paths) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPathPermission(paths, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncPathRoutes(tmp.children, paths)
      }
      res.push(tmp)
    }
  })

  return res
}

// 后台查询的菜单数据拼装成路由格式的数据
export function generaMenu(routes, data) {
  data.forEach(item => {
    const menu = {
      path: item.path,
      component: item.component === 'Layout' ? Layout : loadView(item.component),
      hidden: item.hidden === '0',
      children: [],
      name: item.name,
      meta: {
        title: item.title,
        icon: item.icon,
        noCache: true
      }
    }
    if (item.children) {
      generaMenu(menu.children, item.children)
    }
    routes.push(menu)
  })
}

// 路由懒加载
export const loadView = (view) => {
  return (resolve) => require([`@/views${view}`], resolve)
}

const state = {
  routes: [],
  addRoutes: [],
  buttons: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },
  SET_BUTTONS: (state, buttons) => {
    state.buttons = buttons
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      const loadMenuData = []
      const loadbtnData = []
      getRoutes().then(response => {
        if (response.code !== 1000) {
          Message.error('菜单数据加载异常')
        } else {
          // 用户菜单
          const data = response.data.menuList
          Object.assign(loadMenuData, data)
          generaMenu(asyncRoutes, loadMenuData)
          commit('SET_ROUTES', asyncRoutes)

          // 用户按钮权限
          const btn = response.data.btnList
          Object.assign(loadbtnData, btn)
          commit('SET_BUTTONS', loadbtnData)
          resolve(asyncRoutes)
        }
      }).catch(error => {
        console.log(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
