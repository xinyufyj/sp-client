<template>
  <a-spin :spinning="loading">
    <div id="app">
      <div class="drag-wrap drag"></div>
      <img
        class="logo drag"
        :src="require('@@/assets/img/logo.png')"
        width="60"
      />
      <div class="window-controls no-drag">
        <div class="window-icon danger" @click="quit">
          <span class="client_iconfont icon-close"></span>
        </div>
      </div>
      <div class="form-container">
        <p class="title">雪浪算盘</p>
        <div class="form-wrap">
          <a-form-model ref="config" :model="config" :rules="rules">
            <a-form-model-item label="loginOrigin" prop="loginOrigin">
              <a-input style="width: 100%" placeholder="登录地址" v-model="config.loginOrigin" />
            </a-form-model-item>
            <a-form-model-item label="apiOrigin" prop="apiOrigin">
              <a-input style="width: 100%" placeholder="接口地址" v-model="config.apiOrigin" />
            </a-form-model-item>
            <a-form-model-item label="username" prop="username">
              <a-input style="width: 100%" placeholder="用户名" v-model="config.username" />
            </a-form-model-item>
            <a-form-model-item label="password" prop="password">
              <a-input-password style="width: 100%" placeholder="密码" v-model="config.password" />
            </a-form-model-item>
          </a-form-model>
        </div>
        <a-button
          class="connnect-btn"
          type="primary"
          @click="submitForm('config')"
        >
          连接
        </a-button>
      </div>
    </div>
  </a-spin>
</template>

<script>
export default {
  name: "App",
  data() {
    let validateLoginOrigin = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入登录地址"));
      } else {
        callback();
      }
    };
    let validateApiOrigin = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入接口地址"));
      } else {
        callback();
      }
    };
    let validateUsername = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入用户名"));
      } else {
        callback();
      }
    };
    let validatePassword = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        callback();
      }
    };
    return {
      config: {
        loginOrigin: "",
        apiOrigin: "",
        username: "",
        password: ""
      },
      rules: {
        loginOrigin: [
          { required: true, message: "请输入登录地址", trigger: "blur" },
          { validator: validateLoginOrigin, trigger: "change" },
        ],
        apiOrigin: [
          { required: true, message: "请输入接口地址", trigger: "blur" },
          { validator: validateApiOrigin, trigger: "change" },
        ],
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { validator: validateUsername, trigger: "change" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { validator: validatePassword, trigger: "change" },
        ]
      },
      loading: true,
    };
  },
  created() {
    window.ipcRenderer.invoke("config-get").then((config) => {
      this.config = config;
      this.loading = false;
    });
  },
  components: {},
  mounted() {},
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true;
          window.ipcRenderer
            .invoke("config-app", this.config)
            .then((res) => {
              window.ipcRenderer
                .invoke("config-set", this.config)
                .finally(() => {
                  window.ipcRenderer.send("login-over");
                });
            })
            .catch((err) => {
              this.$message.error("连接失败");
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    },
    quit() {
      window.ipcRenderer.send("window-close");
    },
  },
};
</script>

<style lang="less">
*, *::after, *::before {
  box-sizing: border-box;
  // margin: 0;
  // padding: 0;
  user-select: none;
  -webkit-user-drag: none;
  cursor: auto !important;
}
.drag {
  -webkit-app-region: drag;
}
.no-drag {
  -webkit-app-region: no-drag;
}
#app {
  width: 100vw;
  height: 100vh;
  user-select: none;
  background: url("~@@/assets/img/bg.png") no-repeat 50%;
  background-size: cover;
  position: relative;
  .logo {
    position: absolute;
    left: 10px;
    top: 10px;
  }
  .drag-wrap {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
  }
}
.ant-col.ant-form-item-label {
  display: none;
}
.ant-input, .ant-input-number-input {
  height: 34px !important;
  font-size: 16px !important;
}
.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;
  .title {
    font-size: 36px;
    color: rgb(0, 93, 151);
    font-weight: bold;
  }
}
.form-wrap {
  width: 50%;
  padding-top: 10px;
}
.window-controls {
  position: absolute;
  top: 0;
  right: 0;
  .window-icon {
    cursor: pointer;
    padding: 8px 16px;
    .client_iconfont {
      font-size: 13px;
      color: #333;
    }
    &:hover {
      background: rgba(0, 0, 0, 0.2);
    }
    &.danger:hover {
      background: red;
    }
  }
}
.connnect-btn {
  width: 200px; 
  background: rgb(0, 93, 151) !important;
  margin-top: 20px;
  outline: 0 !important;
  border: 0 !important;
}
</style>
