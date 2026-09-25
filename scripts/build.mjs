/** Stage only public website assets. Never publish SQL, backups, or test fixtures. */
import {readFile,writeFile,copyFile,mkdir,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'_site');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
const files=['index.html','ui.css','app.js','core.js','questions.js','cloud.js','config.js','sitemap.xml'];
for(const file of files)await copyFile(path.join(root,file),path.join(out,file));
const url=(process.env.SUPABASE_URL||'').trim(),key=(process.env.SUPABASE_PUBLISHABLE_KEY||'').trim();
if(Boolean(url)!==Boolean(key))throw Error('Configure both SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY, or neither.');
if(url&&key){
 const u=new URL(url);if(u.protocol!=='https:'||!u.hostname.endsWith('.supabase.co'))throw Error('Expected an HTTPS Supabase project URL.');
 if(key.startsWith('sb_secret_'))throw Error('A secret key must never enter the public website.');
 let publicKey=key.startsWith('sb_publishable_');
 if(!publicKey){try{publicKey=JSON.parse(Buffer.from(key.split('.')[1],'base64url')).role==='anon'}catch{}}
 if(!publicKey)throw Error('Only a publishable key or legacy anon key is allowed.');
 await writeFile(path.join(out,'config.js'),'// Public configuration only; database access is protected by RLS.\nexport const CLOUD_CONFIG = '+JSON.stringify({url:u.origin,publishableKey:key})+';\n');
}
const html=await readFile(path.join(out,'index.html'),'utf8');
if(!html.includes('app.js?v=6')||!html.includes('ui.css?v=5'))throw Error('Entry-point validation failed.');
await writeFile(path.join(out,'.nojekyll'),'');
console.log(`Staged ${files.length} public assets. Cloud configuration: ${url?'configured (requires schema and Auth setup)':'not configured; guest/local mode'}.`);
