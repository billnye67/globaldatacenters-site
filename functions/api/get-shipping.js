import {verifiedCart,quoteShipping} from '../_lib/merch-shipping.js';
export async function onRequestPost({request,env}) {
  try {
    const {items,address}=await request.json();
    if(!address?.zip||!address?.country)return Response.json({error:'Address (zip + country) required'},{status:400});
    return Response.json(await quoteShipping(env,verifiedCart(items),address));
  } catch(error) {
    return Response.json({error:'Please check your cart and shipping address.'},{status:400});
  }
}
