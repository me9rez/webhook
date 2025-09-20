import * as _hono_node_server0 from "@hono/node-server";

//#region src/types.d.ts
interface HookItemConfig {
  id: string;
  "execute-command": string;
  "command-working-directory": string;
}
type HooksArray = HookItemConfig[];
//#endregion
//#region src/server.d.ts
declare function createServer(hooks: HooksArray, port?: number): _hono_node_server0.ServerType;
//#endregion
//#region src/utils.d.ts
/**
 * 验证钩子配置数组
 * @param hooks 钩子配置数组
 * @returns 验证错误信息数组，如果没有错误则为空数组
 */
declare function validateHooksConfig(hooks: any): string[];
/**
 * 验证端口号
 * @param port 端口号
 * @returns 验证错误信息，如果验证通过则为null
 */
declare function validatePort(port: number): string | null;
//#endregion
export { type HookItemConfig, type HooksArray, createServer, validateHooksConfig, validatePort };