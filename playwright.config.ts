import {defineConfig,devices} from '@playwright/test';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
const local=existsSync('.qa-browser/chromium')?resolve('.qa-browser/chromium'):undefined;
export default defineConfig({testDir:'./tests/e2e',outputDir:process.env.TEST_ARTIFACTS_DIR??'test-results',timeout:60000,fullyParallel:false,workers:1,reporter:[['list'],['json',{outputFile:process.env.TEST_REPORT_FILE??'docs/playwright-results.json'}],['html',{outputFolder:process.env.TEST_HTML_DIR??'playwright-report',open:'never'}]],use:{baseURL:process.env.TEST_BASE_URL??'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure',headless:true,launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH??local,args:local?['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--disable-gpu-sandbox']:[]}},projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}]});
