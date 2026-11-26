import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
if(existsSync('.env')) process.loadEnvFile('.env');
const port=Number(process.env.PORT||3000);
const backend=process.env.BACKEND_URL||'http://localhost:8080';
const files={'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/style.css':['style.css','text/css']};
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
    const file=files[req.url];if(req.method!=='GET'||!file)return json(res,404,{detail:'Not found'});
    res.writeHead(200,{'Content-Type':file[1],'X-Content-Type-Options':'nosniff'});res.end(await readFile(new URL('./public/'+file[0],import.meta.url)));
  }catch{json(res,500,{detail:'Unable to process request'})}
}).listen(port,'127.0.0.1',()=>console.log(`StandBy running at http://localhost:${port} → backend ${backend}`));
