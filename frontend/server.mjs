import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync,statSync} from 'node:fs';
if(existsSync('.env')) process.loadEnvFile('.env');
const port=Number(process.env.PORT||3000);
const backend=process.env.BACKEND_URL||'http://localhost:8080';
const dist=new URL('./react-app/dist/',import.meta.url);
const isFile=u=>existsSync(u)&&statSync(u).isFile();
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))};
// /api/* is proxied to the Spring backend: same origin for the browser, no CORS. Only auth/content-type/body are forwarded.
async function proxy(req,res){
  const headers={};for(const h of ['authorization','content-type'])if(req.headers[h])headers[h]=req.headers[h];
  const chunks=[];for await(const c of req)chunks.push(c);
  try{
    const r=await fetch(backend+req.url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});
    res.writeHead(r.status,{'Content-Type':r.headers.get('content-type')||'text/plain','Cache-Control':'no-store'});res.end(Buffer.from(await r.arrayBuffer()));
  }catch{json(res,502,{detail:`Backend not reachable at ${backend}. Start it: cd backend && mvn spring-boot:run`})}
}
http.createServer(async(req,res)=>{
  try{
    if(req.url.startsWith('/api/'))return await proxy(req,res);
    if(req.method!=='GET')return json(res,404,{detail:'Not found'});
    // static files from the React build; any other path falls back to index.html (SPA)
    const path=new URL(req.url,'http://x').pathname;
    let rel=path==='/'?'index.html':path.slice(1);
    if(rel.includes('..')||!isFile(new URL(rel,dist)))rel=path.startsWith('/assets/')?'':'index.html';
    if(!rel)return json(res,404,{detail:'Not found'});
    res.writeHead(200,{'Content-Type':types[rel.slice(rel.lastIndexOf('.'))]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(await readFile(new URL(rel,dist)));
  }catch{json(res,500,{detail:'Unable to process request'})}
}).listen(port,'127.0.0.1',()=>console.log(`InboxZen running at http://localhost:${port} → backend ${backend}`));
