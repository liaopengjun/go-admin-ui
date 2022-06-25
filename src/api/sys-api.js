import request from '@/utils/request'

// 查询api列表
export function listSysApi(data) {
  return request({
    url: 'sys_api/getSysApiList',
    method: 'post',
    data: data
  })
}
// 添加api
export function addSysApi(data) {
  return request({
    url: 'sys_api/addSysApi',
    method: 'post',
    data: data
  })
}

// 更新api
export function updateSysApi(data) {
  return request({
    url: 'sys_api/updateSysApi',
    method: 'post',
    data: data
  })
}

// 删除api
export function delSysApi(data) {
  return request({
    url: 'sys_api/delSysApi',
    method: 'post',
    data: data
  })
}

