import request from '@/utils/request'

// 查询菜单列表
export function listMenu(query) {
  return request({
    url: '/menu/getMenuList',
    method: 'post',
    data: query
  })
}

// 查询菜单树形下拉
export function listMenuTree() {
  return request({
    url: '/menu/getMenuTreeList',
    method: 'post'
  })
}

// 删除菜单
export function delMenu(query) {
  return request({
    url: '/menu/deleteMenu',
    method: 'post',
    data: query
  })
}

// 添加菜单
export function addMenu(query) {
  return request({
    url: '/menu/addMenu',
    method: 'post',
    data: query
  })
}

// 更新菜单
export function updateMenu(query) {
  return request({
    url: '/menu/updateMenu',
    method: 'post',
    data: query
  })
}

// 菜单详情
export function getMenuInfo(data) {
  return request({
    url: '/menu/getMenuInfo',
    method: 'post',
    data: data
  })
}

