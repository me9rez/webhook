# WebHook Server

一个轻量级的WebHook服务器，可以通过HTTP请求触发系统命令执行。

## 功能特性

- 通过配置文件定义WebHook
- 支持GET和POST请求触发命令执行
- 将请求参数作为环境变量传递给命令
- 健康检查端点
- 详细的日志记录
- 完整的错误处理和配置验证
- 优雅关闭机制

## 安装依赖

```bash
bun install
```

## 配置

创建 `hooks.json` 文件来定义你的WebHook：

```json
[
  {
    "id": "example",
    "execute-command": "echo Hello World",
    "command-working-directory": "/path/to/working/directory"
  }
]
```

每个Hook配置项说明：
- `id`: WebHook的唯一标识符，将作为URL路径的一部分
- `execute-command`: 要执行的命令
- `command-working-directory`: 命令执行的工作目录

## 运行

```bash
bun run src/index.ts
```

### 命令行参数

- `--hooks`: WebHook配置文件路径 (默认: "hooks.json")
- `--port`: 监听端口 (默认: 3000)

示例：
```bash
bun run src/index.ts --hooks ./my-hooks.json --port 8080
```

## 使用

### 触发WebHook

对于ID为`example`的WebHook：

**GET请求**:
```bash
curl "http://localhost:3000/hooks/example?param1=value1&param2=value2"
```

**POST请求**:
```bash
curl -X POST http://localhost:3000/hooks/example \
  -H "Content-Type: application/json" \
  -d '{"param1": "value1", "param2": "value2"}'
```

请求参数会作为环境变量传递给执行的命令。

### 健康检查

```bash
curl http://localhost:3000/health
```

## 日志

服务器会输出不同级别的日志信息：
- INFO: 一般信息，如服务器启动、请求处理等
- WARN: 警告信息，如404请求
- ERROR: 错误信息，如命令执行失败
- DEBUG: 调试信息

## 项目结构

- `src/index.ts`: 入口文件，处理命令行参数和服务器启动
- `src/server.ts`: Web服务器实现
- `src/types.ts`: TypeScript类型定义
- `src/utils.ts`: 工具函数
- `src/logger.ts`: 日志记录器

## 技术栈

- [Bun](https://bun.sh/): JavaScript运行时
- [Hono](https://hono.dev/): 轻量级Web框架
- [execa](https://github.com/sindresorhus/execa): 进程执行库
- [cleye](https://github.com/privatenumber/cleye): 命令行参数解析库

