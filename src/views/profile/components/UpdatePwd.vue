<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="Password">
      <el-input v-model="user.Password" placeholder="请输入旧密码" type="Password" />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="user.newPassword" placeholder="请输入新密码" type="newPassword" />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" placeholder="请确认密码" type="confirmPasswords" />
    </el-form-item>
    <el-form-item>
      <el-button v-permission="['api:user:editPassword']" type="primary" size="mini" @click="submit">保存</el-button>
      <el-button v-permission="['api:user:editPassword']" type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { resetUserPwd } from '@/api/sys-user'
export default {
  props: {
    // eslint-disable-next-line vue/require-default-prop
    user: { type: Object }
  },
  data () {
    const equalToPassword = (rule, value, callback) => {
      if (this.user.newPassword !== value) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    return {
      oldPassword: undefined,
      newPassword: undefined,
      confirmPassword: undefined,
      rules: {
        oldPassword: [
          { required: true, message: '旧密码不能为空', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '新密码不能为空', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '确认密码不能为空', trigger: 'blur' },
          { required: true, validator: equalToPassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const param = {
            'user_id': this.user.ID,
            'is_old_pwd': '0',
            'password': this.user.Password,
            'newPassword': this.user.newPassword
          }
          resetUserPwd(param).then(
            response => {
              if (response.code === 1000) {
                this.msgSuccess(response.data)
              } else {
                this.msgError(response.data)
              }
            }
          )
        }
      })
    },
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ path: '/dashboard' })
    }
  }
}
</script>
