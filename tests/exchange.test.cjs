const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const {createHash} = require('node:crypto');
require('../archicad-exchange-engine.js');
const E=globalThis.WinMatchArchicad;
const ExcelJS=require('../vendor/exceljs.min.js');
const input=fs.readFileSync(path.join(__dirname,'../examples/schedule.csv'),'utf8');
const data=E.delimited(input,',');
const mapping={id:0,sourceId:1,kind:2,height:3,width:4,qty:5,floor:6,room:7,glazing:8,glazingColour:9,frameColour:10,notes:11};
const options={sourceHash:'fictional-source-hash',sheet:'Schedule',headerRow:1,lastRow:3,units:'mm',defaultKind:'Window',projectName:'Test',mapping};
function project(table=data, extra={}) { return E.project(table,{...options,...extra}); }
function reviewed(p) { p.rows[0].glazingLayers='Double';p.rows[0].glazing='Clear';p.rows[0].frameColour='Pearl White';p.rows[0].notes='Reviewed example';return p; }
const returnOptions={sourceHash:options.sourceHash,sheet:options.sheet,confirmTextProperties:true,mapping:{glazing:8,glazingColour:9,frameColour:10,notes:11}};
test('CSV parsing including quoted content and escaped quotes',()=>{
 assert.deepEqual(E.delimited('\uFEFFA,B\r\n"first, second","say ""hello"""\r\n',','),[['A','B'],['first, second','say "hello"']]);
 assert.throws(()=>E.delimited('A,"unclosed',','),/Unclosed/);
 assert.deepEqual(E.delimited('A\tB\n1\t2','\t'),[['A','B'],['1','2']]);
});
test('two opening types and expected v1 JSON with unique metadata',()=>{
 const p=project();assert.equal(p.version,1);assert.equal(p.rows.length,2);assert.equal(p.rows[0].height,1200);assert.equal(p.rows[1].kind,'Door');assert.equal(p.rows[0].archicad.sourceId,'example-window-guid-01');assert.equal(p.rows[1].archicad.sourceRow,3);assert.equal(p.rows[0].confirmed,false);assert.equal(p.rows[0].clearH,0);assert.equal(p.rows[0].config,'');
});
test('converts metres and inches only from explicit selection',()=>{
 const t=[data[0],[...data[1]]];t[1][3]='1.2';t[1][4]='1.8';assert.equal(project(t,{lastRow:2,units:'m'}).rows[0].width,1800);t[1][3]='48';t[1][4]='72';assert.ok(Math.abs(project(t,{lastRow:2,units:'in'}).rows[0].width-1828.8)<0.0001);
});
test('rejects duplicate opening IDs and invalid dimensions',()=>{
 const bad=[data[0],[...data[1]],[...data[1]]];assert.throws(()=>project(bad),/Duplicate/);
 const one=[data[0],[...data[1]]];one[1][3]='1200 mm';assert.throws(()=>project(one,{lastRow:2}),/invalid dimensions/);
});
test('return maps only selected text, protected ids/size and unchanged blank/TBC values',()=>{
 const p=reviewed(project());p.rows[1].notes='';const plan=E.returnPlan(data,p,returnOptions);
 assert.deepEqual(plan.changes.map(c=>[c.row,c.column,c.after]),[[2,9,'Double'],[2,10,'Clear'],[2,11,'Pearl White'],[2,12,'Reviewed example']]);assert.equal(plan.matched,2);
 assert.throws(()=>E.returnPlan(data,p,{...returnOptions,mapping:{notes:0}}),/identifiers and dimension/);
 assert.throws(()=>E.returnPlan(data,p,{...returnOptions,mapping:{notes:3}}),/identifiers and dimension/);
 assert.throws(()=>E.returnPlan(data,p,{...returnOptions,sourceHash:'other'}),/identity does not match/);
 assert.throws(()=>E.returnPlan(data,p,{...returnOptions,confirmTextProperties:false}),/Confirm/);
});
test('rejects grouped rows and duplicate returned identity',()=>{
 let p=reviewed(project());p.rows[0].qty=2;assert.throws(()=>E.returnPlan(data,p,returnOptions),/quantity 1/);
 p=reviewed(project());p.rows.push({...p.rows[0]});assert.throws(()=>E.returnPlan(data,p,returnOptions),/Duplicate source/);
});
test('unrelated rows skipped; changed source ID rejected',()=>{
 let p=reviewed(project());p.rows.push({kind:'Window',qty:1,id:'New'});assert.equal(E.returnPlan(data,p,returnOptions).skipped,1);
 const modified=data.map(r=>[...r]);modified[1][1]='changed';assert.throws(()=>E.returnPlan(modified,p,returnOptions),/Original element identity changed/);
});
test('original XLSX round trip preserves IDs, dimensions, hidden column, styles and other sheet',async()=>{
 const bytes=fs.readFileSync(path.join(__dirname,'../examples/schedule.xlsx'));const hash=createHash('sha256').update(bytes).digest('hex');
 const original=new ExcelJS.Workbook();await original.xlsx.load(bytes);const ws=original.getWorksheet('Schedule');
 const tbl=Array.from({length:ws.rowCount},(_,r)=>Array.from({length:ws.columnCount},(_,c)=>ws.getCell(r+1,c+1).value));
 const p=reviewed(E.project(tbl,{...options,sourceHash:hash}));
 const plan=E.returnPlan(tbl,p,{...returnOptions,sourceHash:hash});
 const copy=new ExcelJS.Workbook();await copy.xlsx.load(bytes);
 for(const c of plan.changes)copy.getWorksheet('Schedule').getCell(c.row,c.column).value=c.after;
 const returned=new ExcelJS.Workbook();await returned.xlsx.load(await copy.xlsx.writeBuffer());
 const result=returned.getWorksheet('Schedule');assert.equal(result.getCell('A2').value,'W01');assert.equal(result.getCell('D2').value,1200);assert.equal(result.getCell('E2').value,1800);assert.equal(result.getCell('K2').value,'Pearl White');assert.equal(result.getColumn(2).hidden,true);assert.equal(result.getCell('A1').font.bold,true);assert.equal(returned.getWorksheet('Unchanged').getCell('A1').value,'Unaffected workbook content');assert.equal(ws.getCell('K2').value,'TBC');
});
