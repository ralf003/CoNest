// Package the already-built DSH snapshot and its installed runtime dependency graph.
// Source trees and package manifests remain unchanged. No credentials or user state.
import {createRequire} from 'node:module';
import {readFile,realpath,writeFile,readdir,lstat,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
const execute=promisify(execFile);
const bridge=fileURLToPath(new URL('..',import.meta.url));
if (!process.env.CONEST_DSH_SOURCE) throw Error('This optional full DSH Web distributor needs CONEST_DSH_SOURCE pointing to an independently built upstream checkout; the CoNest development SDK does not include DSH applications.');
const root=path.resolve(process.env.CONEST_DSH_SOURCE);
const output=path.join(bridge,'releases/ubuntu-demo');
const visited=new Map();
async function collect(dir){
 dir=await realpath(dir);if(visited.has(dir))return;
 if(!dir.startsWith(root+'/'))throw Error('Runtime dependency escaped the snapshot: '+dir);
 const manifest=JSON.parse(await readFile(path.join(dir,'package.json'),'utf8'));visited.set(dir,manifest);
 const require=createRequire(path.join(dir,'package.json'));
 for(const name of Object.keys({...manifest.dependencies,...manifest.optionalDependencies,...manifest.peerDependencies})){
  let target;
  for(const base of require.resolve.paths(name)??[]){try{target=await realpath(path.join(base,name));await readFile(path.join(target,'package.json'));break;}catch{target=undefined;}}
  if(target)await collect(target);else if(manifest.dependencies?.[name])throw Error('Missing dependency '+manifest.name+' -> '+name);
 }
}
await collect(path.join(root,'apps/cli'));await collect(path.join(root,'apps/web'));
const entries=new Set([...visited.keys()].filter(p=>p.includes('/node_modules/.pnpm/')).map(p=>p.split('/node_modules/.pnpm/')[1].split('/')[0]));
const blocked=new Set(['.git','.agents','.claude','.github','website','docs','coverage','.cache']);
function included(relative){
 const parts=relative.split(path.sep);
 if(parts.some(p=>blocked.has(p)||/^\.env(?:\.|$)/.test(p)||p==='.npmrc'))return false;
 const i=parts.indexOf('.pnpm');return i<0||!parts[i+1]||parts[i+1]==='node_modules'||entries.has(parts[i+1]);
}
const files=[];let bytes=0;
async function walk(dir,relative=''){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const rel=path.join(relative,entry.name);if(!included(rel))continue;
  const member=path.join(dir,entry.name);
  if(entry.isDirectory()){await walk(member,rel);continue;}
  if(entry.isSymbolicLink()){
   let target;try{target=await realpath(member);}catch{continue;}
   if(!target.startsWith(root+'/')||!included(path.relative(root,target)))continue;
  }else if(entry.isFile())bytes+=(await lstat(member)).size;else throw Error('Special file: '+rel);
  files.push('deepseek-harness/'+rel);
 }
}
await walk(root);await mkdir(output,{recursive:true});
const temp=await mkdtemp(path.join(os.tmpdir(),'conest-dsh-roster-'));
const archive=path.join(output,'dsh-web-demo-0.1.0-rc.5-linux-x64.tar.gz');
try{
 await writeFile(path.join(temp,'files'),files.sort().join('\0')+'\0');
 await execute('tar',['-C',path.dirname(root),'--null','--verbatim-files-from','--no-recursion','-T',path.join(temp,'files'),'-czf',archive],{maxBuffer:1000000,timeout:180000});
 const digest=createHash('sha256').update(await readFile(archive)).digest('hex');
 await writeFile(archive+'.sha256',`${digest}  ${path.basename(archive)}\n`);
 await writeFile(path.join(output,'dsh-runtime-provenance.json'),JSON.stringify({version:'0.1.0-rc.5',archive:path.basename(archive),sha256:digest,platform:'linux-x64-glibc',node:'24.15.0',files:files.length,unpackedRegularBytes:bytes,packages:[...visited.values()].map(m=>({name:m.name,version:m.version,license:m.license})),note:'Internal demo redistribution of the frozen, prebuilt workspace; not an upstream DSH release. Upstream notices remain in the tree. Development-only dependencies are excluded.'},null,2));
 console.log(JSON.stringify({archive,sha256:digest,files:files.length,bytes,packages:visited.size}));
}finally{await rm(temp,{recursive:true,force:true});}
