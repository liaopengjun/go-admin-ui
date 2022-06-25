import request from '@/utils/request'

// log列表
export function listLoginlog(query) {
  return request({
    url: '/log/getLoginLogList',
    method: 'post',
    data: query
  })
}

// 删除log
export function delLoginlog(query) {
  return request({
    url: '/log/delLoginLog',
    method: 'post',
    data: query
  })
}
