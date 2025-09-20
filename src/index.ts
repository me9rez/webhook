import { cli } from 'cleye'
import { createServer } from './server'
import { validateHooksConfig, validatePort } from './utils'
import { logger } from './logger'
import path from 'path'
import fs from 'fs/promises'

/**
 * 主函数，处理命令行参数并启动服务器
 */
async function main() {
  try {
    // 解析命令行参数
    const argv = cli({
      name: "webhook",
      flags: {
        hooks: {
          type: String,
          description: "webhook定义文件路径",
          default: "hooks.json"
        },
        port: {
          type: Number,
          description: "监听端口",
          default: 3000
        }
      }
    })

    // 验证端口
    const portError = validatePort(argv.flags.port)
    if (portError) {
      logger.error(`端口验证失败: ${portError}`)
      process.exit(1)
    }

    // 读取配置文件
    const realPath = path.join(process.cwd(), argv.flags.hooks)
    logger.info(`正在读取配置文件: ${realPath}`)
    
    const jsonFileContent = await fs.readFile(realPath, 'utf-8')
    const hooks = JSON.parse(jsonFileContent)
    
    // 验证配置
    const validationErrors = validateHooksConfig(hooks)
    if (validationErrors.length > 0) {
      logger.error('配置文件验证失败:')
      validationErrors.forEach(error => logger.error(`- ${error}`))
      process.exit(1)
    }
    
    const port = argv.flags.port

    // 启动服务器
    logger.info(`使用端口 ${port} 启动服务器`)
    const serve = createServer(hooks, port)
    
    // 优雅关闭
    process.on('SIGINT', () => {
      logger.info('\n正在关闭服务器...')
      serve.close(() => {
        logger.info('服务器已关闭')
        process.exit(0)
      })
    })
  } catch (error: any) {
    logger.error('启动服务器时发生错误:', error.message)
    process.exit(1)
  }
}

await main()