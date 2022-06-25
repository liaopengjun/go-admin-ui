<template>
  <el-card class="box-card">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-position="left" label-width="55px">
      <el-form-item label="路径" prop="path">
        <el-input
          v-model="queryParams.path"
          placeholder="请输入路径"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分组" prop="phone">
        <el-input
          v-model="queryParams.api_group"
          placeholder="请输入分组"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="请求" prop="method">
        <el-select v-model="queryParams.method" size="small" style="width: 150px" clearable placeholder="请求" class="filter-item">
          <el-option
            v-for="item in methodOptions"
            :key="item.value"
            :label="`${item.label}(${item.value})`"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-permission="['api:sys_api:addSysApi']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['api:sys_api:delSysApi']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除
        </el-button>
      </el-col>
    </el-row>
    <el-table
      v-loading="loading"
      :data="apiList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="ID"
        align="center"
        prop="ID"
        width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="Api路径"
        align="center"
        prop="path"
        width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="Api分组"
        align="center"
        prop="api_group"
        width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="请求"
        align="center"
        prop="method"
        width="200"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <div>
            {{ scope.row.method }} / {{ methodFiletr(scope.row.method) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="Api描述"
        align="center"
        prop="description"
        width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="操作" align="center" class-name="small-padding">
        <template slot-scope="scope">
          <el-button
            v-permission="['api:sys_api:updateSysApi']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-permission="['api:sys_api:delSysApi']"
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :before-close="cancel">
      <el-form ref="formApi" :model="apiform" :rules="rules" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="路径" prop="path">
          <span slot="label">路径名称</span>
          <el-input v-model="apiform.path" placeholder="请输入路径名称" />
        </el-form-item>
        <el-form-item label="请求" prop="method">
          <el-select v-model="apiform.method" placeholder="请求">
            <el-option
              v-for="item in methodOptions"
              :key="item.value"
              :label="`${item.label}(${item.value})`"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分组" prop="api_group">
          <span slot="label">分组</span>
          <el-input v-model="apiform.api_group" placeholder="请输入分组" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <span slot="label">描述</span>
          <el-input v-model="apiform.description" placeholder="请输入描述内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>
<script>
import { listSysApi, delSysApi, addSysApi, updateSysApi } from '@/api/sys-api'
import Pagination from '@/components/Pagination'
export default {
  name: 'ApiList',
  components: { Pagination },
  data() {
    return {
      loading: false,
      multiple: true,
      apiList: [],
      total: 0,
      ids: [],
      single: true,
      dialogStatus: false,
      dialogFormVisible: false,
      isEdit: false,
      apiform: {
        id: 0,
        path: '',
        method: '',
        api_group: '',
        description: ''
      },
      queryParams: {
        username: '',
        phone: '',
        page: 1,
        limit: 10
      },
      methodOptions: [
        {
          value: 'POST',
          label: '创建',
          type: 'success'
        },
        {
          value: 'GET',
          label: '查看',
          type: ''
        },
        {
          value: 'PUT',
          label: '更新',
          type: 'warning'
        },
        {
          value: 'DELETE',
          label: '删除',
          type: 'danger'
        }
      ],
      textMap: {
        update: '修改api',
        create: '创建api'
      },
      rules: {
        path: [
          { required: true, message: '请输入路径名称', trigger: 'blur' }
        ],
        method: [
          { required: true, message: '请输入请求', trigger: 'blur' }
        ],
        api_group: [
          { required: true, message: '请输入分组', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 表单重置
    reset() {
      this.resetForm('formApi')
      this.apiform = {
        id: 0,
        path: '',
        method: '',
        api_group: '',
        description: ''
      }
    },
    // 搜索
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    // 重置搜索
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 列表
    getList() {
      this.loading = true
      listSysApi(this.queryParams).then(response => {
        this.apiList = response.data.list
        this.total = response.data.total
        setTimeout(() => {
          this.loading = false
        }, 1 * 1000)
      })
    },
    // 取消
    cancel() {
      this.reset()
      this.dialogFormVisible = false
    },
    // 添加弹框
    handleAdd() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.isEdit = false
      this.reset()
    },
    // 更新弹框
    handleUpdate(row) {
      this.reset()
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.isEdit = true
      this.apiform = JSON.parse(JSON.stringify(row))
    },
    // 删除 || 批量删除
    handleDelete(row) {
      const Ids = (row.ID && [row.ID]) || this.ids
      const strIds = Ids.join(',')
      this.$confirm('是否确认删除数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delSysApi({ 'ids': strIds })
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
    // 表单提交
    submitForm() {
      this.$refs.formApi.validate(valid => {
        if (valid) {
          if (this.isEdit) {
            updateSysApi(this.apiform).then(response => {
              if (response.code === 1000) {
                this.msgSuccess(response.data)
                this.dialogFormVisible = false
                this.getList()
              } else {
                this.msgError(response.data)
              }
            })
          } else {
            addSysApi(this.apiform).then(response => {
              if (response.code === 1000) {
                this.msgSuccess(response.data)
                this.dialogFormVisible = false
                this.getList()
              } else {
                this.msgError(response.data)
              }
            })
          }
        }
      })
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.ID)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    // 请求渲染处理
    methodFiletr(value) {
      const target = this.methodOptions.filter(item => item.value === value)[0]
      return target && `${target.label}`
    }
  }
}
</script>
<style>
    .pagination-container {
        margin-top: 10px;
    }
</style>
