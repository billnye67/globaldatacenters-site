// Resize the existing sky photograph; phones must not decode the 8K original.
const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
(async()=>{
 const browser=await chromium.launch();
 try {
  const page=await browser.newPage();
  for(const name of ['sky','sat']){
   const source=fs.readFileSync(path.join(__dirname,`../img/${name}.jpg`)).toString('base64');
   const result=await page.evaluate(async source=>{
    const image=new Image();image.src='data:image/jpeg;base64,'+source;await image.decode();
    const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;
    const ctx=canvas.getContext('2d');ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg',0.9).split(',')[1];
   },source);
   fs.writeFileSync(path.join(__dirname,`../img/${name}-phone.jpg`),Buffer.from(result,'base64'));
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
