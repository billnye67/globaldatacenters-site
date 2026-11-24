// Reuses the Florida site's REPORTS KV namespace. These are retry checkpoints,
// not a distributed transaction/lock: KV remains eventually consistent.
const TTL=180*86400;
const local=new WeakMap();
function state(env) {
  assertOrderStorage(env);
  let value=local.get(env.REPORTS);
  if(!value){value={locks:new Map(),writes:new Map()};local.set(env.REPORTS,value);}
  const now=Date.now();
  for(const [key,item] of value.writes)if(now-item.at>60000)value.writes.delete(key);
  return value;
}
export function assertOrderStorage(env) {
  if(!env.REPORTS?.get||!env.REPORTS?.put)throw new Error('Existing REPORTS binding is unavailable');
}
export async function readValue(env,key) {
  const cached=state(env).writes.get(key);
  return cached?cached.value:env.REPORTS.get(key);
}
export async function writeValue(env,key,value,ttl=TTL) {
  await env.REPORTS.put(key,value,{expirationTtl:ttl});
  state(env).writes.set(key,{value,at:Date.now()});
}
export async function readRecord(env,key) {
  const raw=await readValue(env,key);return raw?JSON.parse(raw):null;
}
export function writeRecord(env,key,value,ttl=TTL) {
  return writeValue(env,key,JSON.stringify(value),ttl);
}
export async function stableToken(value) {
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function serialize(env,key,work) {
  const locks=state(env).locks,previous=locks.get(key)||Promise.resolve();
  let release;const current=new Promise(resolve=>{release=resolve;});locks.set(key,current);
  await previous.catch(()=>{});
  try{return await work();}finally{release();if(locks.get(key)===current)locks.delete(key);}
}
export function runOrder(env,id,kind,payload,work) {
  return serialize(env,'order:'+id,async()=>{
    if(await readValue(env,'order-complete:'+id))return {duplicate:true};
    let order=await readRecord(env,'order:'+id);
    if(!order){order={id,kind,payload,created_at:Date.now()};await writeRecord(env,'order:'+id,order);}
    try {
      await work(order.payload);
      await writeRecord(env,'order-complete:'+id,{completed_at:Date.now()});
      return {duplicate:false};
    }catch(error){
      try{await writeRecord(env,'order-error:'+id,{message:String(error.message).slice(0,300),at:Date.now()});}catch{}
      throw error;
    }
  });
}
export async function countLetters(env,id,quantity) {
  if(!quantity)return;
  await serialize(env,'letter-count',async()=>{
    if(await readValue(env,'order-counted:'+id))return;
    const old=Number.parseInt(await readValue(env,'letter-count'),10);
    await writeValue(env,'letter-count',String((Number.isFinite(old)?old:1143)+quantity),365*86400);
    await writeValue(env,'order-counted:'+id,String(quantity));
  });
}
