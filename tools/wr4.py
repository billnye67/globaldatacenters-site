# -*- coding: utf-8 -*-
"""Batch four: California, Arizona, New York."""
import io, json, os

R = {

"/data-centers/united-states/california/": {
 "paragraphs": [
  "On September 21, 2026 Governor Gavin Newsom signed seven data center bills at once, a package "
  "his office called the most comprehensive set of data center laws in the country. The core of it "
  "is who pays for the grid: operators must cover the transmission and distribution upgrades their "
  "load creates rather than spreading the cost across California ratepayers, and developers must "
  "disclose how much water a project expects to use. Newsom had vetoed a water-reporting bill the "
  "year before, saying he wanted to understand the effect on the industry and on consumers first.",

  "The laws are signed but not yet finished. The California Public Utilities Commission has until "
  "July 1, 2027 to write the special tariffs the package depends on, and the thresholds that decide "
  "which projects are caught have not been set. The fight that produced the bills was over roughly "
  "$1.8 billion of grid costs and who carries them.",

  "Cities did not wait for Sacramento. Monterey Park, in Los Angeles County, passed a unanimous "
  "45-day moratorium on January 21, 2026, and on March 4 the council voted unanimously to put a "
  "permanent prohibition on the June 2 ballot. Residents approved it by roughly 86 per cent in a "
  "special election, making Monterey Park the first city in the United States to ban data centers "
  "outright. The stated reasons were air quality, drinking water, public health, and the risk to "
  "electricity and water rates.",

  "Others have followed at different speeds. The City of Commerce imposed its own 45-day freeze. "
  "Imperial County's board of supervisors is weighing a temporary moratorium after residents "
  "criticised it for advancing a project. San José's council has told the city manager to draft "
  "standards rather than refuse outright.",

  "The pressure is sharpest in Silicon Valley, where Santa Clara's roughly 60 data centers pay the "
  "city about $29.5 million a year and two finished buildings sit empty because the municipal "
  "utility cannot connect them until the network is upgraded, possibly not before 2028."
 ],
 "sources": [
  "https://www.gov.ca.gov/2026/09/21/governor-newsom-signs-most-comprehensive-data-center-laws-in-the-nation-providing-communities-more-control-on-water-electricity-and-land-use/",
  "https://www.kqed.org/news/12100746/newsom-signs-new-restrictions-on-data-center-development",
  "https://mgrid.org/2026/09/21/newsom-signs-seven-data-center-laws-that-shift-grid-upgrade-costs-with-none-of-the-thresholds-written-yet/",
  "https://www.pillsburylaw.com/en/news-and-insights/california-data-center-deal-large-loads-cost-causation-track.html",
  "https://calmatters.org/newsletter/data-center-monterey-park-ban/",
  "https://www.montereypark.ca.gov/m/newsflash/Home/Detail/1306",
  "https://www.planetizen.com/news/2026/06/137739-california-city-permanently-bans-data-centers",
  "https://www.datacenterdynamics.com/en/news/silicon-valley-data-centers-stand-empty-awaiting-power-connections-report/"
 ]
},

"/data-centers/united-states/arizona/": {
 "paragraphs": [
  "Arizona stopped handing out data center tax breaks on July 1, 2026. Governor Katie Hobbs signed "
  "a budget bill barring the Arizona Commerce Authority from accepting any new application for the "
  "sales tax exemption until June 30, 2029, a three-year pause that is among the more restrictive "
  "state responses in the country. Hobbs had asked the Republican-controlled legislature to repeal "
  "the exemption altogether; the moratorium was the compromise. Developers saw it coming, and "
  "applications roughly doubled in the rush before the deadline.",

  "The session that produced it was dominated by the subject. Data centers came up in at least 84 "
  "hearings, caucus meetings and floor proceedings, and lawmakers filed more than fifty energy "
  "bills, six of them aimed at the tax incentive, after a year of organised opposition to projects "
  "in Tucson, Chandler and Marana. Democratic leaders say the work left undone is water use and "
  "stopping residential ratepayers carrying the cost of the electricity these sites need.",

  "Polling has run against the industry across party lines: majorities of Republicans, Democrats "
  "and independents all favour limiting large data center development, citing water, electricity "
  "demand and who pays for the infrastructure.",

  "Local government has moved faster than the legislature. Tucson adopted an amendment to its "
  "development code on August 5, 2026 by 6-1, effective a month later, imposing a half-mile "
  "setback from homes and forcing large projects through a planned-development process. Around "
  "August 15 the Pima County Board of Supervisors voted 3-2 to have staff draft a four-month "
  "countywide moratorium. Chandler's council voted unanimously to reject the Price Road Innovation "
  "Campus. Casa Grande's council took up a Proposition 207 waiver to settle a $140 million claim "
  "from a data center developer, with binding terms on water, power and noise attached.",

  "It does not all go one way. Mesa's planning commission recommended approval of a 2.2 million "
  "square foot campus on May 13 in a nearly empty chamber, in a meeting that lasted ten minutes, "
  "and in Maricopa County the supervisors approved the permit for Project Baccara, a 160-acre "
  "campus with a 700 megawatt gas plant near Luke Air Force Base, 4-1 against 553 emails of "
  "objection and five in support."
 ],
 "sources": [
  "https://azcapitoltimes.com/news/2026/07/09/data-centers-dominated-2026-session-lawmakers-answered-with-3-year-tax-incentive-pause/",
  "https://news.bloombergtax.com/daily-tax-report-state/arizona-data-center-tax-incentive-pause-signed-by-governor-hobbs",
  "https://www.azfamily.com/2026/06/10/arizona-budget-deal-includes-3-year-pause-data-center-tax-exemptions/",
  "https://www.axios.com/local/phoenix/2026/07/08/data-center-tax-break-applications-double-moratorium",
  "https://news.azpm.org/p/azpmnews/2026/8/13/230837-pima-county-staff-will-develop-moratorium-for-data-centers/",
  "https://www.foxbusiness.com/politics/arizona-city-unanimously-rejects-ai-data-center-after-residents-outcry",
  "https://pinalpost.com/casa-grande-data-center-prop-207-waiver/",
  "https://thecentersquare.com/arizona/article_1169beb3-4240-4752-bf0d-e05b4c860737.html",
  "https://www.kjzz.org/politics/2026-05-06/controversial-data-center-project-in-west-valley-near-luke-air-force-base-clears-regulatory-hurdle"
 ]
},

"/data-centers/united-states/new-york/": {
 "paragraphs": [
  "New York is the first state in the country to stop permitting large data centers. Governor Kathy "
  "Hochul signed Executive Order 62 on July 14, 2026, pausing state permitting for any data center "
  "drawing 50 megawatts or more until the Department of Public Service finishes a generic "
  "environmental impact statement on what the industry does to the grid, water supply, air quality "
  "and the communities hosting it. That review is expected to take about a year.",

  "Hochul put the reasoning in terms of bills. “These hyperscale AI data centers consume "
  "enormous amounts of power, truly threatening to outpace our grid's capacity, and they drive up "
  "costs for local rate payers,” she said. The order itself states that the cost of the "
  "electrical upgrades needed to serve very large loads should not fall on ordinary New Yorkers, "
  "and the administration wants operators either to pay a premium for the supply or to generate "
  "their own, with something going back to the towns that host them.",

  "The threshold has already been tested. In Massena, in St. Lawrence County, North Country "
  "Collocation Services wants to build a 1.5 million square foot campus of about 635 megawatts near "
  "the St. Lawrence River, and argues the state moratorium does not reach it because it needs no "
  "further discretionary permits from the Department of Environmental Conservation. On September 16 "
  "the town board voted 3-2 against a six-month local moratorium that would have paused it anyway, "
  "after more than twenty people spoke at the hearing and more than a hundred residents and "
  "Akwesasne Mohawk tribal members had turned out against the project. A petition drive is still "
  "running.",

  "Elsewhere the fights have gone the other way. Niagara Falls city council approved a settlement "
  "ending a years-long dispute and clearing Niagara Falls Redevelopment to build a $1.48 billion "
  "data center. A separate battle is running in the Hudson Valley about thirty miles north of "
  "Manhattan.",

  "The legislature has not finished with it either. State Senator Kristen Gonzalez has taken a "
  "statewide tour round the affected towns to push a Responsible Data Center Development Act, which "
  "would put the executive order's temporary pause on a statutory footing."
 ],
 "sources": [
  "https://www.governor.ny.gov/executive-order/no-62-establishing-temporary-moratorium-data-centers-new-york-while-state-develops",
  "https://www.governor.ny.gov/news/first-statewide-moratorium-new-hyperscale-data-centers-launched-governor-kathy-hochul",
  "https://www.cnbc.com/2026/07/14/new-york-ai-data-center-ban.html",
  "https://www.foley.com/insights/publications/2026/08/new-york-just-pressed-pause-on-large-data-center-permitting/",
  "https://www.utilitydive.com/news/behind-the-new-york-data-center-pause-is-legislation-that-could-impact-exis/826369/",
  "https://www.northcountrynow.com/stories/massena-votes-down-proposed-data-center-moratorium-in-split-vote-clears-way-for-nccss-400-mw,391015",
  "https://www.northcountrypublicradio.org/news/story/53966/20260917/massena-town-board-clears-a-path-for-controversial-data-center",
  "https://www.nysenate.gov/newsroom/press-releases/2026/kristen-gonzalez/ny-state-senator-kristen-gonzalez-announces-ny-fights",
  "https://ny1.com/nyc/all-boroughs/politics/2026/08/27/a-data-center-battle-unfolds-30-miles-north-of-manhattan"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
