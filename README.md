# SJTUcontest
前端在frontend文件夹下，后端在backend文件夹下

if 你不太了解git：[简介 - Git教程 - 廖雪峰的官方网站 (liaoxuefeng.com)](https://liaoxuefeng.com/books/git/introduction/index.html)

## Git 分支规划

- **main（或 master）**
   存放已发布的生产环境代码。该分支始终保持稳定状态，不允许直接提交开发代码。
- **develop**
   作为开发集成分支，所有的新功能、改动都先合并到此分支，经测试通过后再合并到 main 分支。
- **feature 分支**（分前后端）
   针对每个新功能或者改进，从 develop 分支上拉出一个 feature 分支，命名规范建议为：
   `feature/功能描述`
   例如：`feature/backend_user-authentication` 或 `feature/frontend_team-creation`
   开发完成后，使用 Pull Request（或 Merge Request）的方式将 feature 分支合并回 develop 分支。

**建议git commit 语句规范一些，可以借助IDE的一些插件，例如vscode的git-commit-plugin,pycharm自带的gitcommit功能等等**

