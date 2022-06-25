<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">
        <el-col :span="6" :xs="24">
          <user-card :user="user" />
        </el-col>
        <el-col :span="18" :xs="24">
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="基本信息" name="userinfo">
                <UserInfoTxt :user="user" />
              </el-tab-pane>
              <el-tab-pane label="修改密码" name="editpwd">
                <UpdatePwdTxt :user="user" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>

import { mapGetters } from 'vuex'
import UserCard from './components/UserCard'
import UserInfoTxt from './components/UserInfo'
import UpdatePwdTxt from './components/UpdatePwd'
import { getInfo } from '@/api/user'

export default {
  name: 'Profile',
  components: { UserCard, UserInfoTxt, UpdatePwdTxt },
  data() {
    return {
      user: {},
      activeTab: 'userinfo'
    }
  },
  computed: {
    ...mapGetters([
      'userName',
      'headerImg',
      'roles'
    ])
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      getInfo().then(response => {
        this.user = response.data
      }).catch(error => {
        console.log(error)
      })
    }
  }
}
</script>
<style>
  .list-group-item{
    padding: 18px 0;
  }

.list-group-striped > .list-group-item {
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  padding-left: 0;
  padding-right: 0;
}

.list-group {
  padding-left: 0px;
  list-style: none;
}

.list-group-item {
  border-bottom: 1px solid #e7eaec;
  border-top: 1px solid #e7eaec;
  margin-bottom: -1px;
  padding: 11px 0px;
  font-size: 13px;
}

.pull-right {
  float: right !important;
}

.el-card__header {
  padding: 14px 15px 7px;
  min-height: 40px;
}

.el-card__body {
  padding: 15px 20px 20px 20px;
}

.card-box {
  padding-right: 15px;
  padding-left: 15px;
  margin-bottom: 10px;
}

/* text color */
.text-navy {
  color: #1ab394;
}

.text-primary {
  color: inherit;
}

.text-success {
  color: #1c84c6;
}

.text-info {
  color: #23c6c8;
}

.text-warning {
  color: #f8ac59;
}

.text-danger {
  color: #ed5565;
}

.text-muted {
  color: #888888;
}

/* image */
.img-circle {
  border-radius: 50%;
}

.img-lg {
  width: 120px;
  height: 120px;
}

.avatar-upload-preview {
  position: absolute;
  top: 50%;
  transform: translate(50%, -50%);
  width: 180px;
  height: 180px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;
  overflow: hidden;
}

.el-tabs__item {
  font-size: 13px;
}

.delete-popconfirm{
  margin-left: 10px;
  }
    .svg-icon{
    margin-right: 5px;
  }
</style>
