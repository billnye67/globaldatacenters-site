# -*- coding: utf-8 -*-
"""Batch eight: Japan, Canada, Amazon Web Services, Meta, Microsoft."""
import io, json, os

R = {

"/data-centers/japan/": {
 "paragraphs": [
  "Japan is trying to solve the data center problem with geography. The government's Watt-Bit "
  "Collaboration, an advisory body set up to align electricity planning with computing demand, is "
  "building a framework to push capacity out of Tokyo and Osaka, where the grid is congested and "
  "land is scarce, and into Hokkaido, Tohoku, Chubu and Kyushu, where renewable generation is more "
  "plentiful, land costs less and there is headroom on the network.",

  "There is money behind the map. The Subsidy for Development of Regional Data Centres covers part "
  "of the site preparation and infrastructure cost for operators willing to build in Chiba, "
  "Ibaraki, Hokkaido and Kyushu rather than beside the existing hubs.",

  "Efficiency rules are expected during 2026, with penalties for facilities that fail to reach a "
  "power usage effectiveness of 1.4. That is a looser ceiling than Germany's 1.2 or Singapore's "
  "1.3, but it is the first time Japan has attached a consequence to the number rather than "
  "publishing it as guidance.",

  "The resistance is a newer thing here and it is an urban story. Japanese newspapers reported "
  "through 2026 that opposition is growing in built-up areas where a data center goes up against "
  "housing with no room to set it back, and where residents have raised electricity use, water and "
  "the strain on the grid. Officials have generally described the objections as something that can "
  "be worked out; the residents doing the objecting have not agreed.",

  "The scale of the commitment makes the question urgent. Hyperscale operators have announced "
  "something in the region of $26 billion of Japanese investment against a power system that does "
  "not obviously have room for it, which is why the state is trying to direct where the buildings "
  "land rather than leaving it to the market."
 ],
 "sources": [
  "https://www.japantimes.co.jp/news/2026/07/18/japan/society/japan-data-centers-opposition/",
  "https://japantoday.com/category/tech/opposition-to-data-centres-grows-in-cramped-urban-japan",
  "https://intelligence.uptimeinstitute.com/resource/japan-joins-push-data-center-regulation",
  "https://www.eco-business.com/news/japan-launches-programme-to-cut-data-centre-emissions-as-ai-power-demand-surges/",
  "https://www.datacenterknowledge.com/data-center-construction/japan-s-data-center-boom-growth-persists-despite-power-constraints-and-construction-hurdles",
  "https://introl.com/blog/japan-data-center-power-crisis-hyperscaler-investment-2026",
  "https://www.tmtfinance.com/insights/how-japan-balancing-datacentre-growth-climate-goals"
 ]
},

"/data-centers/canada/": {
 "paragraphs": [
  "There is no Canadian data center policy. There are four provincial ones, and they point in "
  "different directions.",

  "Quebec is the most restrictive. The province has limited new power procurement for large data "
  "center projects since 2024, which has effectively halted new development, and Hydro-Quebec has "
  "proposed a dedicated industrial tariff for any data center drawing more than 5 megawatts at "
  "roughly 13 cents a kilowatt hour from the middle of 2026, about double the existing large-power "
  "rate. The utility's stated reason is that the price should reflect the value of the renewable "
  "electricity being consumed and the cost of serving demand on that scale.",

  "Alberta is the most welcoming. Its memorandum of understanding with the federal government "
  "suspends the province's obligations under the Clean Electricity Regulations and explicitly "
  "encourages expanded electricity access for data centers built in Canada. Even there the supply "
  "is rationed: Alberta has set an interim cap of 1,200 megawatts on data center allocations.",

  "British Columbia has taken the middle route of publishing the number. It is making 400 "
  "megawatts available over two years from February 2026, with no single project allowed more than "
  "145 megawatts. Ontario, Quebec and British Columbia are not closed to the industry so much as "
  "full, with constrained grids limiting how many large connection requests each can absorb.",

  "The industry's answer to all of this is to stop asking. Bring-your-own-power arrangements, in "
  "which a developer builds its own generation rather than joining the connection queue, have "
  "become the standard workaround in Canadian projects, which moves the emissions and the siting "
  "argument rather than settling it."
 ],
 "sources": [
  "https://www.blg.com/en/insights/2026/07/data-centres-in-canada-current-state",
  "https://www.digitaljournal.com/article/four-provinces-set-different-rules-for-data-centres/",
  "https://economics.td.com/ca-data-centers-and-grid-constraints",
  "https://www.osler.com/en/insights/reports/2025-legal-outlook/powering-ai-canadas-evolving-electricity-grid-connection-policies/",
  "https://canada.constructconnect.com/dcn/news/projects/2026/04/data-centre-grid-demands-and-the-byop-bring-your-own-power-solution",
  "https://thelogic.co/news/the-big-read/data-centres-artificial-intelligence-canada-map/"
 ]
},

"/company/amazon-web-services/": {
 "paragraphs": [
  "Amazon has lost more fights in public than any other data center developer, largely because it "
  "builds in more places. The clearest was Tucson. On August 6, 2025 the city council voted 7-0 "
  "against Project Blue, a 290-acre campus linked to Amazon, after three public meetings drew "
  "crowds of 800 to 1,000 people. The plan would have taken about 2,000 acre-feet of city water a "
  "year, which would have made it the largest single water user in Tucson. The vote also killed a "
  "June agreement for Pima County to sell the land, near the county fairgrounds, because that sale "
  "depended on annexation and city water service.",

  "The same pattern reached Ohio in August 2026. Trustees in St. Clair and Madison townships, in "
  "rural Butler County, rejected a petition to annex township land into the city of Trenton for an "
  "Amazon data center, citing environmental damage and the cost of maintaining the roads. Amazon "
  "had offered each township $5 million on top of the property taxes. Butler County commissioners "
  "have the final say after a public hearing.",

  "In Missouri the argument has gone to court. Amazon and Google are building on a combined 1,900 "
  "acres on opposite sides of Interstate 70 east of New Florence in Montgomery County. The "
  "advocacy group Preserve Montgomery County sued the county and the state Department of Economic "
  "Development in February 2026 to stop the Amazon site, and on September 21 Cole County Circuit "
  "Judge Cotton Walker refused to dismiss most of the case, ruling that the group has standing to "
  "bring it. A separate Sunshine Law suit over what the public was told is still pending. Amazon "
  "has put its Missouri investment at $10 billion and has promised the project will not raise "
  "electricity rates.",

  "None of this has slowed the programme down much. What it has changed is the route: annexation "
  "requests, water service agreements and county land sales have turned out to be the points where "
  "a community can actually say no, and that is where the company now gets stopped."
 ],
 "sources": [
  "https://azluminaria.org/2025/08/06/tucson-city-council-rejects-project-blue-amid-intense-community-pressure/",
  "https://www.tucsonsentinel.com/local/report/080625_project_blue/",
  "https://www.datacenterdynamics.com/en/news/residents-cheer-as-tucson-rejects-amazons-massive-project-blue-data-center-campus-in-arizona/",
  "https://spectrumlocalnews.com/product-pages/nyc/news/2026/08/27/leaders-turn-down-millions-reject-annexation-plan-for-amazon-data-center",
  "https://www.kbia.org/missouri-news-network/2026-09-21/advocacy-group-can-continue-to-challenge-data-centers-being-built-in-montgomery-county-judge-rules",
  "https://www.techtimes.com/articles/318687/20260619/amazon-missouri-data-center-10-billion-no-rate-hike-pledged-sunshine-law-suit-pending.htm"
 ]
},

"/company/meta/": {
 "paragraphs": [
  "The argument about Meta is mostly an argument about power plants. Its campus in Richland "
  "Parish, Louisiana, a roughly two-gigawatt site costed at about $10 billion, was won for the "
  "state by Entergy Louisiana's promise to build dedicated natural gas turbines for it, enough "
  "generation to supply the city of New Orleans about seven times over. That commitment is what "
  "separated Louisiana's bid from the rival states.",

  "The plant count keeps growing. Regulators approved three gas plants for the project in 2025, "
  "and in April 2026 Entergy applied to build seven more, each rated at 754 megawatts, which would "
  "bring the total to ten new gas-fired plants built to serve one customer.",

  "Meta has not agreed to cover the whole cost of powering it, and that gap is the substance of "
  "the opposition. The Union of Concerned Scientists and the Louisiana-based Alliance for "
  "Affordable Energy argue the risk has been pushed onto Entergy's existing customers, who could "
  "pay more without any direct benefit. The Lens reported in August 2026 that Meta has withheld "
  "information about the project while that risk shifts.",

  "The objection is not only environmental. Some of Louisiana's largest oil, gas and petrochemical "
  "companies formed a coalition, the Louisiana Energy Users Group, to oppose Entergy's proposal, "
  "warning it creates unprecedented risk for existing industrial customers who could end up "
  "subsidising the data center's electricity.",

  "The state has meanwhile made this easier rather than harder. In December 2025 Louisiana created "
  "a fast track for approving power plants built to serve data centers and other very large "
  "electricity users."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/entergy-breaks-ground-on-two-natural-gas-plants-for-metas-2gw-data-center-in-richland-parish-louisiana/",
  "https://thelensnola.org/2026/08/18/meta-louisiana-data-center-ratepayer-costs/",
  "https://blog.ucs.org/paul-arbaje/meta-hides-data-center-info-as-it-pushes-more-risks-to-entergys-customers/",
  "https://www.spglobal.com/energy/en/news-research/latest-news/natural-gas/082025-louisiana-regulators-approve-new-entergy-infrastructure-for-10-bil-meta-data-center",
  "https://lailluminator.com/2025/12/19/electricity-data-centers/",
  "https://lailluminator.com/2025/08/19/meta-power-plant-vote/",
  "https://gvwire.com/2026/07/27/5-things-to-know-about-metas-giant-data-center-in-louisiana/"
 ]
},

"/company/microsoft/": {
 "paragraphs": [
  "Microsoft is the one hyperscaler that has publicly changed its mind twice. In 2025 analysts "
  "reported it cancelling roughly 200 megawatts of leased AI data center capacity and walking away "
  "from more than two gigawatts of deals, while freezing about 1.5 gigawatts of its own near-term "
  "self-build projects that had been scheduled to come online in 2025 and 2026. Construction was "
  "paused on a Wisconsin site widely understood to have been intended for OpenAI workloads.",

  "By September 2026 the company was reported to be expanding again, towards something on the "
  "order of 38 gigawatts, after losing customers to rivals during the pause and running into a "
  "capacity shortage of its own making.",

  "For the communities on this list that whiplash is the point. A paused Microsoft project is not "
  "a cancelled one, and a site that went quiet in 2025 can be back in front of a planning board in "
  "2026 with the same footprint and a different name on the application.",

  "The wider climate has hardened in the meantime. An Echelon Insights survey in June 2026 found "
  "62 per cent of voters opposed a new data center in their own community, a figure that fell only "
  "to 58 per cent after respondents heard the economic arguments for one, and industry analysts "
  "now treat local opposition as a structural cause of attrition rather than a nuisance, with "
  "something between 30 and 50 per cent of large projects delayed or cancelled across 2025 and "
  "early 2026."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/microsoft-cancels-200mw-of-ai-data-center-leases-report/",
  "https://www.bisnow.com/national/news/data-center/microsoft-is-stepping-away-from-more-than-2gw-of-data-center-capacity-128681",
  "https://newsletter.semianalysis.com/p/microsofts-datacenter-freeze",
  "https://www.networkworld.com/article/3831799/questions-arise-about-reasons-why-microsoft-has-cancelled-data-center-lease-plans.html",
  "https://www.techtimes.com/articles/327304/20260911/microsoft-data-center-expansion-38-gw-triggered-lost-clients-capacity-crisis.htm",
  "https://www.datacenterfrontier.com/hyperscale/article/55270517/does-it-matter-if-microsoft-is-cancelling-ai-data-center-leases"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
