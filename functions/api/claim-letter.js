import {claimFreeLetter} from '../_lib/free-letter.js';
export async function onRequestPost({request,env}) {
  try {
    const d=await request.json();
    if (!['name','email','address','code'].every(k=>typeof d[k]==='string'&&d[k].trim()) ||
        d.name.length>200 || d.address.length>1000 ||
        (d.county!=null&&typeof d.county!=='string') || (d.state!=null&&typeof d.state!=='string') ||
        !(typeof d.concerns==='string'||(Array.isArray(d.concerns)&&d.concerns.every(c=>typeof c==='string'))) ||
        JSON.stringify(d.concerns).length>4000) {
      return Response.json({error:'Please check your order details.'},{status:400});
    }
    const country=typeof d.country==='string'&&/^[A-Za-z]{2}$/.test(d.country)?d.country.toUpperCase():'US';
    if(!d.name||!d.email||!d.address||(country==='US'&&!d.county)||!d.concerns?.length||!d.code)
      return Response.json({error:'Please complete the required fields.'},{status:400});
    if(typeof d.email!=='string'||!/^\S+@\S+\.\S+$/.test(d.email)||typeof d.code!=='string'||d.code.length>100)
      return Response.json({error:'Please check your email and referral link.'},{status:400});
    await claimFreeLetter(env,{name:d.name,email:d.email.trim(),address:d.address,state:d.state||'',county:d.county||'',concerns:d.concerns,code:d.code,country});
    return Response.json({success:true});
  } catch(error) {
    const userError=/^This (email|referral link)/.test(error.message);
    console.error('Free letter processing:',userError?'Claim rejected':error.message);
    return Response.json({error:userError?error.message:'We could not finish your request. Please try again with the same email and referral link.'},{status:userError?400:503});
  }
}
