import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig(({mode})=>({plugins:[react(),tailwindcss()],build:mode==='standalone'?{outDir:'standalone-dist',rollupOptions:{output:{inlineDynamicImports:true}}}:undefined,test:{environment:'jsdom',setupFiles:['./tests/setup.ts'],include:['tests/**/*.test.{ts,tsx}']}}));
