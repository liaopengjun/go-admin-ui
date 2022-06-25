import request from '@/utils/request'

// 查询用户列表
export function listUser(query) {
  return request({
    url: '/user/userList',
    method: 'post',
    data: query
  })
}

// 更新用户状态
export function updateUserStatus(query) {
  return request({
    url: '/user/updateUserStatus',
    method: 'post',
    data: query
  })
}

// 添加用户
export function AddUser(query) {
  return request({
    url: '/user/register',
    method: 'post',
    data: query
  })
}

// 查询用户
export function UserInfo(query) {
  return request({
    url: '/user/getUserInfo',
    method: 'post',
    data: query
  })
}

// 更新用户
export function UpdateUser(query) {
  return request({
    url: '/user/updateUser',
    method: 'post',
    data: query
  })
}

// 删除用户
export function delUser(query) {
  return request({
    url: '/user/delUser',
    method: 'post',
    data: query
  })
}
// 更新密码
export function resetUserPwd(query) {
  return request({
    url: '/user/editPassword',
    method: 'post',
    data: query
  })
}
// 删除用户头像
export function delUserAvater(query) {
  return request({
    url: '/user/delUserAvater',
    method: 'post',
    data: query
  })
}

