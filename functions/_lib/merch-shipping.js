import { CATALOG } from '../api/merch-catalog.js';

export function verifiedCart(items) {
  if(!Array.isArray(items)||!items.length||items.length>100)throw new Error('Cart is empty or too large');
  return items.map(it=>{
    const item=CATALOG[it.variantId];
    if(!item)throw new Error('Unknown item');
    return {...item,variantId:it.variantId,qty:Math.max(1,Math.min(20,parseInt(it.qty)||1)),img:typeof it.img==='string'?it.img:''};
  });
}

export async function quoteShipping(env,items,address) {
  const subtotal=items.reduce((n,it)=>n+it.price*it.qty,0);
  if(subtotal>=5000)return {shipping:0,free:true,subtotal};
  // Preserve the existing $5.99 fallback, determined here rather than by the browser.
  const fallback={shipping:599,free:false,subtotal,fallback:true};
  if(!address?.zip||!address?.country)return fallback;
  if(address.country!=='US')throw new Error('Shipping is currently available in the US only');
  try {
    const response=await fetch(`https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/orders/shipping.json`,{
      method:'POST',headers:{Authorization:`Bearer ${env.PRINTIFY_SK}`,'Content-Type':'application/json;charset=utf-8'},
      body:JSON.stringify({line_items:items.map(it=>({product_id:it.productId,variant_id:it.variantId,quantity:it.qty})),
        address_to:{first_name:'Customer',last_name:'Order',email:'orders@floridadatacenters.org',country:'US',region:address.region||'',address1:address.address1||'123 Main St',city:address.city||'City',zip:address.zip}}),
      signal:AbortSignal.timeout(8000)
    });
    if(!response.ok)return fallback;
    const data=await response.json(),shipping=data.standard??data.priority??data.express;
    if(!Number.isInteger(shipping)||shipping<0)return fallback;
    return {shipping,free:shipping===0,subtotal};
  }catch{return fallback;}
}
