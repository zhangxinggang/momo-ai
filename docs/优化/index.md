## 2026-05-13

1. 将momo-server所有文件的类型，请按模块提取到types目录下

## 2026-05-14

1. 请把apps\skill-platform\src\renderer\components\Prompt\AiTestModal\index.tsx，ai问答，可能涉及其他文件，独立成一个项目， momo-aichat，包名 `@momo/aichat`
2. ai问答对话，使用通用的对话交互，aichat，提供参数配置，支持用户输入文本，上传文件，多轮对话
3. 用户输入的内容在输出区域的左侧，ai回复的在右侧
4. 左上角使用一个icon+名称（参数配置传入，有默认值），右侧有个新建会话按钮，导出按钮（导出对话的markdown）

## 2026-05-18

1. apps/skill-platform中sqlite，请使用apps/electron/src/main/database/index.ts，如果还有公共的代码，可以提取到apps/electron/src/main/database中；
2. 在apps/electron中，执行 electron:dev 报错，Error: Electron failed to install correctly, please delete node_modules/electron and try installing again
    at c (D:\work\source\zhangxg\momo-ai-demo\apps\electron\dist\src\index-BYKvHCku.cjs:1:361)
    at a (D:\work\source\zhangxg\momo-ai-demo\apps\electron\dist\src\index-BYKvHCku.cjs:1:482)；执行  electron-fix start 也是一样的错误；但是在 skill-platform中执行 electron:dev 就不会报错
3. 技能模块，SkillHub 商店，数据请从接口，https://api.skillhub.cn/api/skills?page=1&pageSize=24&sortBy=score&order=desc&keyword=ppt 中获取，其中keyword为用户搜索的关键词
4. apps/electron，添加 打包系统有权限命令
（1）package.json添加环境变量，是否需要权限，无权限则现有打包逻辑；
（2）当有权限时，执行以下操作
- 先查询数据库表，软件授权表，该表存储授权记录，字符串，1000个字符长度
- 查询到记录，每一条都使用 DiffieHellman解密，查看时间是否过期
- 如果时间过期，则electron加载授权页面
- 授权页面请放置到apps/electron/static/license.html中，页面中，头部为用户的mac地址，使用node-machine-id获取，供用户复制，输入框，则需要用户输入的授权码字段，确认按钮，点击确认后，先校验时间，通过后，将授权字符串存入授权表
- 生成授权码的页面为  apps/electron/static/setAuth.html，两个输入框，一个是输入用户的mac地址，第二个是选择授权的时间段，默认从当前时间到半年后，点击授权，生成授权码（调用 /system_api/generateAuth）
