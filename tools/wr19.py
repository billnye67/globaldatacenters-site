# -*- coding: utf-8 -*-
"""Batch nineteen: Eagle Rock Partners, Compass Datacenters, Nordland, Fayette County GA."""
import io, json, os

R = {

"/company/eagle-rock-partners/": {
 "paragraphs": [
  "Eagle Rock Partners, a North Carolina developer, proposed what would have been the largest data "
  "center in Illinois: Meridian Technology Park, ten buildings drawing 100 megawatts each for a "
  "gigawatt in total, costed at around $6 billion, in rural Bear Creek Township southwest of "
  "Taylorville in Christian County.",

  "The county turned out against it. A petition calling for an immediate 18-month moratorium on "
  "data center development in Christian County gathered just short of 700 signatures, and about "
  "400 people came to the county board meeting on June 16, most of them opposed. The objections "
  "were water use, the effect on wildlife and what a site that size would do to the farmland "
  "around it.",

  "On August 12 the company abandoned the project. Its stated reason was not the opposition: Eagle "
  "Rock said it had concluded that the gas-fired power plant meant to supply the campus, a "
  "yet-to-be-built facility in Sangamon County near Pawnee, might never be built at all.",

  "Both things are true and the sequence matters. A gigawatt of load needs generation that does "
  "not exist yet, and a developer facing a hostile county has less reason to wait and find out "
  "whether it gets built."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/property-developer-eagle-rock-proposes-1gw-data-center-in-christian-county-illinois/",
  "https://www.illinoistimes.com/news/developer-wants-to-build-states-largest-data-center-in-christian-county/",
  "https://www.illinoistimes.com/news/data-center-developer-abandons-plans-for-christian-county/",
  "https://www.springfieldbusinessjournal.com/news/data-center-developer-abandons-plans-for-christian-county/",
  "https://www.wandtv.com/news/illinois/eagle-rock-halts-plans-for-data-center-in-christian-co/article_d2d128f4-15fb-4076-b03c-c6a62a8531fa.html",
  "https://mlq.ai/news/eagle-rock-partners-proposes-88b-1gw-data-center-campus-in-christian-county-illinois/"
 ]
},

"/company/compass-datacenters/": {
 "paragraphs": [
  "Compass is building an eight-facility campus over eight years in Lauderdale County, "
  "Mississippi, near Meridian, on an investment reported at about $10 billion, with the first "
  "building due to finish in 2026. It is among the largest single commitments made anywhere in the "
  "state.",

  "In Texas the company has met the opposition head on. Red Oak's city council voted 4-1 to "
  "approve rezoning roughly 830 acres from agricultural land into a planned high-tech industrial "
  "park for a Compass campus, which would be the city's sixth. The meeting ran for hours, "
  "residents filled city hall and dozens signed up to speak. The objections were noise, pollution, "
  "property values, how close the buildings would sit to houses, and how little say anyone felt "
  "they had had.",

  "The company's response to that has been to offer the town something. Compass put up $15 million "
  "towards building an animal shelter in Red Oak, in Ellis County, which the county commissioners "
  "court had still to approve. It is an unusually direct example of a developer trying to buy back "
  "goodwill it lost during a rezoning.",

  "North Texas is not moving as one. Two communities in the area voted on data center growth within "
  "weeks of each other and came to opposite conclusions, and one Ellis County commissioner "
  "complained publicly that developers had tried to razzle dazzle the court while sharing very few "
  "specifics."
 ],
 "sources": [
  "https://www.cbsnews.com/texas/news/red-oak-community-fight-against-another-data-center-getting-approved-north-texas/",
  "https://www.datacenterdynamics.com/en/news/compass-datacenters-looks-to-calm-data-center-controversy-by-funding-15m-animal-shelter-in-ellis-county-texas/",
  "https://www.keranews.org/energy-environment/2026-05-12/oppose-expand-votes-in-2-north-texas-communities-highlight-a-divide-over-data-center-growth",
  "https://www.cbsnews.com/news/exploring-data-center-pushback-60-minutes/",
  "https://baxtel.com/data-center/compass-meridian",
  "https://msindy.org/p/mississippis-data-center-boom-and"
 ]
},

"/data-centers/norway/nordland/": {
 "paragraphs": [
  "The data centre planned for Narvik would use more electricity than the city of Oslo. Estimates "
  "put it at eight to nine per cent of everything Norway generates. That single comparison is why "
  "a county above the Arctic Circle has become the centre of a national argument.",

  "The project is Stargate Norway, up to 290 megawatts, intended to be Europe's first OpenAI data "
  "centre, being built by Nscale with Aker, Norway's largest industrial conglomerate, and due to "
  "open at the end of 2026. Supporters present it as exactly what Norwegian hydropower is for. "
  "Critics in the north have warned it risks becoming an industrial nightmare rather than a green "
  "growth story, and the debate has widened from electricity into who controls the infrastructure "
  "and the AI that runs on it.",

  "Mo i Rana, further south in Nordland, is filling up on the same logic without the same "
  "attention. VivoPower bought a 41.5 megawatt data centre there in April 2026, running on "
  "hydroelectricity at under 3.5 US cents a kilowatt hour, and opened lease bidding after interest "
  "from AI operators, with a route to more than 80 megawatts if regulators allow it. T1 Energy has "
  "secured a 50 megawatt connection for a former battery factory it is converting, and sits in the "
  "interconnection queue for 396 megawatts more.",

  "The Norwegian case is the one that unsettles the usual argument. There is no fossil generation "
  "to object to and no water scarcity to invoke, and the country is split anyway, because cheap "
  "renewable power turns out to be a finite thing that can be spent on one customer instead of "
  "another."
 ],
 "sources": [
  "https://en.highnorthnews.com/opinions/data-centre-from-fairy-tale-to-nightmare/1113090",
  "https://algorithmwatch.org/en/data-centers-norway-renewable-energy-conflict/",
  "https://www.techpolicy.press/despite-plenty-of-renewable-energy-data-centers-split-norwegian-society/",
  "https://www.globenewswire.com/news-release/2026/04/23/3280305/0/en/VivoPower-Launches-Lease-Bidding-after-Receiving-Strong-Interest-from-AI-Operators-for-41-5MW-Norway-Data-Center.html",
  "https://www.datacenterdynamics.com/en/news/t1-energy-secures-50mw-grid-connection-for-former-battery-manufacturing-site-in-norway-set-to-become-data-center/",
  "https://ir.t1energy.com/news-releases/news-release-details/t1-energy-secures-50mw-grid-allocation-nordic-data-center-asset"
 ]
},

"/data-centers/united-states/georgia/fayette-county/": {
 "paragraphs": [
  "Fayetteville did not pause data centers, it stopped allowing them. On March 5, 2026 the city "
  "put a moratorium in place and amended its Unified Development Ordinance so that a new data "
  "center is no longer a permitted use anywhere in the city.",

  "The effect was immediate. An appeal on a data center project had been scheduled for the council "
  "meeting of March 19; the developers withdrew it on March 18, and local coverage put the outcome "
  "down to the power of the people rather than to anything technical in the application.",

  "The state legislature has been moving in the same direction more slowly. A Data Center Impact "
  "Assessment and Development Moratorium Act was filed in 2026, and Georgia now has enough local "
  "ordinances for the press to rank them from most to least restrictive, which is itself a measure "
  "of how much of this has been left to the cities and counties to work out on their own."
 ],
 "sources": [
  "https://thecitizen.com/2026/03/19/data-center-appeal-withdrawn-in-fayetteville-the-power-of-the-people/",
  "https://billtracker.gacities.com/legislation/72510",
  "https://www.northwestgeorgianews.com/calhoun_times/news/local/all-georgia-data-center-ordinances----from-most-to-least-restrictive/article_935d360f-88a5-42a7-91e8-82f597fe4bbf.html",
  "https://www.interconnectedcapital.com/research/data-center-moratoriums"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
