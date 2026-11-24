# -*- coding: utf-8 -*-
"""Batch twenty-two: King George County VA, Milam County TX.

Method: three searches each, then three articles opened for King George (one refused) and two
for Milam. The quotes and the proffer detail below are from the articles, not the search results.
"""
import io, json, os

R = {

"/data-centers/united-states/virginia/king-george-county/": {
 "paragraphs": [
  "On the evening of June 3, 2026 the public comment period at the King George County Board of "
  "Supervisors turned into an unscheduled town hall. Residents came to object to three data center "
  "projects the county had already approved. “I'm, like, freaking out,” said Briana "
  "Morgan, who had moved to the county the previous October. “We bought our forever home. "
  "I've got little kids and I don't want a data center in my backyard.” Joshua Mills told the "
  "board: “I'm terrified.” One resident asked everyone in the room who opposed the "
  "projects to put a hand up, so the supervisors could see it.",

  "The answer they got was procedural. County Administrator Matthew Smolnik told them the "
  "legislative process was already over and that everything from that point on was administrative. "
  "Supervisor William Davis said residents needed to be more civically engaged and suggested they "
  "sign up for county alerts about public hearings.",

  "The three approvals were Dahlgren West, 500 acres, passed unanimously in August 2025; a "
  "300-acre, thirteen-building campus from Green Energy Ventures, passed 3-2 in February 2026; and "
  "Amazon Data Services, approved back in 2023 and now the subject of litigation.",

  "Dahlgren West is the largest thing the county has ever permitted: roughly 485 to 497 acres on "
  "the west side of Route 301 near Washington Mill Road, with as much as 9 million square feet "
  "across ten to fifteen buildings. The supervisors approved the rezoning, a change to the "
  "comprehensive plan and a special exception together. Water is what the proffers were negotiated "
  "over. The applicant committed that the project will not use county well water for any cooling "
  "purpose, revised the package to limit county water for cooling generally, and proffered a "
  "200,000-gallon water tower to the county.",

  "The Amazon case is the one other Virginia localities are watching. The $6 billion project was "
  "approved in December 2023 with a performance agreement and a tax abatement; a newly elected "
  "board moved to renegotiate that agreement within weeks, and by April 2024 was voting to "
  "reconsider the rezoning of more than 500 acres and put the land back to agricultural. The "
  "question a court now has to answer is how far a developer's property rights vest once a board "
  "has voted, and the answer will matter well beyond King George.",

  "Where the county has moved fastest is on sound, and it moved before most of Virginia. The noise "
  "ordinance was rewritten in 2023 to separate continuous noise from impulse noise and to add dBC "
  "as a measure of violation, which matters because a data center produces a constant low-frequency "
  "hum that A-weighted measurement understates and that carries into houses. Ground-mounted "
  "mechanical equipment must now sit at least 75 feet from any property line where there is "
  "residential development or residential zoning. Planning staff recommended folding the zoning "
  "advisory committee's further recommendations into the coming comprehensive plan update before "
  "amending the zoning ordinance again, and the board agreed to that order.",

  "None of this was required of them. Virginia has no statewide data center regulation, so every "
  "rule King George has is one it wrote itself, which is also why the residents who turned up in "
  "June were told they had arrived a year late."
 ],
 "sources": [
  "https://www.fredericksburgfreepress.com/2026/06/03/this-shouldve-happened-last-year-king-george-residents-protest-already-approved-data-centers/",
  "https://www.fredericksburgfreepress.com/2026/02/19/king-george-board-of-supervisors-approves-300-acre-data-center-campus/",
  "https://www.datacenterdynamics.com/en/news/9-million-sq-ft-data-center-campus-proposed-in-virginias-king-george-county/",
  "https://citizenportal.ai/articles/7083698/virginia/king-george-county/king-george-supervisors-approve-dahlgren-west-datacenter-rezoning-special-exception-and-proffers",
  "https://citizenportal.ai/articles/8242114/virginia/king-george-county/king-george-residents-supervisors-spar-over-data-centers-and-water-use-as-county-seeks-protections",
  "https://www.govtech.com/artificial-intelligence/virginia-court-case-could-influence-other-data-center-fights",
  "https://www.kinggeorgecountyva.gov/DocumentCenter/View/10214/Data-Center-Memo_finalpdf",
  "https://www.kinggeorgecountyva.gov/DocumentCenter/View/10213/Noise-Memo_finalpdf",
  "https://virginiamercury.com/2025/06/20/virginia-doesnt-have-statewide-data-center-regulations-localities-are-making-their-own-rules-instead/"
 ]
},

"/data-centers/united-states/texas/milam-county/": {
 "paragraphs": [
  "Everything in Milam County runs off one dead aluminium smelter. The old Alcoa plant at Rockdale "
  "came with a grid connection built for smelting, and that connection is what the data center "
  "industry is actually buying here.",

  "Riot Platforms holds the largest piece of it: a Rockdale site with a 700 megawatt "
  "interconnection and a dedicated water supply, on 200 acres the company bought outright in 2026 "
  "for $96 million. Riot intends to convert the full 700 megawatts to data center tenants. AMD "
  "took an initial 25 megawatts of critical IT load, delivered in phases between January and May "
  "2026, on a ten-year lease worth up to $311 million that could reach $1 billion with its three "
  "five-year extensions. Anthropic has signed a lease at the same former Alcoa site reported at "
  "around $9 billion. Bitdeer separately paid $100 million for 200 acres next to its existing "
  "Rockdale facility, and OpenAI's Stargate site at Burlington is due to finish later in 2026.",

  "What the county collects from that was decided in early February 2026, when commissioners "
  "approved a 75 per cent tax abatement for Riot Rockdale lasting ten years. The company will pay "
  "a quarter of its property taxes from 2028, through a payment in lieu of taxes arrangement. The "
  "vote was nearly unanimous.",

  "The exception was Commissioner Wesley Payne of Precinct 4. “I thought that was too "
  "steep,” he said. “I'm not against giving an abatement entirely, depending on "
  "circumstances, but I'm against that high of an abatement on a data center.” He added that "
  "the county should have set a lower percentage to help its citizens out. James Pesl, a resident, "
  "put the general case at the same meeting: tax abatements can be a tool, but they can also "
  "become detrimental to the community that grants them.",

  "The politics around Rockdale are not what the map would predict. A Texas Tribune analysis found "
  "at least 82 data centers, close to 60 per cent of all those planned or under construction in "
  "Texas, sitting in state House districts that voted for Donald Trump and elected a Republican "
  "representative in 2024, while a Quinnipiac poll in March found 65 per cent of Americans oppose "
  "an AI data center being built in their own community.",

  "Rena Schroeder, 62, whose land lies north of the Stargate site, took a proposal for a data "
  "center ban to her Falls County Republican precinct meeting in late March. The party rejected "
  "it. “The only thing that I'm gonna revise, right here, right now, is my commitment to the "
  "Republican Party,” she told them. “Goodbye.” She has kept campaigning since: "
  "“I have to fight for Texas land because if I don't, where's my daughter gonna go?”",

  "The split runs through the legislature too. Rural Republicans such as Cody Vasut of Angleton "
  "have pushed to give counties the authority to regulate these projects; urban Republicans such "
  "as Senator Paul Bettencourt of Houston have resisted it, arguing you cannot have 254 counties "
  "and a thousand cities each arriving at a different answer. Counties like Milam, meanwhile, have "
  "no tool to stop a development and one tool to tax it."
 ],
 "sources": [
  "https://www.kxxv.com/news/local-news/in-your-neighborhood/milam-county/paving-the-way-for-progress-milam-county-approves-tax-abatement-for-new-data-center",
  "https://www.texastribune.org/2026/05/07/texas-republicans-data-centers-rural/",
  "https://www.sec.gov/Archives/edgar/data/1167419/000110465926004551/riot-20260116xex99d1.htm",
  "https://www.datacenterdynamics.com/en/news/riot-to-convert-cryptomine-site-in-texas-to-hpc-signs-25mw-lease-with-amd/",
  "https://www.statesman.com/business/technology/article/anthropic-riot-platforms-rockdale-texas-22383624.php",
  "https://www.statesman.com/business/technology/article/amd-data-center-rockdale-texas-21305481.php",
  "https://www.datacenterdynamics.com/en/news/bitdeer-buys-200-acres-in-milam-county-texas-to-expand-ai-and-hpc-data-center/",
  "https://www.compute-atlas.com/counties/milam-tx",
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
