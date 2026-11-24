# -*- coding: utf-8 -*-
"""Batch twenty-one: Chester County PA, Collin County TX.

Method note: three searches each, then four articles opened for Chester County and two for
Collin County. Nearly everything specific below came out of the articles rather than the search
results.
"""
import io, json, os

R = {

"/data-centers/united-states/pennsylvania/chester-county/": {
 "paragraphs": [
  "Steve Hacker's well in East Vincent Township ran dry for 39 days in October 2024, during a "
  "drought. When the data centers started being proposed around him he put the two facts next to "
  "each other: “They want to pull millions of gallons out. I don't see how that can work.” "
  "That is the argument in Chester County in one sentence, and it is being made township by "
  "township rather than at the county level.",

  "East Vincent's supervisors rejected the largest of the proposals in the last week of May 2026, "
  "unanimously. Pennhurst Holdings LLC had applied to build 1.9 million square feet of data "
  "center, three two-storey buildings plus a power generation and battery storage facility, on the "
  "grounds of the former Pennhurst State School and Hospital near the Schuylkill River and "
  "existing homes. The township's planning and environmental commissions had both recommended "
  "refusal, elected officials from neighbouring Spring City urged denial, residents filled the "
  "meetings, and the room applauded when the vote came. “This is only the beginning,” said "
  "John Binelli, one of the local campaigners. The developer's attorney, Matt McHugh, said the "
  "company would appeal to the Chester County Court of Common Pleas and challenge the township's "
  "reading of its own zoning rules.",

  "The company had reached that hearing by a particular route. Supervisors declined to vote on a "
  "proposed ordinance that would have added restrictions on data centers, so Pennhurst Holdings "
  "applied for conditional use permitting under the rules as they stood, with its attorney saying "
  "the hearings themselves would address the public's questions about water and electricity.",

  "North Coventry went further and refused a project that had not formally been filed. Envision "
  "Land Use presented a boutique data center informally to supervisors in February 2026, for an "
  "industrial lot at 299 West Schuylkill Road on Route 100, next to a PECO substation and a "
  "residential development. Anti-data-center signs went up across the township, and the board "
  "voted 3-2 to reject it before an application existed. Envision said it would take the project "
  "elsewhere. The supervisors then told staff to start drafting an ordinance for the next one.",

  "That is now the county-wide pattern: write the rules before the developer arrives. Tredyffrin, "
  "West Bradford and Uwchlan are all drafting ordinances, West Chester's council unanimously "
  "approved one in July 2026 amending Chapter 112 to define data center terms and make data "
  "centers and data center campuses conditional uses in the industrial district, and in April the "
  "county planning commission published a Data Center Ordinance Guide jointly with Montgomery "
  "County, recommending the conditional use route and supplying the language for it.",

  "In East Whiteland the fight has turned into a question about the government itself. A 1.5 "
  "million square foot data center from Green Fig LLC and Sentinel Data Centers is planned for the "
  "former 79-acre Cyprus Foote Mineral property, a Superfund site straddling East and West "
  "Whiteland, with early approvals granted in 2018 and 2024 and expansion requests filed in 2026. "
  "Jessica Larkin, a 44-year-old resident, gathered more than 500 signatures in under a fortnight "
  "to put a question on the November 3 ballot asking whether the board of supervisors should grow "
  "from three members to five. Her stated case is that a township of about 15,000 people would "
  "benefit from a broader range of perspectives, on a board whose members serve six-year terms. "
  "The board and its chair did not comment on the ballot question.",

  "The pressure runs outward from here in both directions. PECO is planning 67 megawatt lines that "
  "start in East Coventry in this county and run along the Schuylkill through Linfield in "
  "Montgomery County to serve a data center in Limerick Township. State Senator Katie Muth, whose "
  "district takes in the Chester County site, has proposed a two-year statewide moratorium. Polling "
  "puts opposition to a data center in one's own community at 42 per cent of Pennsylvanians, while "
  "Governor Josh Shapiro has been celebrating a $20 billion Amazon Web Services commitment "
  "elsewhere in the state."
 ],
 "sources": [
  "https://www.spotlightpa.org/news/2026/01/data-centers-pennsylvania-debate-legislature-environment-environment/",
  "https://www.inquirer.com/news/pennsylvania/pennhurst-data-center-rejected-east-vincent-20260522.html",
  "https://www.thecooldown.com/green-business/pennsylvania-township-rejects-data-center/",
  "https://www.inquirer.com/news/pennsylvania/north-coventry-data-center-20260515.html",
  "https://www.inquirer.com/news/pennsylvania/tredyffrin-data-center-ordinance-20260421.html",
  "https://www.inquirer.com/news/pennsylvania/east-whiteland-board-supervisors-data-center-20260819.html",
  "https://www.chescoplanning.org/UandI/DataCenters/pdf/DataCenterOrdinanceGuide.pdf",
  "https://www.suburbanrealtorsalliance.com/news/2026/07/24/chester-county/west-chester-council-approves-data-center-zoning-ordinance/",
  "https://www.cityandstatepa.com/policy/2026/04/power-plays-battle-over-data-centers-pa/412554/",
  "https://whyy.org/articles/pennsylvania-data-centers-demand/"
 ]
},

"/data-centers/united-states/texas/collin-county/": {
 "paragraphs": [
  "More than 400 written objections were filed against Project Tomahawk before Prosper's planning "
  "and zoning commission voted on it, and the commission denied the rezoning unanimously. The "
  "project is a $580 million, 225,000 square foot data center on about 37 acres near FM 1385 and "
  "Parvin Road, proposed by the Dallas developer White Rose Partners. Commissioners gave their "
  "reasons as noise, electricity consumption, environmental impact and whether a building like "
  "that fits the town's long-term land use plan. The application went on to the Prosper Town "
  "Council on September 8.",

  "The noise objection in Prosper was more technical than most. Residents argued that the "
  "A-weighted decibel measurement used in these applications understates low-frequency sound, the "
  "part that carries through walls and windows rather than stopping at them, so a facility can "
  "meet the ordinance and still be audible inside a house all night.",

  "Plano's residents have gone to their council asking for the same protection before a project "
  "arrives. Kyle McGinn asked officials to explore a moratorium or else add a dedicated data "
  "center category to the city's Unified Development Code. Shirley Lawson told the council she "
  "would start recruiting residents and organising politically if nothing came of it, and pointed "
  "out that its members face re-election in 2027. A council member conceded there is no zoning "
  "category for an AI facility in Plano at all and agreed to take the request to leadership, with "
  "a 30-day response.",

  "Princeton's council reached the same conclusion after a meeting that ran to 11.26 at night. On "
  "June 23, 2026 it approved a staff recommendation to consider zoning rules restricting data "
  "centers inside the city limits, after Councilwoman Cristina Todd questioned whether allowing "
  "them in the C-2 district gave any real protection to the neighbourhoods next door. At county "
  "level, Collin County's commissioners are drawing up noise rules; McKinney and Plano already "
  "have ordinances of their own.",

  "The scale behind all of this is regional. North Texas is now the largest primary data center "
  "market in the United States, and Collin sits with Dallas, Denton, Tarrant and Ellis counties "
  "inside Oncor's territory, where the projected large-load growth is most concentrated. A survey "
  "by the North Central Texas Council of Governments found 96 per cent of responding communities "
  "worried about the strain on water and 81 per cent about the grid, with many saying plainly they "
  "do not have the infrastructure for developments this size. A group called DFW Communities Over "
  "Data Centers has formed across the metroplex, and Fort Worth, Denton and Granbury have adopted "
  "or proposed moratoriums.",

  "The state has now intervened on exactly those two grounds. In early August 2026 Governor Greg "
  "Abbott halted new data center grid interconnections pending a project-by-project audit of "
  "energy and water use by the Public Utility Commission and ERCOT. The numbers behind that order "
  "explain it: ERCOT's large-load queue stood at 226 gigawatts in November 2025, up from 63 the "
  "previous December, with data centers close to three quarters of it, and total interconnection "
  "requests have since been put at around 474 gigawatts, more than five times the record peak "
  "demand of the entire Texas grid.",

  "On water, a 2026 paper from the Houston Advanced Research Center estimates Texas data centers "
  "already account for roughly 9,567 megawatts of electricity and 25 billion gallons of water "
  "directly and indirectly, and that by 2030 they could take between 0.5 and 2.7 per cent of all "
  "the water the state uses in a year."
 ],
 "sources": [
  "https://www.keranews.org/news/2026-09-03/data-center-growth-north-texas-map",
  "https://citizenportal.ai/articles/9776196/texas/collin-county/prosper/hundreds-of-residents-urge-denial-of-proposed-prosper-data-center-citing-noise-water-and-propertyvalue-concerns",
  "https://citizenportal.ai/articles/9448271/Texas/Collin-County/Prosper/Prosper-residents-tell-commission-a-proposed-data-center-doesnt-belong-in-backyard",
  "https://tx3dnews.com/plano-residents-call-for-data-center-moratorium/",
  "https://princetonherald.com/2026/07/02/council-agrees-to-limit-data-centers-find-city-manager/",
  "https://princetonherald.com/2026/06/11/council-plans-data-center-regulation/",
  "https://gov.texas.gov/news/post/governor-abbott-directs-comprehensive-data-center-audit",
  "https://www.utilitydive.com/news/texas-hits-pause-data-center-interconnections/827046/",
  "https://www.engieresources.com/market-insight/texas-data-centers-the-new-large-load-shaping-ercot/",
  "https://www.governing.com/infrastructure/texas-data-center-boom-is-creating-a-new-political-problem"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d paras, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs']),len(R[k]['sources'])))
