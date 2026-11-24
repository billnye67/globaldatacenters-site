// Display confidence and citation selection must survive compilation into globe.json.
function sourceUrl(value) {
  if(typeof value!=='string'||!/https?:\/\//i.test(value)||/\s/.test(value))return '';
  try{const u=new URL(value);return /^https?:$/.test(u.protocol)&&u.hostname?u.href:'';}catch{return '';}
}
function mapFields(project) {
  const approximate=project.lat==null||project.lng==null||
    /^(?:address-approx|town|city|region|country|approximate)\b/i.test(project.geocode||'');
  const sources=Array.isArray(project.sources)?project.sources:[];
  return {type:approximate?'approx':'placed',src:[...sources,project.dataset_url].map(sourceUrl).find(Boolean)||''};
}
module.exports={mapFields,sourceUrl};
