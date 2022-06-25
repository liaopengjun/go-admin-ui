<template>
  <el-card class="box-card">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-position="left" label-width="55px">
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
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
      <el-form-item label="角色" prop="authority_id">
        <el-select v-model="queryParams.authority_id" size="small" style="width: 150px" clearable placeholder="角色" class="filter-item">
          <el-option
            v-for="item in authlist"
            :key="item.authorityId"
            :label="item.authorityName"
            :value="item.authorityId"
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
          v-permission="['api:user:register']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['api:user:delUser']"
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
      :data="userList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column align="left" label="头像" width="60">
        <template slot-scope="scope">
          <el-avatar :src="path + scope.row.headerImg" />
        </template>
      </el-table-column>
      <el-table-column
        label="用户名"
        align="center"
        prop="userName"
        width="100"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="名称"
        align="center"
        prop="nickName"
        width="100"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="手机号"
        align="center"
        prop="phone"
        width="130"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="邮箱"
        align="center"
        prop="email"
        width="130"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="角色"
        align="center"
        prop="authority.authorityName"
        width="140"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="状态" width="120">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="CreatedAt"
        width="170"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.CreatedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding">
        <template slot-scope="scope">
          <el-button
            v-permission="['api:user:updateUser']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-if="scope.row.ID !== 1"
            v-permission="['api:user:delUser']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
          <el-button
            v-permission="['api:user:editPassword']"
            size="mini"
            type="text"
            icon="el-icon-key"
            @click="handleResetPwd(scope.row)"
          >重置
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.limit" @pagination="getList" />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :before-close="cancel">
      <el-form ref="formUser" :model="userform" :rules="rules" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户名称" prop="userName">
          <span slot="label">用户名称</span>
          <el-input v-model="userform.userName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item v-if="isEdit === false" label="密码" prop="passWord">
          <span slot="label">密码</span>
          <el-input v-model="userform.passWord" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickName">
          <span slot="label">用户昵称</span>
          <el-input v-model="userform.nickName" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <span slot="label">手机号</span>
          <el-input v-model="userform.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <span slot="label">邮箱</span>
          <el-input v-model="userform.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="用户角色" prop="authorityId">
          <el-cascader
            v-model="userform.authorityIds"
            style="width:100%"
            :options="authOptions"
            :show-all-levels="false"
            :props="{ multiple:true,checkStrictly: true,label:'authorityName',value:'authorityId',disabled:'disabled',emitPath:false}"
            :clearable="false"
          />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="userform.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="头像" prop="HeaderImg">
          <div v-show="hideShow" class="el-upload-list el-upload-list--picture-card">
            <div class="el-upload-list__item">
              <img v-if="userform.headerImg" class="avatar" :src="(userform.headerImg && userform.headerImg.slice(0, 4) !== 'http') ? path+userform.headerImg : userform.headerImg">
              <div v-else class="avatar">请上传头像</div>
              <span class="el-upload-list__item-actions">
                <span class="el-upload-list__item-delete">
                  <i class="el-icon-delete" @click.stop="handleRemove()" />
                </span>
              </span>
            </div>
          </div>
          <el-upload
            v-show="!hideShow"
            class="avatar-uploader"
            :action="`${path}/file/upload`"
            :headers="{ 'x-token': token }"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :on-remove="handleRemove"
            :before-upload="beforeAvatarUpload"
          >
            <i class="el-icon-plus avatar-uploader-icon" />
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
          </el-upload>
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
import { listUser, updateUserStatus, AddUser, UpdateUser, delUser, resetUserPwd, delUserAvater } from '@/api/sys-user'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listAuth } from '@/api/sys-auth'
import { getToken } from '@/utils/auth'
export default {
  name: 'UserList',
  components: { Pagination },
  data() {
    return {
      token: getToken(),
      path: process.env.VUE_APP_BASE_API + '/',
      total: 0,
      multiple: true,
      dialogStatus: false,
      dialogFormVisible: false,
      loading: false,
      image: '',
      userList: [],
      ids: [],
      single: true,
      authlist: [],
      isEdit: false,
      queryParams: {
        username: '',
        authority_id: '',
        status: '',
        phone: '',
        page: 1,
        limit: 10
      },
      statusOption: [{
        value: '0',
        label: '正常'
      }, {
        value: '1',
        label: '禁用'
      }],
      authOptions: [],
      textMap: {
        update: '修改用户',
        create: '创建用户'
      },
      userform: {
        userName: '',
        passWord: '',
        nickName: '',
        phone: '',
        email: '',
        headerImg: '',
        authorityId: '',
        authorityIds: [],
        sex: 1
      },
      rules: {
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, message: '最低5位字符', trigger: 'blur' }
        ],
        passWord: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, message: '最低6位字符', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    hideShow() { // 当图片多于一张的时候，就隐藏上传框
      return this.userform.headerImg !== ''
    }
  },
  created() {
    this.getList()
    this.getAuthList()
  },
  methods: {
    // 表单重置
    reset() {
      this.resetForm('formUser')
      this.userform = {
        userName: '',
        passWord: '',
        nickName: '',
        phone: '',
        email: '',
        headerImg: '',
        authorityId: '',
        authorityIds: [],
        sex: 1
      }
    },
    // 用户列表
    getList () {
      this.loading = true
      listUser(this.queryParams).then(response => {
        this.userList = response.data.list
        this.total = response.data.total
        setTimeout(() => {
          this.loading = false
        }, 1 * 1000)
      })
    },
    // 创建用户
    handleAdd () {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.isEdit = false
      this.reset()
    },
    // 删除角色
    handleDelete (row) {
      const Ids = (row.ID && [row.ID]) || this.ids
      const strIds = Ids.join(',')
      this.$confirm('是否确认删除数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delUser({ 'ids': strIds })
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
    // 更新角色
    handleUpdate (row) {
      this.dialogStatus = 'update'
      this.reset()
      this.dialogFormVisible = true
      this.isEdit = true
      this.userform = JSON.parse(JSON.stringify(row))
      this.userform.sex = parseInt(this.userform.sex)
      this.setAuthorityIds(this.userform.authorities)
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
    // 更新状态
    handleStatusChange (row) {
      const data = {
        'userid': row.ID,
        'status': row.status.toString()
      }
      updateUserStatus(data).then(response => {
        if (response.code === 1000) {
          this.msgSuccess(response.data)
          this.getList()
        } else {
          this.msgError(response.data)
        }
      })
    },
    // 角色列表
    getAuthList() {
      const authData = {
        page: 1,
        limit: 9999,
        authority_name: '',
        status: '',
        sort: 'id'
      }
      listAuth(authData).then(response => {
        this.authlist = response.data.list
        this.setOptions(this.authlist)
      })
    },
    // 设置角色下拉选择
    setOptions(authlist) {
      this.authOptions = []
      this.setAuthorityOptions(authlist, this.authOptions)
    },
    setAuthorityOptions(AuthorityData, optionsData) {
      AuthorityData &&
        AuthorityData.forEach(item => {
          if (item.children && item.children.length) {
            const option = {
              authorityId: item.authorityId,
              authorityName: item.authorityName,
              children: []
            }
            this.setAuthorityOptions(item.children, option.children)
            optionsData.push(option)
          } else {
            const option = {
              authorityId: item.authorityId,
              authorityName: item.authorityName
            }
            optionsData.push(option)
          }
        })
    },
    setAuthorityIds(authorities) {
      const authorityIds = authorities && authorities.map(i => {
        return i.authorityId
      })
      this.userform.authorityIds = authorityIds
    },
    // 取消
    cancel() {
      this.reset()
      this.dialogFormVisible = false
    },
    // 表单提交
    submitForm() {
      this.$refs.formUser.validate(valid => {
        if (valid) {
          this.userform.sex = this.userform.sex.toString()
          if (this.isEdit) {
            UpdateUser(this.userform).then(response => {
              if (response.code === 1000) {
                this.msgSuccess(response.data)
                this.dialogFormVisible = false
                this.getList()
              } else {
                this.msgError(response.data)
              }
            })
          } else {
            AddUser(this.userform).then(response => {
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
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        const param = {
          'user_id': row.ID,
          'is_old_pwd': '1',
          'password': row.password,
          'newPassword': value
        }
        resetUserPwd(param).then(response => {
          if (response.code === 1000) {
            this.msgSuccess('修改成功，新密码是：' + value)
          } else {
            this.msgError(response.data)
          }
        })
      }).catch(() => {})
    },
    handleAvatarSuccess(res, file) {
      if (res && res.data) {
        this.$set(this.userform, 'headerImg', res.data)
      }
      this.userform.headerImg = res.data
    },
    beforeAvatarUpload(file) {
      // const isJPG = file.type === 'image/jpeg/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!')
      // }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isLt2M
    },
    handleRemove() {
      const param = {
        'userid': this.userform.ID,
        'headerImg': this.userform.headerImg
      }
      delUserAvater(param).then(response => {
        if (response.code === 1000) {
          this.userform.headerImg = ''
          this.msgSuccess(response.data)
        } else {
          this.msgError(response.data)
        }
      })
    }
  }
}
</script>
<style>
    .pagination-container {
        margin-top: 10px;
    }
  .avatar-uploader .el-upload:hover {
    border-color: #409eff;
  }
  .avatar-uploader-icon {
    border: 1px dashed #d9d9d9 !important;
    border-radius: 6px;
    font-size: 28px;
    color: #8c939d;
    width: 146px;
    height: 146px;
    line-height: 146px;
    text-align: center;
  }
  .avatar {
    width: 146px;
    height: 146px;
    display: block;
  }
  .header-img-box {
    width: 146px;
    height: 146px;
    border: 1px dashed #ccc;
    border-radius: 20px;
    text-align: center;
    line-height: 200px;
    cursor: pointer;
  }
</style>
