import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/base/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/user/userinfo',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
