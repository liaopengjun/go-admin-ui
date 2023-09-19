<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        v-permission="['api:authority:addAuthority']"
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-plus"
        @click="handleCreate()"
      >
        新增
      </el-button>
      <el-input v-model="listQuery.authority_name" placeholder="角色名" style="width: 150px;margin-left:45%" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" clearable placeholder="状态" style="width: 100px" class="filter-item">
        <el-option
          v-for="item in statusOption"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleQuery">
        搜索
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      row-key="authorityId"
    >
      <el-table-column prop="authorityId" label="角色id" :show-overflow-tooltip="true" width="300" />
      <el-table-column prop="authorityName" align="center" label="角色名称" :show-overflow-tooltip="true" width="300" />
      <el-table-column prop="status" label="状态" align="center" width="300">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="">
        <template slot-scope="scope">
          <el-button
            v-permission="['api:authority:setAuthority']"
            size="mini"
            type="text"
            icon="el-icon-lock"
            @click="handleSetAuthority(scope.row.authorityId)"
          >设置权限</el-button>
          <el-button
            v-permission="['api:authority:addAuthority']"
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleCreate(scope.row.authorityId)"
          >新增</el-button>
          <el-button
            v-permission="['api:authority:updateAuthority']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row.authorityId)"
          >修改</el-button>
          <el-button
            v-if="(scope.row.authorityId !=1)"
            v-permission="['api:authority:deleteAuthority']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row.authorityId)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :before-close="cancel">
      <el-form ref="formAuth" :model="form" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item prop="parentId">
          <span slot="label">上级角色</span>
          <treeselect
            v-model="form.parentId"
            :options="authOptions"
            :normalizer="normalizer"
            :show-count="true"
            placeholder="选择上级角色"
          />
        </el-form-item>
        <el-form-item label="角色id" prop="authorityId">
          <span slot="label">角色id</span>
          <el-input v-model="form.authorityId" :disabled="isDisabled" placeholder="请输入角色id" />
        </el-form-item>
        <el-form-item label="角色名称" prop="authorityName">
          <span slot="label">角色名称</span>
          <el-input v-model="form.authorityName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
    <el-drawer
      ref="drawer"
      :before-close="handleClose"
      :visible.sync="open"
      size="430px"
      :with-header="false"
    >
      <el-tabs v-model="activeName" type="border-card">
        <el-tab-pane label="角色菜单" name="menus">
          <div class="clearflex">
            <el-button class="fl-right" size="mini" type="primary" @click="relation">确 定</el-button>
          </div>
          <el-tree
            ref="menuTree"
            :data="menuTreeData"
            :default-checked-keys="menuTreeIds"
            :props="menuDefaultProps"
            default-expand-all
            highlight-current
            node-key="ID"
            show-checkbox
            class="treeauth"
            @check="nodeChange"
          />
        </el-tab-pane>
        <el-tab-pane label="角色api" name="apis">
          <div class="clearflex">
            <el-button class="fl-right" size="mini" type="primary" @click="authApiEnter">确 定</el-button>
          </div>
          <el-tree
            ref="apiTree"
            :data="apiTreeData"
            :default-checked-keys="apiTreeIds"
            :props="apiDefaultProps"
            default-expand-all
            highlight-current
            node-key="onlyId"
            show-checkbox
            class="treeauth"
            @check="nodeChange"
          />
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>
<script>
import { listAuth, delAuth, addAuth, updateAuth, getAuthInfo, setAuthMenu, getAuthMenuList, updateAuthStatus, getSysApiAll, setApiAuth, getApiList } from '@/api/sys-auth'
import { listMenuTree } from '@/api/sys-menu'
import waves from '@/directive/waves' // waves directive
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import Treeselect from '@riophae/vue-treeselect'
export default {
  name: 'AuthList',
  components: { Treeselect },
  directives: { waves },
  data() {
    return {
      list: [],
      total: 0,
      activeName: 'menus',
      listLoading: false,
      dialogFormVisible: false,
      dialogStatus: '',
      authOptions: [],
      isDisabled: false,
      listQuery: {
        page: 1,
        limit: 9999,
        authority_name: '',
        status: '',
        sort: 'id'
      },
      form: {
        parentId: null,
        authorityId: '0',
        authorityName: '1',
        status: 0
      },
      textMap: {
        update: '修改角色',
        create: '新增角色'
      },
      statusOption: [{
        value: '0',
        label: '正常'
      }, {
        value: '1',
        label: '禁用'
      }],
      setAuthMenu: {
        menus: [],
        authorityId: ''
      },
      setAuthApi: {
        casbinInfos: [],
        authorityId: ''
      },
      isEdit: false,
      open: false,
      menuTreeData: [],
      menuTreeIds: [],
      needConfirm: false,
      menuDefaultProps: {
        children: 'children',
        label: function(data) {
          return data.title
        }
      },
      apiDefaultProps: {
        children: 'children',
        label: 'description'
      },
      apiTreeData: [],
      apiTreeIds: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 表单重置
    reset() {
      this.resetForm('formMenu')
      this.form = {
        parentId: null,
        authorityId: '',
        authorityName: '',
        status: 0
      }
    },
    // 角色列表
    getList() {
      this.listLoading = true
      listAuth(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        setTimeout(() => {
          this.listLoading = false
        }, 1 * 1000)
      })
    },
    // 转换角色数据结构
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      // 去掉children=null的属性
      if (node.children == null || node.children === 'null') {
        delete node.children
      }
      return {
        id: parseInt(node.authorityId),
        label: node.authorityName,
        children: node.children
      }
    },
    // 查询角色下拉树结构
    getTreeselect() {
      listAuth(this.listQuery).then(response => {
        this.authOptions = []
        const auth = { ID: 0, title: '上级菜单', children: [] }
        auth.children = response.data.list
        this.authOptions.push(auth)
      })
    },
    // 创建角色
    handleCreate (id) {
      this.isDisabled = false
      this.reset()
      this.getTreeselect()
      if (id != null) {
        this.form.parentId = id
      }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.isEdit = false
    },
    // 角色更新
    handleUpdate (id) {
      this.isEdit = true
      this.isDisabled = true
      this.reset()
      this.getTreeselect()
      getAuthInfo({ 'authorityId': id }).then(response => {
        const data = response.data.list
        this.form.parentId = data.parentId
        this.form.authorityId = data.authorityId
        this.form.authorityName = data.authorityName
        this.form.status = data.status
        if (data.parentId === '0' || data.parentId === 0) {
          this.form.parentId = null
        }
        this.dialogFormVisible = true
        this.dialogStatus = 'update'
      })
    },
    // 设置权限
    handleSetAuthority (id) {
      this.activeName = 'menus'
      this.open = true
      this.setAuthMenu.authorityId = id
      this.setAuthApi.authorityId = id
      // 菜单 api 基础数据
      this.getMenuTreeselect()
      // 获取角色菜单
      getAuthMenuList({ 'authorityId': id }).then(response => {
        if (response.code === 1000) {
          const menus = response.data.list
          const arr = []
          menus.forEach(item => {
            // 防止直接选中父级造成全选
            if (!menus.some(same => same.parentId === item.ID)) {
              arr.push(item.ID)
            }
          })
          this.menuTreeIds = arr
          this.$nextTick(() => {
            this.$refs.menuTree.setCheckedKeys(this.menuTreeIds)
          })
        } else {
          this.msgError(response.data)
        }
      })
      // 获取角色api列表
      getApiList({ 'authorityId': id }).then(response => {
        if (response.code === 1000) {
          const apis = response.data
          const arr2 = []
          apis && apis.forEach(item => {
            arr2.push('p:' + item.path + 'm:' + item.method)
          })
          this.apiTreeIds = arr2
          this.$nextTick(() => {
            this.$refs.apiTree.setCheckedKeys(this.apiTreeIds)
          })
        } else {
          this.msgError(response.data)
        }
      })
    },
    // 关闭权限弹框
    handleClose () {
      this.open = false
      this.setAuthMenu = {
        menus: [],
        authorityId: ''
      }
    },
    // 取消按钮
    cancel () {
      this.reset()
      this.dialogFormVisible = false
    },
    // 搜索
    handleQuery () {
      this.getList()
    },
    // 更新状态
    handleStatusChange (row) {
      const data = {
        'authorityId': row.authorityId,
        'status': row.status.toString()
      }
      updateAuthStatus(data).then(response => {
        if (response.code === 1000) {
          this.msgSuccess(response.data)
          this.getList()
        } else {
          this.msgError(response.data)
        }
      })
    },
    // 删除菜单
    handleDelete(id) {
      this.$confirm('是否确认删除数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delAuth({ 'authorityId': id })
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
    // 状态显示
    visibleFormat(status) {
      return status === 1 ? '禁用' : '正常'
    },
    // 查询菜单下拉树结构
    getMenuTreeselect() {
      listMenuTree().then(response => {
        this.menuTreeData = response.data.list
      })
      getSysApiAll().then(response => {
        const apis = response.data
        apis.forEach(item => {
          item.children.forEach(item2 => {
            item2.onlyId = 'p:' + item2.path + 'm:' + item2.method
          })
        })
        this.apiTreeData = apis
      })
    },
    nodeChange() {
      this.needConfirm = true
    },
    // 提交设置权限
    relation () {
      // 菜单
      this.setAuthMenu.menus = this.$refs.menuTree.getCheckedNodes(false, true)
      setAuthMenu(this.setAuthMenu).then(response => {
        if (response.code === 1000) {
          this.msgSuccess(response.data)
          this.open = false
        } else {
          this.msgError(response.data)
        }
      })
    },
    // 提交api权限
    authApiEnter() {
      const checkArr = this.$refs.apiTree.getCheckedNodes(true)
      this.setAuthApi.casbinInfos = []
      checkArr && checkArr.forEach(item => {
        var casbinInfo = {
          path: item.path,
          method: item.method
        }
        this.setAuthApi.casbinInfos.push(casbinInfo)
      })
      setApiAuth(this.setAuthApi).then(response => {
        if (response.code === 1000) {
          this.msgSuccess(response.data)
          this.open = false
        } else {
          this.msgError(response.data)
        }
      })
    },
    // 表单提交
    submitForm() {
      this.$refs.formAuth.validate(valid => {
        if (valid) {
          if (this.isEdit) {
            updateAuth(this.form).then(response => {
              if (response.code === 1000) {
                this.msgSuccess(response.data)
                this.dialogFormVisible = false
                this.getList()
              } else {
                this.msgError(response.data)
              }
            })
          } else {
            if (this.form.parentId == null) {
              this.form.parentId = '0'
            }
            addAuth(this.form).then(response => {
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
    }
  }
}
</script>
<style lang="css">
 .filter-item{
    margin-left: 15px;
  }
  .treeauth{
      padding-left:20px;
  }
  .clearflex {
        *zoom: 1;
        margin-right: 40px;
    }

  .clearflex:after {
      content: '';
      display: block;
      height: 0;
      visibility: hidden;
      clear: both;
  }
  .fl-left {
      float: left;
  }
  .fl-right {
      float: right;
  }
  .mg {
      margin: 10px !important;
  }
  .left-mg-xs {
      margin-left: 6px !important;
  }
  .left-mg-sm {
      margin-left: 10px !important;
  }
  .left-mg-md {
      margin-left: 14px !important;
  }
  .top-mg-lg {
      margin-top: 20px !important;
  }
  .tb-mg-lg {
      margin: 20px 0 !important;
  }
  .bottom-mg-lg {
      margin-bottom: 20px !important;
  }
  .left-mg-lg {
      margin-left: 18px !important;
  }
  .title-1 {
      text-align: center;
      font-size: 32px;
  }
  .title-3 {
      text-align: center;
  }
  .el-drawer__header {
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    color: #72767b;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    margin-bottom: 20px;
    padding: 20px;
    padding-bottom: 0;
  }
  .el-tabs__content {
    height: calc(100vh - 72px);
    overflow: auto;
  }
  .el-tabs__item:focus.is-active.is-focus:not(:active){
    -webkit-box-shadow: none;
    box-shadow: none;
  }
</style>
