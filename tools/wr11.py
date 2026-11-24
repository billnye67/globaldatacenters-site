# -*- coding: utf-8 -*-
"""Batch eleven: Digital Realty, Inner Mongolia, Spain."""
import io, json, os

R = {

"/company/digital-realty/": {
 "paragraphs": [
  "Digital Realty is old enough in this industry that the complaints about it come from people "
  "living next to buildings that are already running, rather than from people objecting to plans. "
  "In Chicago, residents near its Cermak Road facility have spent years complaining about constant "
  "fan noise and alarms, and the complaints were still being reported in July 2026.",

  "That history is now the argument against the next one. The company has proposed a data center "
  "at the southwest corner of 21st Street and Calumet Avenue, near McCormick Place, and residents "
  "of the historic Prairie District and the wider South Loop have organised against it on the "
  "straightforward grounds that they can already hear the last one. Neighbourhood groups first "
  "rallied against the expansion in 2023 and have kept at it since.",

  "Noise is the part of this industry with the least regulation attached to it and the most direct "
  "effect on the people closest to a site, which is why it keeps turning up in dense urban "
  "proposals like this one rather than in the rural fights, where water and farmland dominate.",

  "The wider mood is not in the company's favour. A Gallup survey in 2026 found 71 per cent of "
  "Americans do not want a data center near their home, a level of opposition higher than for a "
  "nearby nuclear plant. In Loudoun County, Virginia, where Digital Realty runs one of its largest "
  "campuses, the county removed by-right zoning for data centers in 2024, so each new building now "
  "has to be argued for case by case."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/chicago-residents-complain-of-noise-from-digital-realty-data-center/",
  "https://www.cbsnews.com/amp/chicago/news/south-loop-residents-fight-new-data-center/",
  "https://therealdeal.com/chicago/2023/09/13/prairie-district-residents-rally-against-digital-realty-expansion/",
  "https://www.credaily.com/briefs/digital-realty-cuts-investment-in-dallas-incentive-deal/",
  "https://www.datacenterfrontier.com/site-selection/article/55359925/community-opposition-emerges-as-new-gatekeeper-for-ai-data-center-expansion",
  "https://www.npr.org/2026/09/21/nx-s1-5927288/data-center-election-voters-ai"
 ]
},

"/data-centers/china/inner-mongolia/": {
 "paragraphs": [
  "The largest concentration of computing power on earth is not in Virginia or Texas. It is in the "
  "corridor between Hohhot and Ulanqab in Inner Mongolia, where the Horinger cluster holds around "
  "291,000 petaflops of capacity, 273,000 of it classed as intelligent computing, and where the "
  "combined electrical capacity of the data centres passes 3,000 megawatts.",

  "The region as a whole reached about 345,000 petaflops by July 2026, up from 315,000 in May, "
  "which is roughly a seventh of all computing power in China. Two things put it there: an average "
  "annual temperature of 4 to 6 degrees Celsius, which makes cooling cheap, and enough wind and "
  "solar generation that more than 85 per cent of the electricity these buildings use is "
  "classified as green power.",

  "The single largest facility is Envision Group's AI computing centre at Ulanqab, 120,000 square "
  "metres, built to run a million AI chips in parallel for at least a million petaflops. In July "
  "2026 Bloomberg reported that DeepSeek is developing a gigawatt-scale data centre of its own at "
  "Ulanqab, about 350 kilometres northwest of Beijing.",

  "Inner Mongolia is the exception to China's national problem rather than an example of it. "
  "Across the country thousands of local government backed data centres sit underused after a "
  "speculative build-out, and the state is trying to resell the idle capacity. Here the capacity "
  "is the point, the power behind it is real, and the buildings are full."
 ],
 "sources": [
  "https://en.sedaily.com/international/2026/08/10/inner-mongolia-emerges-as-chinas-ai-infrastructure-hub-with",
  "http://english.scio.gov.cn/chinavoices/2026-06/15/content_118548757.html",
  "https://english.news.cn/20260827/c207d743aa2446a8a56ef05ab90d8931/c.html",
  "https://www.bloomberg.com/news/articles/2026-07-30/deepseek-is-developing-massive-ai-data-center-in-inner-mongolia",
  "https://www.japantimes.co.jp/business/2026/08/01/tech/deepseek-mongolia-data-center/",
  "https://www.nationthailand.com/business/tech/40070832",
  "https://www.chinadaily.com.cn/a/202505/05/WS68181fb6a310a04af22bd7a7.html"
 ]
},

"/data-centers/spain/": {
 "paragraphs": [
  "The Spanish argument is about water, and the sharpest example is Meta's campus at Talavera de "
  "la Reina in Toledo province, which is projected to need 504 million litres a year, drawn mostly "
  "from the Tagus. A campaign named Tu Nube Seca Mi Rio, your cloud dries up my river, has grown "
  "out of that number and is calling for a national moratorium on new data centres.",

  "Aragon is where the money has gone, to the point that the regional press describes it as a gold "
  "rush. Ecologistas en Accion has led the opposition there, filing hundreds of formal objections "
  "and mounting a legal challenge to stop the projects being granted PIGA status, the regional "
  "strategic project designation that shortens the approval process and brings tax relief with it.",

  "The questions being put to the regional government are the ones that have not been answered "
  "anywhere. A socialist member of the Aragonese parliament asked how much electricity and water "
  "each data centre will consume, where both will come from, what happens in a drought year, "
  "whether the data centres or the farmers have the prior claim, and how many jobs are left once "
  "the construction crews go home.",

  "Madrid has drafted an answer of its own on the energy side: rules that would require data "
  "centres to source 80 per cent of their power from newly built renewable generation rather than "
  "from the existing grid. Aragon's government has pushed back hard, warning that the royal decree "
  "as drafted would make building in Spain close to impossible.",

  "The tension runs through the whole Spanish case. The country has the land, the sun and the wind "
  "that make it attractive to this industry, and it has the water scarcity that makes hosting it "
  "contentious, and both facts are getting stronger at the same time."
 ],
 "sources": [
  "https://en.ara.cat/politics/data-centers-the-new-gold-rush-in-aragon_130_5641964.html",
  "https://www.greeneuropeanjournal.eu/dry-land-for-thirsty-data/",
  "https://www.abc.net.au/listen/programs/latenightlive/john-boyce-meta-data-centre/105288884",
  "https://www.datacenterdynamics.com/en/news/spain-drafts-rules-requiring-data-centers-to-source-80-of-power-from-new-renewables-report/",
  "https://www.democrata.es/en/aragon/valle-warns-that-the-royal-decree-on-data-centers-makes-it-almost-impossible-for-its-implementation-in-spain/",
  "https://amwaj-alliance.com/tayyarat/data-centres-spains-digital-boom-meets-environmental-limits/",
  "https://euobserver.com/234362/listen-can-local-opposition-derail-europes-data-centre-boom/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
