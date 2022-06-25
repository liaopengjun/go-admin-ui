<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-button v-permission="['api:menu:addMenu']" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate(0)">
        新增
      </el-button>
      <el-input v-model="listQuery.title" placeholder="菜单名" style="width: 200px;margin-left:58%" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleQuery">
        搜索
      </el-button>
    </div>
    <!-- 表格区域 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      row-key="ID"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="title" label="菜单名称" :show-overflow-tooltip="true" width="180px" />
      <el-table-column prop="icon" label="图标" align="center" width="100px">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="60px" />
      <el-table-column prop="path" label="路由名称" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路由路径" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="visible" label="可见" width="80">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.hidden === 0 ? 'danger' : 'success'"
            disable-transitions
          >{{ visibleFormat(scope.row.hidden) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.CreatedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="" width="200">
        <template slot-scope="scope">
          <el-button
            v-permission="['api:menu:updateMenu']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row.ID)"
          >修改</el-button>
          <el-button
            v-permission="['api:menu:addMenu']"
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleCreate(scope.row.ID)"
          >新增</el-button>
          <el-button
            v-permission="['api:menu:deleteMenu']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row.ID)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <!-- 新增修改弹框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :before-close="cancel">
      <el-form ref="formMenu" :model="form" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item prop="parentId">
          <span slot="label">
            上级菜单
            <el-tooltip content="指当前菜单停靠的菜单归属" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <treeselect
            v-model="form.parentId"
            :options="menuOptions"
            :normalizer="normalizer"
            :show-count="true"
            placeholder="选择上级菜单"
          />
        </el-form-item>
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="菜单图标">
          <el-popover
            placement="bottom-start"
            width="460"
            trigger="click"
            @show="$refs['iconSelect'].reset()"
          >
            <IconSelect ref="iconSelect" @selected="selected" />
            <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly>
              <svg-icon
                v-if="form.icon"
                slot="prefix"
                :icon-class="form.icon"
                class="el-input__icon"
                style="height: 32px;width: 16px;"
              />
              <i v-else slot="prefix" class="el-icon-search el-input__icon" />
            </el-input>
          </el-popover>
        </el-form-item>
        <el-form-item prop="name">
          <span slot="label">路由名称
            <el-tooltip content="需要和页面name保持一致，对应页面即可选择缓存" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <el-input v-model="form.name" placeholder="请输入路由名称" />
        </el-form-item>
        <el-form-item prop="component">
          <span slot="label">组件路径
            <el-tooltip content="菜单对应的具体vue页面文件路径views的下级路径/admin/sys-api/index；目录类型：填写Layout，如何有二级目录请参照日志目录填写；" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <el-input v-model="form.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item prop="path">
          <span slot="label">路由地址
            <el-tooltip content="访问此页面自定义的url地址，建议/开头书写，例如 /app-name/menu-name" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <el-input v-model="form.path" placeholder="请输入路由地址" />
        </el-form-item>
        <el-form-item label="是否显示">
          <el-radio-group v-model="form.hidden">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="sort">
          <span slot="label">显示排序</span>
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel"> 取消 </el-button>
        <el-button type="primary" @click="submitForm"> 提交 </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>

import { listMenu, delMenu, listMenuTree, addMenu, getMenuInfo, updateMenu } from '@/api/sys-menu'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import IconSelect from '@/components/IconSelect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import Treeselect from '@riophae/vue-treeselect'

export default {
  name: 'MenuList',
  components: { Pagination, IconSelect, Treeselect },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: [],
      menuOptions: [],
      total: 0,
      listLoading: false,
      dialogFormVisible: false,
      dialogStatus: '',
      listQuery: {
        page: 1,
        limit: 20,
        title: '',
        sort: 'id'
      },
      form: {
        ID: 0,
        parentId: 0,
        title: '',
        name: '',
        path: '',
        component: '',
        hidden: 1,
        sort: 0,
        icon: ''
      },
      textMap: {
        update: '修改菜单',
        create: '新增菜单'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 转换菜单数据结构
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      // 去掉children=null的属性
      if (node.children == null || node.children === 'null') {
        delete node.children
      }
      return {
        id: node.ID,
        label: node.title,
        children: node.children
      }
    },
    // 查询菜单下拉树结构
    getTreeselect() {
      listMenuTree().then(response => {
        this.menuOptions = []
        const menu = { ID: 0, title: '主类目', children: [] }
        menu.children = response.data.list
        this.menuOptions.push(menu)
      })
    },
    // 取消按钮
    cancel () {
      this.reset()
      this.dialogFormVisible = false
    },
    // 表单重置
    reset() {
      this.resetForm('formMenu')
      this.form = {
        ID: 0,
        parentId: 0,
        title: '',
        name: '',
        path: '',
        component: '',
        hidden: 1,
        sort: 0,
        icon: ''
      }
    },
    // 选择图标
    selected(name) {
      this.form.icon = name
    },
    // 新增按钮
    handleCreate(id) {
      this.reset()
      this.getTreeselect()
      this.dialogStatus = 'create'
      if (id != null) {
        this.form.parentId = id
      }
      this.dialogFormVisible = true
    },
    // 菜单列表
    getList() {
      this.listLoading = true
      listMenu(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    // 搜索
    handleQuery() {
      this.getList()
    },
    // 菜单显示状态字典翻译
    visibleFormat(hidden) {
      return hidden ? '显示' : '隐藏'
    },
    // 删除菜单
    handleDelete(id) {
      this.$confirm('是否确认删除数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        console.log(id)
        return delMenu({ 'id': id })
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
    // 更新菜单
    handleUpdate(id) {
      this.reset()
      this.getTreeselect()
      getMenuInfo({ 'id': id }).then(response => {
        this.form = response.data.list
        this.dialogFormVisible = true
        this.dialogStatus = 'update'
      })
    },
    // 表单提交
    submitForm() {
      this.$refs.formMenu.validate(valid => {
        if (valid) {
          if (this.form.ID !== 0) {
            updateMenu(this.form).then(response => {
              if (response.code === 1000) {
                this.msgSuccess(response.data)
                this.dialogFormVisible = false
                this.getList()
              } else {
                this.msgError(response.data)
              }
            })
          } else {
            addMenu(this.form).then(response => {
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
</style>
