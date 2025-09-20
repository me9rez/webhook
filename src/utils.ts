import type { HooksArray, HookItemConfig } from './types'

/**
 * 验证钩子配置数组
 * @param hooks 钩子配置数组
 * @returns 验证错误信息数组，如果没有错误则为空数组
 */
export function validateHooksConfig(hooks: any): string[] {
  const errors: string[] = []
  
  // 检查是否为数组
  if (!Array.isArray(hooks)) {
    errors.push('配置必须是一个数组')
    return errors
  }
  
  // 检查每个钩子配置
  hooks.forEach((hook: HookItemConfig, index: number) => {
    const prefix = `钩子[${index}]`
    
    // 检查ID
    if (!hook.id) {
      errors.push(`${prefix}: 缺少必需字段 'id'`)
    } else if (typeof hook.id !== 'string') {
      errors.push(`${prefix}: 'id' 必须是字符串`)
    }
    
    // 检查执行命令
    if (!hook['execute-command']) {
      errors.push(`${prefix}: 缺少必需字段 'execute-command'`)
    } else if (typeof hook['execute-command'] !== 'string') {
      errors.push(`${prefix}: 'execute-command' 必须是字符串`)
    }
    
    // 检查工作目录
    if (!hook['command-working-directory']) {
      errors.push(`${prefix}: 缺少必需字段 'command-working-directory'`)
    } else if (typeof hook['command-working-directory'] !== 'string') {
      errors.push(`${prefix}: 'command-working-directory' 必须是字符串`)
    }
  })
  
  return errors
}

/**
 * 验证端口号
 * @param port 端口号
 * @returns 验证错误信息，如果验证通过则为null
 */
export function validatePort(port: number): string | null {
  if (!Number.isInteger(port)) {
    return '端口号必须是整数'
  }
  
  if (port < 1 || port > 65535) {
    return '端口号必须在 1-65535 范围内'
  }
  
  return null
}