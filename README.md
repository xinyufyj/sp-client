## 1. 介绍
算盘客户端脚手架 sp-client 用于快速的创建客户端。

## 2. 安装
下载该项目，执行 

> npm install

安装好依赖，执行

> npm link

命令 `sp-client` 就可以使用了

## 3. 使用
sp-client 需要如下环境：
> 1. nodejs >= 14.0
> 2. @vue/cli >= 4.0

在 suanpan-web 项目的根目录下执行
> sp-client create

安装的过程中会提示 `There are uncommitted changes in the current repository, it's recommended to commit or stash them first.` 输入 `y` 即可。

安装需要花费一点时间，请耐心等待☕。成功创建后，在 suanpan-web 根目录下会看到 `electron` 文件夹，进入执行
> npm run electron:serve

可以以开发模式运行 electron

在 suanpan-web 中更新了代码后，可以执行
> sp-client update --build

同步更新到 electron 中

打包 electron, 可以执行
> npm run electron:build

## 4. 说明
1. 目前该项目还处于开发阶段，后期会做很多改动
2. 要想正常启动客户端，还需对 suanpan-web 项目稍加改动，请参考： 