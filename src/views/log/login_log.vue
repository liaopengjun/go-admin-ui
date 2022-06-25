<template>
  <el-card class="box-card">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="用户名" prop="username"><el-input
        v-model="queryParams.username"
        placeholder="请输入用户名"
        clearable
        size="small"
        @keyup.enter.native="handleQuery"
      />
      </el-form-item>
      <el-form-item label="状态" prop="status"><el-select
        v-model="queryParams.status"
        placeholder="系统登录日志状态"
        clearable
        size="small"
      >
        <el-option
          v-for="dict in statusOptions"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        />
      </el-select>
      </el-form-item>
      <el-form-item label="ip地址" prop="ip"><el-input
        v-model="queryParams.ip"
        placeholder="请输入ip地址"
        clearable
        size="small"
        @keyup.enter.native="handleQuery"
      />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-permission="['api:log:delLoginLog']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="loginlogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="用户名"
        align="center"
        prop="username"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="类型"
        align="center"
        prop="msg"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        width="100"
        :formatter="statusFormat"
      >
        <template slot-scope="scope">
          {{ statusFormat(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column
        label="ip地址"
        align="center"
        prop="ipaddr"
      >
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <p>IP: {{ scope.row.ipaddr }}</p>
            <p>归属地: {{ scope.row.loginLocation }}</p>
            <p>浏览器: {{ scope.row.browser }}</p>
            <p>系统: {{ scope.row.os }}</p>
            <p>固件: {{ scope.row.platform }}</p>
            <div slot="reference" class="name-wrapper">
              {{ scope.row.ipaddr }}
            </div>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column
        label="登录时间"
        align="center"
        prop="loginTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['api:log:delLoginLog']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.limit" @pagination="getList" />
  </el-card>
</template>
<script>
import { listLoginlog, delLoginlog } from '@/api/sys-loginlog'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'LoginLog',
  components: { Pagination },
  data() {
    return {
      single: true,
      multiple: true,
      loading: false,
      total: 0,
      ids: [],
      loginlogList: [],
      queryParams: {
        username: '',
        status: '',
        ip: '',
        page: 1,
        limit: 10
      },
      statusOptions: [
        { label: '正常', value: '1' },
        { label: '失败', value: '0' }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listLoginlog(this.queryParams).then(response => {
        this.loginlogList = response.data.list
        this.total = response.data.total
        setTimeout(() => {
          this.loading = false
        }, 1 * 1000)
      })
    },
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    handleDelete(row) {
      const Ids = (row.ID && [row.ID]) || this.ids
      const strIds = Ids.join(',')
      this.$confirm('是否确认删除数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delLoginlog({ 'ids': strIds })
      }).then((response) => {
        if (response.code === 1000) {
          this.msgSuccess(response.data)
          this.open = false
          this.getList()
        } else {
          this.msgError(response.data)
        }
      }).catch(function() {})
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.ID)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    selectDictLabel(datas, value) {
      var actions = []
      Object.keys(datas).map((key) => {
        if (datas[key].value === ('' + value)) {
          actions.push(datas[key].label)
          return false
        }
      })
      return actions.join('')
    }
  }
}
</script>
<style></style>
