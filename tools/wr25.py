# -*- coding: utf-8 -*-
"""Batch twenty-five: Los Angeles County CA, Clark County NV.

Method: three searches each. Los Angeles, five articles requested and two returned (LA Public
Press, Las Vegas Sun and This Is Reno refused); Clark County, five requested and three returned
(Nevada Current and Review-Journal refused). Where the first choice refused, a different outlet
covering the same meeting was fetched rather than falling back on search summaries.
"""
import io, json, os

R = {

"/data-centers/united-states/california/los-angeles-county/": {
 "paragraphs": [
  "Monterey Park is the first city in the United States to ban data centers permanently by popular "
  "vote. Measure NDC passed on June 2, 2026 by 10,321 votes to 1,362, or 88.34 per cent. It amends "
  "the city's General Plan to prohibit data centers anywhere inside the city limits, it does not "
  "expire, and the council cannot undo it. Only another vote of the public can.",

  "The campaign started with one building. Plans surfaced in 2025 to demolish an office block and "
  "put up a 250,000 square foot data center, backed by the Australian firm StratCap, which by the "
  "organisers' reckoning would have tripled the electricity consumption of the entire city. Steven "
  "Kung co-founded No Data Center Monterey Park in response. “The noise solution, the air "
  "pollution, the rise in the electricity rates, the deal just didn't make sense,” he said. "
  "He called the result a victory landslide.",

  "He also said the thing most winners in these fights do not. “Pulling the plug on data "
  "centers in Southern California will most likely mean the centers will plug into someone else's "
  "community.” His group has since turned to the City of Industry, where it says the ground "
  "is being prepared for another one.",

  "The county has now moved on the same question at a much larger scale. Amy Bodek, director of "
  "Regional Planning, signed a temporary moratorium on new hyperscale data centers effective "
  "September 17, 2026, covering every unincorporated zone in Los Angeles County. Supervisor Hilda "
  "Solis, who chairs the Board of Supervisors, is pushing a permanent ordinance behind it, aimed "
  "at facilities that link hundreds of computers to run artificial intelligence. Enterprise, "
  "accessory and sole-source data centers would stay permissible; the hyperscale ones would not. "
  "It went to the Community Services Cluster on September 23 and to the full board on October 6.",

  "The county's own officials supplied the numbers for it. Public Works Director Mark Pestrella "
  "told the board a single hyperscale data center can use up to five million gallons of water a "
  "day. Solis warned that the demand coming could take electricity equivalent to what eight "
  "million homes use, and that meeting it would mean leaning on fossil-fuel peaker plants. The "
  "ordinance reaches roughly a million people, the population of unincorporated Los Angeles County "
  "out of about ten million countywide.",

  "The industry had already concentrated in the one place in the county with its own power. "
  "Vernon runs a municipal utility supplying electricity, water, gas and fibre, at rates reported "
  "as low as half what other Southern California providers charge, a short distance from the One "
  "Wilshire carrier hotel. Inside a three-storey, 242,000 square foot building there called LAX01, "
  "AI chips draw enough electricity to power more than 26,400 homes for a year.",

  "Vernon is now close to full. The utility's exposure to a single source-line agreement with "
  "Southern California Edison saw its cost step up 12.7 times in one cycle, with Edison stating "
  "that further data center load would require further rate adjustments, and the result has been "
  "an administrative pause at utility level rather than a political one. The City of Commerce "
  "separately imposed a 45-day freeze.",

  "A Public Policy Institute of California poll in July found 73 per cent of Californians oppose "
  "data centers being built in their own communities, which is the context in which a council "
  "puts a permanent ban on the ballot and expects to win."
 ],
 "sources": [
  "https://abc7.com/post/monterey-park-voters-approve-measure-ndc-banning-power-hungry-data-centers-within-city-limits/19229466/",
  "https://hoodline.com/2026/09/la-county-freezes-giant-ai-data-centers-as-solis-pushes-permanent-ban/",
  "https://ballotpedia.org/Monterey_Park,_California,_Measure_NDC,_Prohibit_Data_Centers_Measure_(June_2026)",
  "https://lapublicpress.org/2026/06/monterey-park-data-center-ban-elections-2026/",
  "https://www.montereypark.ca.gov/m/newsflash/Home/Detail/1306",
  "https://calmatters.org/newsletter/data-center-monterey-park-ban/",
  "https://www.costar.com/article/365329619/us-data-center-backlash-takes-shape-in-los-angeles",
  "https://spectrumlocalnews.com/ca/california/politics/2026/06/07/monterey-park-ai-data-centers-vote-inspires-san-gabriel-valley",
  "https://ceqanet.lci.ca.gov/2026030446"
 ]
},

"/data-centers/united-states/nevada/clark-county/": {
 "paragraphs": [
  "Clark County cannot legally ban or pause a data center, so what it does instead is attach "
  "conditions. On June 17, 2026 the commissioners, sitting as the zoning commission, unanimously "
  "approved Switch's LAS 19: a 56,800 square foot building on nine acres near Warm Springs Road, "
  "next to the company's Core Campus by Decatur Boulevard and the 215 Beltway, which is already "
  "the largest cluster of data center space in Southern Nevada.",

  "What the public comment produced was a sidewalk. Switch withdrew a waiver it had sought to "
  "avoid planting trees along the perimeter and the parking lot, agreed to put landscaping on a "
  "raised platform against the existing county wall, and agreed to help design and pay for a "
  "reinforced concrete safety barrier along Warm Springs Road.",

  "The objections were not about sidewalks. Marija Minic, a desert tortoise biologist with the "
  "Sierra Club's Toiyabe chapter, told the commission: “Data centers are destroying "
  "communities, driving climate change, consuming resources and enriching tech billionaires.” "
  "Commissioner Michael Naft answered the room directly. “I want to thank those of you who "
  "came today with some good facts,” he said, “but I think some of them don't actually "
  "apply to what is actually happening here.” He noted the building would run on closed-loop "
  "cooling with near-zero water use for operations and be supported entirely by renewable "
  "sources.",

  "Commissioner Tick Segerblom went the other way and said the county should write an ordinance. "
  "“Because obviously we don't want to spend water, we don't want to spend electricity,” "
  "he said. “This valley is so small.” On July 7 the commissioners signalled they would "
  "develop data center standards after residents pressed them on water, energy and environmental "
  "impact, and they have since tightened the heavy industrial zoning rules, which is the tool "
  "actually available to them. Henderson is separately weighing a pause of its own.",

  "The water rule that matters here was written before the boom. The Southern Nevada Water "
  "Authority banned evaporative cooling in new commercial and industrial construction in 2023, "
  "having found it the second largest consumptive use of water in Southern Nevada after outdoor "
  "irrigation. Google's Henderson data center opened in 2020, before that ban, and still uses "
  "evaporative cooling. The Las Vegas Review-Journal called it the thirstiest data center in "
  "Nevada; reported 2024 figures run from at least 205 million gallons for cooling to 352 million "
  "gallons in total, the latter about what 2,700 households use in a year.",

  "The state moved in September. Governor Joe Lombardo signed Executive Order 2026-005 on the "
  "19th, creating the Nevada Standard for Responsible Data Center Development. A developer seeking "
  "a partial tax abatement through the Governor's Office of Economic Development must now pay the "
  "Local School Support Tax in full and the general fund share of sales and use tax, meet local "
  "water standards, cover the cost of the utility service it needs rather than shifting it to "
  "other ratepayers, and undertake not to impede public access to electricity during a grid "
  "emergency. The change that matters is procedural: the state used to have to approve an "
  "abatement once a company met the criteria, and now it does not have to advance the application "
  "at all.",

  "“This order sets clear expectations while opening the door to billions in responsible "
  "investment,” Lombardo said, and on the school tax, “that wasn't right, and I'm proud "
  "to correct it and make certain those dollars reach our classrooms.” Attorney General Aaron "
  "Ford, a Democrat, called it a last-ditch excuse for an executive order and said it is not a "
  "reflection of what Nevada communities are asking for. The Data Center Coalition said the "
  "policies create additional hurdles to development.",

  "Underneath all of it is the load. NV Energy now expects to need 50 per cent more energy than it "
  "projected just two years ago, with demand potentially doubling by 2030, and it has filed large "
  "load service agreement applications for Amazon Data Services, Vantage and Novva among others "
  "alongside its 2027-2046 resource plan. Nevada legislators will take up a bill in 2027 that "
  "would end the tax breaks and impose a statewide pause on building or expanding these "
  "facilities."
 ],
 "sources": [
  "https://www.govtech.com/artificial-intelligence/clark-county-nev-commissioners-approve-data-center-project",
  "https://www.fox5vegas.com/2026/06/18/clark-county-approves-switch-data-center-project-southwest-valley-after-public-opposition/",
  "https://www.carsonnow.org/09/19/2026/lombardo-curtails-nevada-data-center-tax-break-program-in-executive-order",
  "https://thisisreno.com/2026/09/lombardo-nevada-data-center-order/",
  "https://nevadacurrent.com/2026/06/18/las-vegas-data-center-expansion-approved-as-officials-ponder-need-for-future-regulations/",
  "https://www.reviewjournal.com/news/environment/calls-grow-for-clark-county-data-center-regulation-3847642/",
  "https://thenevadaindependent.com/article/nevadas-largest-county-to-consider-data-center-regulations-but-likely-not-a-moratorium",
  "https://thenevadaindependent.com/article/henderson-considers-data-center-pause-amid-construction-boom-across-clark-county",
  "https://www.reviewjournal.com/news/environment/nevada-lawmakers-could-hit-pause-on-data-centers-end-their-tax-breaks-3870456/",
  "https://nevadacurrent.com/2026/03/26/lawmakers-in-driest-state-weigh-excessive-water-and-energy-needs-of-data-centers-they-court/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d paras, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs']),len(R[k]['sources'])))
