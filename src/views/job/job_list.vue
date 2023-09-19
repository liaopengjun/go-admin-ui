<template>
  <el-card class="box-card">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-position="left" label-width="55px">
      <el-form-item label="名称" prop="path">
        <el-input
          v-model="queryParams.job_name"
          placeholder="请输入名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="任务类型" prop="job_type" label-width="80px">
        <el-select v-model="queryParams.job_type" size="small" clearable placeholder="任务类型">
          <el-option
            v-for="item in jobType"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" size="small" style="width: 150px" clearable placeholder="状态" class="filter-item">
          <el-option
            v-for="item in statusOption"
            :key="item.value"
            :label="item.label"
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
          v-permission="['api:job:addJob']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-refresh"
          size="mini"
          @click="handleRefresh"
        >刷新
        </el-button>
      </el-col>
    </el-row>
    <el-table
      v-loading="loading"
      :data="jobList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        label="名称"
        align="center"
        prop="jobName"
        width="160"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="任务类型"
        align="center"
        prop="jobType"
        width="170"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <span>{{ visibleFormatType(scope.row.jobType) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="cron表达式"
        align="center"
        prop="cronExpression"
        width="120"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="调用目标"
        align="center"
        prop="invokeTarget"
        width="180"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="参数"
        align="center"
        prop="args"
        width="150"
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
          <el-tag
            :type="scope.row.status === 1 ? 'success' : 'danger'"
            disable-transitions
          >{{ statusFormat(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createdAt"
        width="170"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding">
        <template slot-scope="scope">
          <el-button
            v-permission="['api:job:editJob']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row.jobId)"
          >修改
          </el-button>
          <el-button
            v-if="(scope.row.entry_id!==0)"
            v-permission="['api:job:stopJob']"
            size="mini"
            type="text"
            icon="el-icon-circle-close"
            style="color:red;"
            @click="handleStop(scope.row.jobId)"
          >停止
          </el-button>
          <el-button
            v-if="scope.row.entry_id==0"
            v-permission="['api:job:startJob']"
            size="mini"
            type="text"
            icon="el-icon-success"
            @click="handleStart(scope.row.jobId)"
          >启动
          </el-button>
          <el-button
            v-if="(scope.row.entry_id==0)"
            v-permission="['api:job:delJob']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row.jobId)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.limit" @pagination="getList" />
    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" :before-close="cancel" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称" prop="jobName">
              <el-input
                v-model="form.jobName"
                placeholder="名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用类型" prop="jobType">
              <el-radio-group v-model="form.jobType" size="small">
                <el-radio-button label="1">接口</el-radio-button>
                <el-radio-button label="2">函数</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用目标" prop="invokeTarget">
              <span slot="label">
                调用目标
                <el-tooltip placement="top">
                  <div slot="content">
                    调用示例：func (t *EXEC) ExamplesNoParam(){..} 填写 ExamplesNoParam 即可；
                    <br>参数说明：目前不支持带参调用
                  </div>
                  <i class="el-icon-question" />
                </el-tooltip>
              </span>
              <el-input
                v-model="form.invokeTarget"
                placeholder="调用目标"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="目标参数" prop="args">
              <span slot="label">
                目标参数
                <el-tooltip placement="top">
                  <div slot="content">
                    参数示例：有参：请以string格式填写；无参：为空；
                    <br>参数说明：目前仅支持函数调用
                  </div>
                  <i class="el-icon-question" />
                </el-tooltip>
              </span>
              <el-input
                v-model="form.args"
                placeholder="目标参数"
              />
            </el-form-item>
          </el-col>
          <el-col :span="15">
            <el-form-item label="cron表达式" prop="cronExpression">
              <el-input
                v-model="form.cronExpression"
                placeholder="cron表达式"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="form.status"
                placeholder="请选择"
              >
                <el-option
                  v-for="dict in statusOption"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>
<script>
import { listJob, startJob, stopJob, delJob, addJob, editJob, getJobInfo } from '@/api/sys-job'
import Pagination from '@/components/Pagination'
export default {
  name: 'JobList',
  components: { Pagination },
  data() {
    return {
      loading: false,
      jobList: [],
      total: 0,
      ids: [],
      single: true,
      multiple: true,
      queryParams: {
        job_name: '',
        job_type: null,
        status: null,
        page: 1,
        limit: 10
      },
      title: '',
      open: false,
      isEdit: false,
      form: {
      },
      rules: {
        jobId: [{ required: true, message: '编码不能为空', trigger: 'blur' }],
        jobName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        jobGroup: [{ required: true, message: '任务分组不能为空', trigger: 'blur' }],
        cronExpression: [{ required: true, message: 'cron表达式不能为空', trigger: 'blur' }],
        invokeTarget: [{ required: true, message: '调用目标不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      },
      statusOption: [{
        value: 1,
        label: '正常'
      }, {
        value: 2,
        label: '停用'
      }],
      jobType: [{
        value: 1,
        label: '接口'
      }, {
        value: 2,
        label: '函数'
      }]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 计划任务列表
    getList () {
      this.loading = true
      if (this.queryParams.status === '') {
        this.queryParams.status = null
      }
      if (this.queryParams.job_type === '') {
        this.queryParams.job_type = null
      }
      listJob(this.queryParams).then(response => {
        this.jobList = response.data.list
        this.total = response.data.total
        setTimeout(() => {
          this.loading = false
        }, 1 * 1000)
      })
    },
    // 刷新
    handleRefresh () {
      this.getList()
    },
    // 重置表单
    reset() {
      this.form = {
        jobId: undefined,
        jobName: undefined,
        jobGroup: undefined,
        cronExpression: undefined,
        invokeTarget: undefined,
        args: undefined,
        jobType: 1,
        status: undefined
      }
      this.resetForm('form')
    },
    // 创建任务
    handleAdd () {
      this.reset()
      this.open = true
      this.title = '添加定时任务'
      this.isEdit = false
      this.form.cronExpression = '*/1 * * * * *'
    },
    // 修改任务
    handleUpdate(jobId) {
      this.reset()
      getJobInfo({ 'id': jobId }).then(response => {
        this.form = response.data
        this.form.misfirePolicy = String(this.form.misfirePolicy)
        this.form.jobType = String(this.form.jobType)
        this.open = true
        this.title = '修改定时任务'
        this.isEdit = true
      })
    },
    // 提交按钮
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.jobId !== undefined) {
            this.form.status = parseInt(this.form.status)
            this.form.misfirePolicy = parseInt(this.form.misfirePolicy)
            this.form.jobType = parseInt(this.form.jobType)
            editJob(this.form).then(response => {
              if (response.code === 1000) {
                this.msgSuccess(response.data)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.data)
              }
            })
          } else {
            this.form.status = parseInt(this.form.status)
            this.form.misfirePolicy = parseInt(this.form.misfirePolicy)
            this.form.concurrent = parseInt(this.form.concurrent)
            this.form.jobType = parseInt(this.form.jobType)
            addJob(this.form).then(response => {
              if (response.code === 1000) {
                this.msgSuccess(response.data)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.data)
              }
            })
          }
        }
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 删除角色
    handleDelete (jobId) {
      this.$confirm('是否删除该任务?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delJob({ 'id': jobId })
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
    // 启动服务
    handleStart (jobId) {
      this.$confirm('是否启动该任务?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return startJob({ 'id': jobId })
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
    // 关闭服务
    handleStop (jobId) {
      this.$confirm('是否停止该任务?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return stopJob({ 'id': jobId })
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.ID)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    // 搜索按钮操作
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    // 重置按钮操作
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 显示
    visibleFormatType(jobType) {
      return jobType === 1 ? '接口' : '函数'
    },
    statusFormat(status) {
      return this.selectDictLabel(this.statusOption, status)
    },
    selectDictLabel(datas, value) {
      var actions = []
      Object.keys(datas).map((key) => {
        if (datas[key].value === value) {
          actions.push(datas[key].label)
          return false
        }
      })
      return actions.join('')
    }
  }
}
</script>

