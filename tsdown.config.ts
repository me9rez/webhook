import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: ["./src/index.ts","./src/cli.ts"],
    exports: true,
    dts: true,
})