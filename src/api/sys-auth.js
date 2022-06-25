import request from '@/utils/request'

// 查询角色列表
export function listAuth(data) {
  return request({
    url: '/authority/getAuthorityList',
    method: 'post',
    data: data
  })
}

// 删除角色
export function delAuth(data) {
  return request({
    url: '/authority/deleteAuthority',
    method: 'post',
    data: data
  })
}

// 添加角色
export function addAuth(data) {
  return request({
    url: '/authority/addAuthority',
    method: 'post',
    data: data
  })
}

// 更新角色
export function updateAuth(data) {
  return request({
    url: '/authority/updateAuthority',
    method: 'post',
    data: data
  })
}

// 角色详情
export function getAuthInfo(data) {
  return request({
    url: '/authority/getAuthInfo',
    method: 'post',
    data: data
  })
}

// 角色权限
export function setAuthMenu(data) {
  return request({
    url: '/authority/setAuthority',
    method: 'post',
    data: data
  })
}

// 查询角色权限
export function getAuthMenuList(data) {
  return request({
    url: '/menu/getAuthorityMenuList',
    method: 'post',
    data: data
  })
}

// 查询角色权限
export function updateAuthStatus(data) {
  return request({
    url: '/authority/authStatus',
    method: 'post',
    data: data
  })
}

// 查询菜单
export function getRoutes(data) {
  return request({
    url: '/menu/getUserMenuList',
    method: 'post',
    data: data
  })
}

// 查询api
export function getSysApiAll(data) {
  return request({
    url: '/sys_api/getSysApiAll',
    method: 'post',
    data: data
  })
}

// 提交api设置权限
export function setApiAuth(data) {
  return request({
    url: '/authority/setAuthApi',
    method: 'post',
    data: data
  })
}

// 提交api设置权限
export function getApiList(data) {
  return request({
    url: '/authority/getAuthApi',
    method: 'post',
    data: data
  })
}

