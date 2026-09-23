# 接通账号与云端同步

当前默认云端未配置；访客模式可用，不能据此声称登录同步已经上线。

## 1. 选择项目

使用已授权且允许本网站存储数据的 Supabase 项目。推荐独立项目；不要复用其他网站的管理员密钥。可以通过已连接的 Supabase 工具完成，或由项目所有者在控制台操作。

在 SQL Editor 运行本目录 `schema.sql`。它只创建 `public.kaoyan_records` 和 `public.kaoyan_put_record`，启用账号隔离 RLS。不要关闭 RLS。

## 2. 配置 Auth

启用 Email/Password。网站提供注册、登录、密码重设和退出。正式个人使用可以先由管理员创建需要的用户，再关闭公开注册；前端的注册按钮是否成功由真实 Auth 配置决定。

Site URL 设置为 `https://bert-lynn.github.io/kaoyanfuxi/`，并将该地址加入允许的 Redirect URLs。需要邮箱验证或密码重设时，配置能向实际用户投递邮件的 SMTP。Supabase 内置邮件服务存在收件人/频率限制，不应把“发起请求成功”当成“邮件必定已送达”。

官方资料：
- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/redirect-urls

## 3. 配置 GitHub Actions

在 `Bert-Lynn/kaoyanfuxi` 的 Settings → Secrets and variables → Actions → Variables 添加：

- `SUPABASE_URL`：项目 HTTPS URL。
- `SUPABASE_PUBLISHABLE_KEY`：publishable key（或 legacy anon key）。

**这两项是公开前端配置，不是数据库管理凭据。禁止使用 secret/service_role key。**构建脚本会拒绝可识别的非公开密钥。安全隔离靠数据库 RLS 和登录 JWT，不靠把前端 key 藏起来。

执行 Actions → Test and deploy Study Desk → Run workflow。工作流将配置生成在构建产物 `config.js`，不写入用户数据。Pages 发布源保持 GitHub Actions。

官方资料：
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/database/functions
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## 4. 必须做的真实验收

先导出当前浏览器备份。以同一账号在电脑和手机登录，明确导入访客数据，在电脑完成任务后检查手机数据。再测试计时结束记录、题目作答、笔记与题库导入。用另一个账号验证看不到前一个账号的数据。

暂时断网编辑，再联网应显示同步过程而不是丢失更改。两台设备同时改同一条记录时应进入冲突处理，提供本机/云端两份版本，不应无提示整库覆盖。退出后访客页不得显示已登录账号的私有题库。

自动刷新间隔为可见页面约 15 秒，另在修改、联网和切回页面时尝试同步；不是承诺离线也能实时同步。运行中计时器不跨设备同步，结束记录才同步。

## 5. 真题题库

网站的数据菜单可下载 JSON 模板并导入。需要 `subject`、`stem`、`options`、零起始答案索引数组 `answer`、`explanation`；逐字真题用 `kind:"past"`，另提供 `year`、`number`、`source.title`。单选答案如 `[1]`，多选如 `[0,2]`。

导入内容的真题身份由用户所给资料声明，页面标记未独立核验。不能把原创题简单改标签当真题。仅导入拥有合法使用权限的资料。英语 2022/2024/2026 默认排除随机题与搜索，以保护考前模拟。
