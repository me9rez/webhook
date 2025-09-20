# 🚀 WebHook Server

一个轻量级、高性能的WebHook服务器，可以通过HTTP请求触发系统命令执行。适用于自动化部署、数据同步、系统维护等多种场景。⚡

## ✨ 功能特性

- 📝 通过JSON配置文件灵活定义多个WebHook
- 🔄 同时支持GET和POST请求方式触发命令执行
- 🔧 自动将请求参数作为环境变量传递给执行的命令
- 🏥 提供健康检查端点，便于监控服务状态
- 📊 多级日志记录系统（INFO、WARN、ERROR、DEBUG）
- 🛡️ 完善的配置验证和错误处理机制
- 🎯 支持优雅关闭，确保进程平滑退出
- 📦 作为Node.js模块可集成到其他项目中

## 📋 目录结构

```text
├── src/             # 源代码目录
│   ├── cli.ts       # 命令行入口文件
│   ├── index.ts     # 模块导出文件
│   ├── server.ts    # Web服务器实现
│   ├── types.ts     # TypeScript类型定义
│   ├── utils.ts     # 工具函数（配置验证等）
│   └── logger.ts    # 日志记录器实现
├── hooks.json       # 默认WebHook配置文件
├── package.json     # 项目配置和依赖
├── tsconfig.json    # TypeScript配置
└── README.md        # 项目说明文档
```

## 🛠️ 技术栈

- [Bun](https://bun.sh/): 高性能JavaScript运行时（也支持Node.js环境）
- [Hono](https://hono.dev/): 轻量级、高性能Web框架
- [execa](https://github.com/sindresorhus/execa): 增强的进程执行库
- [cleye](https://github.com/privatenumber/cleye): 简洁的命令行参数解析库
- [TypeScript](https://www.typescriptlang.org/): 静态类型检查

## 📦 安装

```bash
# 使用pnpm安装
pnpm install @me9rez/webhook
```

## ⚙️ 配置

创建或修改 `hooks.json` 文件来定义WebHook：

```json
[
  {
    "id": "example",
    "execute-command": "echo Hello World",
    "command-working-directory": "."
  },
  {
    "id": "deploy-app",
    "execute-command": "git pull && npm install && npm run build",
    "command-working-directory": "/path/to/your/app"
  }
]
```

### 配置项说明

| 配置项 | 类型 | 必须 | 说明 |
|--------|------|------|------|
| `id` | 字符串 | 是 | WebHook的唯一标识符，将作为URL路径的一部分 |
| `execute-command` | 字符串 | 是 | 接收到请求时要执行的系统命令 |
| `command-working-directory` | 字符串 | 是 | 命令执行的工作目录路径 |

## 🚀 运行

### 使用命令行参数

```bash
webhook --hooks ./my-hooks.json --port 8080
```

可用参数：

- `--hooks`: WebHook配置文件路径 (默认: "hooks.json")
- `--port`: 服务器监听端口 (默认: 3000)

### 作为模块集成

```javascript
import { createServer } from '@me9rez/webhook';

// 定义hooks配置
const hooks = [
  {
    id: "example",
    "execute-command": "echo Hello World",
    "command-working-directory": "."
  }
];

// 启动服务器
const server = createServer(hooks, 3000);

// 优雅关闭（可选）
process.on('SIGINT', () => {
  server.close(() => {
    console.log('服务器已关闭');
  });
});
```

## 📋 使用指南

### 🔘 触发WebHook

对于ID为`example`的WebHook，可通过以下方式触发：

#### GET请求

```bash
curl "http://localhost:3000/hooks/example?param1=value1&param2=value2"
```

#### POST请求

```bash
curl -X POST http://localhost:3000/hooks/example \
  -H "Content-Type: application/json" \
  -d '{"param1": "value1", "param2": "value2"}'
```

### 参数传递

所有请求参数（无论是GET查询参数还是POST JSON数据）都会作为环境变量传递给执行的命令。参数名会被转换为大写，并添加前缀`HOOK_`。例如：

- `param1` 变为 `HOOK_PARAM1`
- `branch-name` 变为 `HOOK_BRANCH-NAME`

### 🏥 健康检查

使用健康检查端点监控服务器状态：

```bash
curl http://localhost:3000/health
```

正常响应：

```json
{
  "status": "ok",
  "timestamp": "2023-01-01T12:00:00.000Z"
}
```

## 📜 日志系统

服务器会输出不同级别的日志信息：

- ℹ️ **INFO**: 一般信息，如服务器启动、请求处理、命令执行状态等
- ⚠️ **WARN**: 警告信息，如404请求、配置问题等
- ❌ **ERROR**: 错误信息，如命令执行失败、服务器异常等
- 🐛 **DEBUG**: 调试信息，如健康检查请求详情等

## 🔧 开发指南

### 安装依赖

```bash
bun install
```

### 开发模式（自动重启）

```bash
bun run dev
```

### 构建项目

```bash
bun run build
```

构建后的文件将生成在`dist/`目录下。

## ❗ 注意事项

1. **安全考虑**：请谨慎配置可执行命令，避免执行危险操作
2. **权限问题**：确保运行服务器的用户有足够权限执行配置的命令
3. **路径配置**：`command-working-directory`建议使用绝对路径
4. **超时处理**：长时间运行的命令可能导致请求超时
5. **环境变量**：命令执行环境可能缺少某些用户环境变量

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📝 许可证

本项目采用MIT许可证 - 详见[LICENSE](LICENSE)文件

## 📞 联系

如有问题或建议，请在[GitHub Issues](https://github.com/me9rez/webhook/issues)中提出

