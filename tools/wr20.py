# -*- coding: utf-8 -*-
"""Batch twenty: Shelby County TN, Millard County UT, Pittsylvania County VA, Ozaukee County WI."""
import io, json, os

R = {

"/data-centers/united-states/tennessee/shelby-county/": {
 "paragraphs": [
  "Memphis is trying to work out what to do about a data center it already has. xAI's Colossus "
  "operation runs around 500 megawatts on gas turbines and pays the county roughly $25 million a "
  "year, and two years after the company's arrival was announced the city council is considering "
  "whether to stop permitting any more.",

  "The proposal would pause the processing of data center rezoning applications, site plan "
  "approvals and building permits for twelve months. It is sponsored by council chair Jana "
  "Swearengen-Washington, Yolanda Cooper-Sutton and former chair J.B. Smiley. Cooper-Sutton has "
  "opposed the company publicly since news of its arrival broke in 2024.",

  "A council committee advanced the measure on August 18, 2026 to a standing-room-only hearing "
  "with supporters and opponents both present, and councillors discussed how the tax revenue from "
  "the existing sites should be used alongside the complaints from people living next to them. On "
  "September 16 the full council put the vote off again, to its meeting of October 6.",

  "The air permit hearings have run the other way with no ambiguity at all: commenters there were "
  "unanimously opposed. The NAACP, the Southern Environmental Law Center and Earthjustice are "
  "meanwhile suing xAI over the turbines powering Colossus 2, which sit across the state line in "
  "Southaven, Mississippi, and were operated before any permit covered them."
 ],
 "sources": [
  "https://www.actionnews5.com/2026/09/16/memphis-city-council-pushes-back-vote-data-center-regulation/",
  "https://www.actionnews5.com/2026/08/18/memphis-city-council-committee-advances-data-center-moratorium-proposal/",
  "https://www.memphisflyer.com/memphis-city-council-to-consider-data-center-moratorium/",
  "https://citizenportal.ai/articles/9724811/Tennessee/Shelby-County/Memphis-City/Widespread-public-testimony-pushes-Memphis-City-Council-toward-a-datacenter-moratorium",
  "https://www.selc.org/news/inside-memphis-fight-against-xai/",
  "https://techcrunch.com/2025/05/31/naacp-calls-on-officials-to-halt-operations-at-xais-dirty-data-center-in-memphis"
 ]
},

"/data-centers/united-states/utah/millard-county/": {
 "paragraphs": [
  "Millard County is a rural county in central Utah that happens to own the most valuable thing in "
  "this industry: a site where very large amounts of electricity are already generated and "
  "transmitted. The coal-fired Intermountain Power Plant at Delta, running since 1984, is being "
  "replaced by an 840 megawatt gas plant built to burn a blend of natural gas and green hydrogen, "
  "starting at about 30 per cent hydrogen. The transmission that served the coal plant is what the "
  "data center developers are actually buying.",

  "What is being proposed around it is on a scale that has few parallels. Fibernet's MercuryDelta "
  "has sought to rezone roughly 1,200 acres outside Delta for the Delta Gigasite, a 20 million "
  "square foot campus master-planned for as much as ten gigawatts of generation, combining solar, "
  "natural gas and a tie-in to the Intermountain transmission lines. Creekstone Energy has put a "
  "$17 billion programme behind the same site, including more than a gigawatt of solar it intends "
  "to build within eighteen months.",

  "The county commission has been approving it. A 4,000-acre campus cleared the commission and is "
  "due to start supplying power during 2026, and a groundbreaking was held for what was billed as "
  "the largest data center in the country. Separately, Joule and Caterpillar have partnered on a "
  "four gigawatt power and hyperscale computing campus in the state.",

  "There is no organised local opposition on the record here, which makes Millard County unusual "
  "among the places on this site. It is also worth stating what the scale means: a county of a few "
  "thousand households is being planned around generation measured in gigawatts, and the decisions "
  "are being taken by a commission answering to that small an electorate."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/fibernet-ceo-eyes-multi-gigawatt-data-center-campus-in-utah/",
  "https://www.abc4.com/news/central-utah/groundbreaking-millard-county-data-center/amp/",
  "https://www.areadevelopment.com/newsItems/4-21-2026/creekstone-energy-millard-county-utah.shtml",
  "https://www.solarpowerworldonline.com/2026/03/1-gw-solar-project-planned-for-utah-hyperscale-data-center/",
  "https://www.enr.com/articles/61225-joule-caterpillar-partner-to-deliver-utah-4-gw-power-and-hyperscale-computing-campus",
  "https://www.ksl.com/article/51355852/worlds-largest-data-center-campus-could-be-coming-to-central-utah",
  "https://nrvutah.com/2025/08/11/take-a-byte-of-utah-rural-county-a-blossoming-hub-for-data-centers/"
 ]
},

"/data-centers/united-states/virginia/pittsylvania-county/": {
 "paragraphs": [
  "Pittsylvania County has said both things within a year. In April 2025 its Board of Supervisors "
  "voted 6-1 to reject Balico's proposal for twelve data centers and a 3,500 megawatt gas plant, "
  "an $8.85 billion project, after residents organised as the Coalition for the Protection of "
  "Pittsylvania County with help from the Southern Environmental Law Center. A tobacco and dairy "
  "county in Southside Virginia turned down the largest investment ever offered to it.",

  "In May 2026 county and city leaders approved a different one. Stack Infrastructure is to build "
  "an AI data center campus at the Southern Virginia Megasite at Berry Hill, described by the "
  "officials backing it as $100 billion of investment over thirty years, 2,500 permanent jobs, "
  "more than 2,000 construction posts and an average wage of around $80,000. Those figures come "
  "from the developer and the officials promoting the deal rather than from any independent "
  "assessment.",

  "Residents did not oppose it the way they opposed Balico, but they did not wave it through "
  "either. The concerns raised were about how little the community had been told and how fast the "
  "decision moved, with some asking the county to slow down and fold the project into its "
  "comprehensive planning rather than approve it on its own.",

  "A separate proposal would put data centers and a natural gas power plant on 2,200 acres "
  "elsewhere in the county.",

  "The difference between the two decisions is worth being precise about. Balico proposed to build "
  "its own gas generation next to homes; the Berry Hill site is a megasite the state had already "
  "designated and serviced for heavy industry. The county did not change its mind about power "
  "plants so much as about where they go."
 ],
 "sources": [
  "https://wset.com/news/local/local-leaders-approve-100b-ai-data-campus-in-pittsylvania-county-amid-citizen-concerns-megasite-berry-hill-may-2026",
  "https://www.selc.org/news/a-rural-virginia-county-is-a-case-study-in-community/",
  "https://www.datacenterdynamics.com/en/news/data-centers-and-natural-gas-power-plant-planned-on-2200-acres-in-pittsylvania-county-virginia/",
  "https://www.baconsrebellion.com/pittsylvania-county-breathes-sigh-of-relief/",
  "https://virginiabusiness.com/stafford-county-data-center-boom-public-backlash/"
 ]
},

"/data-centers/united-states/wisconsin/ozaukee-county/": {
 "paragraphs": [
  "Port Washington held the first anti-data-center referendum in the United States and won it "
  "66 per cent to 34 on April 7, 2026. The measure does not ban anything. It requires the city to "
  "get voter approval before creating any tax incremental financing district worth more than $10 "
  "million, which is the mechanism these projects are usually financed through.",

  "It came out of a specific grievance. The city had approved a tax incremental district for "
  "Vantage's Lighthouse campus, a $15 billion project now under construction just north of town on "
  "647 acres of former farmland, and residents felt the decision had been made without them. A "
  "grassroots group called Great Lakes Neighbors United gathered a thousand signatures, brought "
  "the petition to the Common Council and got the ordinance onto the spring ballot.",

  "The referendum had no effect on the Lighthouse project, which was already approved and already "
  "being built. What it changes is every deal after it: in Port Washington the incentive now has "
  "to survive an election rather than a council vote. The group called the result a win for "
  "transparency and public participation rather than a defeat for the data center.",

  "Business groups read it as a warning. The Badger Institute has argued that putting development "
  "incentives to referendum could stall growth across Wisconsin, which is a fair description of "
  "what the mechanism is designed to do."
 ],
 "sources": [
  "https://www.wpr.org/news/port-washington-referendum-concerns-data-center-project",
  "https://thehill.com/policy/technology/5822566-port-washington-data-center-vote/",
  "https://www.canarymedia.com/articles/data-centers/data-center-election-wisconsin",
  "https://www.eenews.net/articles/a-ragtag-wisconsin-group-leads-americas-first-anti-data-center-referendum/",
  "https://www.fox6now.com/news/port-washington-data-centers-referendum-targets-future-developments",
  "https://www.route-fifty.com/artificial-intelligence/2026/04/data-centers-hit-ballot-year/412855/",
  "https://www.badgerinstitute.org/referendums-on-development-could-kill-states-growth/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
