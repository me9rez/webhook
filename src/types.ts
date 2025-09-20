export interface HookItemConfig {
  id: string
  "execute-command": string
  "command-working-directory": string
}

export type HooksArray = HookItemConfig[]

// 服务器配置接口
export interface ServerConfig {
  port: number
  hooksFile: string
}

// 执行结果接口
export interface ExecutionResult {
  code: number
  data: string
}

// 验证错误信息
export interface ValidationError {
  field: string
  message: string
}