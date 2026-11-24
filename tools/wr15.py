# -*- coding: utf-8 -*-
"""Batch fifteen: Florida, Sarpy County NE, Douglas County GA, Lombardy."""
import io, json, os

R = {

"/data-centers/united-states/florida/": {
 "paragraphs": [
  "Florida now has a data center law and it is mostly about water. Governor Ron DeSantis signed "
  "Senate Bill 484 in May 2026, effective July 1, defining a large-scale data center as one "
  "expecting a monthly peak load of at least 50 megawatts. The bill bars utilities from shifting "
  "the cost of grid expansion onto residential ratepayers, and it explicitly leaves local "
  "governments their zoning power to reject or restrict a project rather than pre-empting them.",

  "Its sharpest provision is the one nobody else has copied yet: the Department of Environmental "
  "Protection and the regional water management districts may not issue a consumptive freshwater "
  "permit to a large-scale data center wherever reclaimed water is available. In a state that "
  "argues about aquifers every dry season, that puts these buildings behind households in the "
  "queue for drinking water by statute rather than by negotiation.",

  "Local governments have used the authority the bill preserved. By July 2026 somewhere between "
  "fourteen and twenty Florida counties and municipalities had adopted a temporary moratorium or "
  "a permanent ban, among them Volusia County, Sarasota County, Washington County and the city of "
  "Lakeland.",

  "The clearest refusal came in Palm Beach County, where commissioners voted 5-1 in July to reject "
  "Project Tango, a $2 billion AI data center campus, after county staff projected it would use "
  "100,000 gallons of water a day. Lake County's commission moved toward a temporary ban in June, "
  "Manatee County's commissioners voted unanimously in July to have staff draft a moratorium "
  "resolution, and in September Orange County, which contains Orlando, began work on a year-long "
  "pause of its own over water.",

  "The pattern in Florida is not one big fight but a long line of county-level ones, and the thing "
  "being defended in almost all of them is the water rather than the land."
 ],
 "sources": [
  "https://mynews13.com/fl/orlando/news/2026/07/01/florida-data-centers-law-",
  "https://www.datacenterbans.com/state/florida",
  "https://www.cfpublic.org/2026-06-25/lake-county-commission-plans-temporary-ban-on-data-centers",
  "https://www.businessobserverfl.com/news/2026/jul/29/manatee-county-data-center-moratorium/",
  "https://www.wusf.org/politics-issues/2026-09-16/orange-county-plans-a-moratorium-on-ai-data-centers",
  "https://hoodline.com/2026/09/orange-county-weighs-yearlong-pause-on-ai-data-centers-over-water-fears/",
  "https://savrn.com/data-center-moratorium-tracker/florida"
 ]
},

"/data-centers/united-states/nebraska/sarpy-county/": {
 "paragraphs": [
  "Sarpy County has the numbers most places are still arguing about, because Meta published them. "
  "Its four million square foot campus here withdrew between 26.7 million and 37.5 million gallons "
  "from the local water supply in a year, depending on the year, across 2020 to 2024, cooling the "
  "buildings with a mix of evaporative and closed loop systems.",

  "The electricity was arranged separately and earlier. Omaha Public Power District adopted a rate "
  "structure for the site that lets it be supplied entirely with clean energy: Meta buys wind "
  "power from OPPD, which buys it in turn from Enel's Rattlesnake Creek project up in Dixon "
  "County. It is one of the earlier examples in the country of a utility building a tariff around "
  "a single data center customer.",

  "The state has only just started checking any of this for itself. A law passed during the "
  "Nebraska Legislature's 2026 session directs the Department of Water, Energy and Environment to "
  "begin collecting annual water use and energy demand figures from data centers later in the "
  "year. Until that takes effect every number in circulation, including the ones above, came from "
  "the companies.",

  "The scale being proposed keeps rising. Google has put forward a Nebraska data center that would "
  "need more electricity than the entire city of Lincoln, and the company reported its Nebraska "
  "sites used around 732 million gallons of water across 2025."
 ],
 "sources": [
  "https://nebraskaexaminer.com/2026/07/09/data-centers-can-guzzle-serious-water-as-some-nebraskans-worry-tech-giants-seek-solutions/",
  "https://flatwaterfreepress.org/data-centers-can-guzzle-serious-water-as-some-nebraskans-worry-tech-giants-seek-solutions/",
  "https://www.route-fifty.com/infrastructure/2026/07/nebraska-wants-data-centers-come-clean-about-water-usage/414775/",
  "https://grist.org/climate-energy/nebraska-wants-data-centers-to-come-clean-about-water-usage/",
  "https://flatwaterfreepress.org/google-proposes-nebraska-data-center-requiring-more-power-than-all-of-lincoln/",
  "https://baxtel.com/data-center/meta-sarpy-nebraska"
 ]
},

"/data-centers/united-states/georgia/douglas-county/": {
 "paragraphs": [
  "Douglas County is already one of the denser data center clusters in Georgia and the buildings "
  "keep coming. There are eight operational buildings totalling about 2.536 million square feet, "
  "six more under construction totalling 3.278 million, and eleven more, totalling 3.085 million "
  "square feet, sitting in permit review.",

  "The proposal that turned the county against the trend covers more than 700 acres in western "
  "Douglas County. Informational meetings held ahead of the public hearing were packed, and the "
  "objections have been about noise, water use and what the load does to utility rates rather than "
  "about the land itself.",

  "Residents have pushed on two fronts. One petition asks the county to halt approval of the "
  "large-scale development until an independent review of its impacts is finished; another demands "
  "a two-year moratorium on new data center construction across both Douglas County and the state "
  "of Georgia. A permit for a separate data center proposed near Interstate 20 was denied.",

  "The infrastructure argument has come from inside the commission as well. After one vote, "
  "Commissioner Mark Alcarez told residents the county is twenty-five years behind on its road "
  "infrastructure and asked what could be done that would not mean raising their taxes, which is "
  "the question underneath most of these approvals: whether the revenue arrives faster than the "
  "costs it creates."
 ],
 "sources": [
  "https://www.fox5atlanta.com/news/douglas-county-data-center-sparks-resident-pushback",
  "https://www.wsbtv.com/news/local/permit-new-proposed-data-center-denied-douglas-county/7FYNFGPB3NG4TDIUAZYP54YO3Q/",
  "https://www.change.org/p/help-fight-the-data-centers-for-douglas-county-ga",
  "https://www.change.org/p/demand-a-2-year-moratorium-on-new-data-center-construction-in-georgia-and-douglas-county",
  "https://www.aol.com/news/douglas-county-data-center-sparks-222241717.html"
 ]
},

"/data-centers/italy/lombardy/": {
 "paragraphs": [
  "Lombardy wrote Italy's first proper data centre law. Regional Law 11 of June 3, 2026 sets out a "
  "comprehensive framework for where these buildings may be sited, and the region has attached a "
  "price to the answer: development charges increased by up to 200 per cent for anything built on "
  "green or agricultural land.",

  "Rome has been pulling the other way. On August 4, 2026 the national government granted two "
  "projects strategic national interest status, which accelerates their approval past the ordinary "
  "route: one in Sardinia and one in the Milan metropolitan area, worth about 6.8 billion euros "
  "between them. The Lombard half is a campus of up to around 400 megawatts proposed by K2 "
  "Strategic Infrastructure Italy across the municipalities of Zibido San Giacomo and Lacchiarella, "
  "valued at 5.3 billion euros.",

  "That fast-tracking is what organised the opposition. Lombardy now hosts Italy's first grassroots "
  "network against data centres, the Network of Citizens' Committees Against Data Centers, which "
  "coordinated a regional day of mobilisation on September 12, 2026. Its complaints are land take, "
  "water consumption, pressure on the electricity grid and the urban heat island effect of "
  "concentrating this much waste heat around Milan.",

  "It has had results. Two of the region's larger storage projects, at Rozzano and at Travagliato, "
  "have slowed under sustained local pressure, which is the first time in Italy that community "
  "organising rather than a permitting failure has been what held a data centre up."
 ],
 "sources": [
  "https://www.thelocal.it/20260814/protests-in-lombardy-as-italy-fast-tracks-ai-data-centres",
  "https://www.osborneclarke.com/insights/lombardy-creates-first-comprehensive-regulatory-framework-establishment-data-centres",
  "https://www.rplt.it/en/lombardy-regulation-on-the-siting-of-data-centers/",
  "https://en.ilsole24ore.com/art/lombardy-introduces-increased-charges-of-up-to-200-per-cent-for-data-centre-construction-in-green-and-agricultural-areas-AI6Jp4ID",
  "https://italiantimes.substack.com/p/lombardy-launches-italys-first-grassroots",
  "https://italiantimes.substack.com/p/lombardy-italy-grassroots-protests",
  "https://www.lw.com/en/insights/italy-passes-new-data-center-regulations"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
