import request from '@/utils/request'

// 查询任务列表
export function listJob(query) {
  return request({
    url: '/job/getJobList',
    method: 'post',
    data: query
  })
}

// 删除任务
export function delJob(query) {
  return request({
    url: '/job/delJob',
    method: 'post',
    data: query
  })
}

// 添加任务
export function addJob(query) {
  return request({
    url: '/job/addJob',
    method: 'post',
    data: query
  })
}

// 更新任务
export function editJob(query) {
  return request({
    url: '/job/editJob',
    method: 'post',
    data: query
  })
}

// 任务详情
export function getJobInfo(query) {
  return request({
    url: '/job/getJobInfo',
    method: 'post',
    data: query
  })
}

// 启动任务
export function startJob(query) {
  return request({
    url: '/job/startJob',
    method: 'post',
    data: query
  })
}

// 关闭任务
export function stopJob(query) {
  return request({
    url: '/job/stopJob',
    method: 'post',
    data: query
  })
}
