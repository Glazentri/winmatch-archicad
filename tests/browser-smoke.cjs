/* Optional Chromium UI smoke test. Requires Playwright installed separately. */
const { chromium }=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const fs=require('node:fs/promises');
const os=require('node:os');
const ExcelJS=require('../vendor/exceljs.min.js');
(async()=>{
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'winmatch-ac-'));
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({acceptDownloads:true,viewport:{width:1280,height:900}});
  const errors=[],external=[];
  page.on('pageerror',err=>errors.push(err.message));
  page.on('request',req=>{if(/^https?:/.test(req.url()))external.push(req.url())});
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  await page.locator('#schedule').setInputFiles(path.join(__dirname,'../examples/schedule.csv'));
  await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Schedule loaded'));
  await page.locator('#preview').click();
  await page.waitForFunction(()=>document.getElementById('status').textContent.includes('2 opening rows ready'));
  assert.equal(await page.locator('#import-preview tbody tr').count(),2);
  let pending=page.waitForEvent('download');await page.locator('#download-project').click();let download=await pending;
  const jsonPath=path.join(temp,'sample.json');await download.saveAs(jsonPath);
  assert.equal(JSON.parse(await fs.readFile(jsonPath,'utf8')).rows[0].width,1800);
  await page.locator('#schedule').setInputFiles(path.join(__dirname,'../examples/schedule.xlsx'));
  await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Schedule loaded') && document.querySelectorAll('#sheet option').length===2);
  await page.locator('#preview').click();
  await page.waitForFunction(()=>document.getElementById('status').textContent.includes('2 opening rows ready'));
  pending=page.waitForEvent('download');await page.locator('#download-project').click();download=await pending;await download.saveAs(jsonPath);
  const p=JSON.parse(await fs.readFile(jsonPath,'utf8'));p.rows[0].frameColour='Pearl White';p.rows[0].notes='Reviewed example';
  await fs.writeFile(jsonPath,JSON.stringify(p));
  await page.locator('#reviewed-project').setInputFiles(jsonPath);
  await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Reviewed project loaded'));
  await page.locator('#confirm-properties').check();
  await page.locator('#preview-return').click();
  await page.waitForFunction(()=>document.getElementById('status').textContent.includes('2 changed property cells'));
  assert.equal(await page.locator('#return-preview tbody tr').count(),2);
  pending=page.waitForEvent('download');await page.locator('#download-return').click();download=await pending;const result=path.join(temp,'returned.xlsx');await download.saveAs(result);
  const wb=new ExcelJS.Workbook();await wb.xlsx.load(await fs.readFile(result));
  assert.equal(wb.getWorksheet('Schedule').getCell('K2').value,'Pearl White');
  assert.equal(wb.getWorksheet('Schedule').getCell('D2').value,1200);
  assert.equal(wb.getWorksheet('Unchanged').getCell('A1').value,'Unaffected workbook content');
  assert.equal(wb.getWorksheet('Schedule').getColumn(2).hidden,true);
  for(const width of [1280,768,375,320]){
   await page.setViewportSize({width,height:900});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page overflow at '+width);
  }
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('PASS: offline file URL, CSV → JSON, XLSX → JSON → reviewed XLSX, hidden column, no external requests and responsive widths 320–1280.');
 }finally{await browser.close();await fs.rm(temp,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1});
