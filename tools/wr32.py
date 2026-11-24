# -*- coding: utf-8 -*-
"""Batch thirty-two: Clark County NV and Collin County TX, second pass.

Redo method:
  Clark County   3 further searches on Switch LAS 19, Henderson and the Google water figures.
                 Nevada Current and the Review-Journal opened with curl. 6 searches, 5 opened.
  Collin County  3 further searches on Project Tomahawk, White Rose Partners and Celina.
                 CBS Texas and NBC DFW opened. 6 searches, 4 opened.

Corrections to what was published before, all from opened sources:
  - Clark said Henderson was "separately weighing a pause of its own". Henderson REJECTED the
    moratorium in July 2026 and chose development agreements instead.
  - Clark gave Google Henderson's 2024 water as a range "at least 205 million gallons for cooling
    to 352 million in total". The Review-Journal figure is 352 million gallons, and that is only
    the water not recycled or returned to Lake Mead. Google's own 2026 report gives 239.4 million
    for 2025.
  - Collin said the Tomahawk application "went on to the Prosper Town Council on September 8".
    The council never voted: White Rose Partners withdrew hours beforehand.
  - Collin implied the commission denied the rezoning. It voted 7-0 to RECOMMEND denial.
  - Collin placed the site in Collin County without qualification. Prosper straddles the Collin
    and Denton line and the site sits on the Denton side; that is now said on the page.
"""
import io, json, os

R = {

"/data-centers/united-states/nevada/clark-county/": {
 "paragraphs": [
  "Clark County cannot legally ban or pause a data center, so what it does instead is attach "
  "conditions. In June 2026 the commissioners, sitting as the zoning commission, unanimously "
  "approved Switch's LAS 19: a 56,800 square foot building on nine acres near Warm Springs Road, "
  "next to the company's Core Campus by Decatur Boulevard and the 215 Beltway, already the largest "
  "cluster of data center space in Southern Nevada.",

  "What months of public comment produced was a sidewalk. Switch had asked to skip planting trees "
  "along the perimeter and the parking lot; commissioners signalled they would not support the "
  "waiver and the company withdrew it during the meeting. County staff then proposed, and Switch "
  "accepted, a condition requiring it to contribute to the design and construction of a reinforced "
  "barrier separating the pavement from the traffic lanes along Warm Springs Road, with "
  "landscaping set on a raised platform against the existing county wall.",

  "The objections were not about sidewalks. Marija Minic, a desert tortoise biologist with the "
  "Sierra Club's Toiyabe chapter, told the commission: “Data centers are destroying "
  "communities, driving climate change, consuming resources and enriching tech billionaires.” "
  "Commissioner Michael Naft answered the room directly. “I want to thank those of you who "
  "came today with some good facts,” he said, “but I think some of them don't actually "
  "apply to what is actually happening here.” He noted the building would use closed-loop "
  "cooling with near-zero water use for operations and run on renewable supply.",

  "Commissioner Tick Segerblom went the other way and said the county should write an ordinance. "
  "“Because obviously we don't want to spend water, we don't want to spend electricity,” "
  "he said. “This valley is so small.” On July 7 the commissioners signalled they would "
  "develop data center standards, and they have since tightened the heavy industrial zoning rules, "
  "which is the tool actually available to them.",

  "Henderson took up the same question and answered it differently. Mayor Michelle Romero "
  "introduced a 180-day pause on new data center applications; after nearly two hours of public "
  "comment in which residents largely urged the council to pass it, the council rejected the "
  "moratorium in July 2026 and directed staff to rewrite its development agreement process "
  "instead, covering water consumption, electrical demand, noise and a minimum distance from "
  "homes.",

  "The reasoning is worth recording because it applies everywhere. “A moratorium is temporary "
  "to some degree, they are only defensible for up to a certain point, usually that's up to 12 to "
  "18 months before you have to make some permanent changes to your code,” city attorney "
  "Nicholas Vaskov told the council. Romero accepted the substitute on the basis that a "
  "development agreement lets the city judge applications case by case: “A development "
  "agreement proactively gives us the ability to change the codes now and adaptively update them "
  "as technology changes. We may or may not ever get an application, but at least we would be "
  "ready with a framework that we can rely on.” Eddie Dichter, the city's community "
  "development director, said Henderson has had no new data center applications at all and that "
  "staff had been revising the process since April with data centers in mind.",

  "There is one data center in Henderson, and it is the one the argument is about. Google's site "
  "opened in 2020, before the Southern Nevada Water Authority banned evaporative cooling in new "
  "commercial and industrial construction in 2023 on the finding that it is the second largest "
  "consumptive use of water in Southern Nevada after outdoor irrigation. It still uses evaporative "
  "cooling. The Las Vegas Review-Journal, which called it the thirstiest data center in the state, "
  "obtained figures showing 352 million gallons consumed in 2024, a number that counts only the "
  "water not recycled or returned to Lake Mead, and equivalent to about 2,700 households for a "
  "year. Google's own 2026 sustainability report puts the site at 239.4 million gallons for 2025.",

  "Set against the valley as a whole: more than thirty data centers operate across the Las Vegas "
  "area and their estimated 2024 usage totalled over 716 million gallons, enough to supply roughly "
  "4,395 single-family households for a year, in the driest state in the country, while Lake Mead "
  "runs at crisis levels.",

  "The state moved in September. Governor Joe Lombardo signed Executive Order 2026-005 on the "
  "19th, creating the Nevada Standard for Responsible Data Center Development. A developer seeking "
  "a partial tax abatement through the Governor's Office of Economic Development must now pay the "
  "Local School Support Tax in full and the general fund share of sales and use tax, meet local "
  "water standards, cover the cost of the utility service it needs rather than shifting it to "
  "other ratepayers, and undertake not to impede public access to electricity during a grid "
  "emergency. The procedural change is the real one: the state used to have to approve an "
  "abatement once a company met the criteria, and now it does not have to advance the application "
  "at all.",

  "“This order sets clear expectations while opening the door to billions in responsible "
  "investment,” Lombardo said, and on the school tax, “that wasn't right, and I'm proud "
  "to correct it and make certain those dollars reach our classrooms.” Attorney General Aaron "
  "Ford, a Democrat, called it a last-ditch excuse for an executive order and said it is not a "
  "reflection of what Nevada communities are asking for. The Data Center Coalition said the "
  "policies create additional hurdles to development.",

  "Elsewhere in the state the answers have differed again. Reno's council voted for a temporary "
  "moratorium in June 2026 while it writes regulations, and the Nye County Water District "
  "governing board approved an emergency order the month before. NV Energy now expects to need 50 "
  "per cent more energy than it projected two years ago, with demand potentially doubling by 2030, "
  "and Nevada legislators will take up a bill in 2027 to end the tax breaks and impose a statewide "
  "pause."
 ],
 "sources": [
  "https://nevadacurrent.com/briefs/henderson-city-council-reject-data-center-moratorium/",
  "https://www.reviewjournal.com/local/local-las-vegas/southern-nevada-data-centers-used-a-ton-of-water-in-2024-heres-how-3397994/",
  "https://www.govtech.com/artificial-intelligence/clark-county-nev-commissioners-approve-data-center-project",
  "https://www.fox5vegas.com/2026/06/18/clark-county-approves-switch-data-center-project-southwest-valley-after-public-opposition/",
  "https://www.carsonnow.org/09/19/2026/lombardo-curtails-nevada-data-center-tax-break-program-in-executive-order",
  "https://lasvegassun.com/news/2026/jul/22/henderson-council-opts-for-strict-development-agre/",
  "https://thenevadaindependent.com/article/henderson-rejects-data-center-moratorium-instead-exploring-code-changes",
  "https://www.reviewjournal.com/news/environment/google-runs-southern-nevadas-thirstiest-data-center-unlv-students-have-a-solution-3591015/",
  "https://www.reviewjournal.com/news/politics-and-government/nevada/what-to-know-about-data-centers-and-their-growing-footprint-in-nevada-3887629/",
  "https://www.ktnv.com/neighborhoods/southwest-las-vegas/data-center-expansion-in-southwest-valley-unanimously-approved-by-zoning-commission",
  "https://www.reviewjournal.com/news/environment/nevada-lawmakers-could-hit-pause-on-data-centers-end-their-tax-breaks-3870456/"
 ]
},

"/data-centers/united-states/texas/collin-county/": {
 "paragraphs": [
  "Project Tomahawk never reached a vote. White Rose Partners withdrew the application hours "
  "before the Prosper Town Council was due to take it up on September 8, 2026, and the town "
  "announced both agenda items were gone. “We don't want to go into communities where we're "
  "not wanted,” said Jeff Eigenbrood, a managing partner at the Dallas developer.",

  "A week earlier, at a meeting on September 1 that ran into the early hours, the planning and "
  "zoning commission had voted 7-0 to recommend denial. More than 400 written objections had "
  "arrived before it, dozens of people spoke, and a residents' petition passed 2,000 signatures in "
  "the week between the commission and the council.",

  "The project was a 225,000 square foot data center on a 37-acre tract at FM 1385 and Parvin "
  "Road, costed at about $580 million and sited directly beside the Brazos Electric Parvin "
  "substation. Prosper straddles the Collin and Denton county line and this tract sits on the "
  "Denton side, which is why reporting places it in both.",

  "The developer's offer was detailed: the buildings would cover about a fifth of the site, "
  "screened by a living wall of canopy trees and evergreen shrubs facing the planned Prosper Oaks "
  "neighbourhood, with an eight-foot rear wall for sound, closed-loop cooling it said would use "
  "less than half the water of a single-family home, minimal traffic, and funding for the "
  "substation upgrades.",

  "It did not answer the question the commission was actually asking. “The net benefit to "
  "Prosper, I can't find,” said Commissioner Josh Carson. “There's a tax benefit that's "
  "real, but I don't think the world revolves strictly based on tax revenue.”",

  "Residents raised industrial development sitting a thousand feet from residential property "
  "lines, the draw on the grid, long-term water allocation, and the constant ambient noise of "
  "large cooling plant. One speaker made the point that keeps recurring across this county: noise, "
  "traffic, light pollution, utility strain and environmental effects reach people “based on "
  "proximity, not city lines”.",

  "The noise objection in Prosper was more technical than most. Residents argued that the "
  "A-weighted decibel measurement used in these applications understates low-frequency sound, the "
  "part that carries through walls and windows rather than stopping at them, so a facility can "
  "meet the ordinance and still be audible inside a house all night.",

  "Other towns in the county have been writing rules rather than fighting applications. Princeton "
  "amended its regulations in June 2026 to update the definition of a data center, require a "
  "special use permit and evaluate each proposal individually, after a council meeting that ran to "
  "11.26 at night and Councilwoman Cristina Todd questioned whether allowing them in the C-2 "
  "district protected the neighbourhoods next door at all. In Plano, residents have gone to their "
  "council before any project arrived: Kyle McGinn asked officials to explore a moratorium or add "
  "a dedicated data center category to the Unified Development Code, and Shirley Lawson told the "
  "council she would start organising if nothing came of it, noting its members face re-election "
  "in 2027. A council member conceded Plano has no zoning category for an AI facility at all. "
  "Collin County's commissioners are separately drawing up noise rules; McKinney and Plano already "
  "have ordinances.",

  "The scale behind all of this is regional. North Texas is now the largest primary data center "
  "market in the United States, and Collin sits with Dallas, Denton, Tarrant and Ellis counties "
  "inside Oncor's territory, where projected large-load growth is most concentrated. A survey by "
  "the North Central Texas Council of Governments found 96 per cent of responding communities "
  "worried about the strain on water and 81 per cent about the grid, with many saying plainly they "
  "do not have the infrastructure for developments this size. DFW Communities Over Data Centers "
  "has formed across the metroplex, and Fort Worth, Denton and Granbury have adopted or proposed "
  "moratoriums.",

  "The state has now intervened on exactly those two grounds. In early August 2026 Governor Greg "
  "Abbott halted new data center grid interconnections pending a project-by-project audit of "
  "energy and water use by the Public Utility Commission and ERCOT. ERCOT's large-load queue stood "
  "at 226 gigawatts in November 2025, up from 63 the previous December, with data centers close to "
  "three quarters of it, and total interconnection requests have since been put at around 474 "
  "gigawatts, more than five times the record peak demand of the entire Texas grid.",

  "On water, a 2026 paper from the Houston Advanced Research Center estimates Texas data centers "
  "already account for roughly 9,567 megawatts of electricity and 25 billion gallons of water "
  "directly and indirectly, and that by 2030 they could take between 0.5 and 2.7 per cent of all "
  "the water the state uses in a year."
 ],
 "sources": [
  "https://www.cbsnews.com/texas/news/prosper-tx-project-tomahawk-pulled-9-8-2026/",
  "https://www.nbcdfw.com/news/local/prosper-data-center-faces-opposition-after-unanimous-commission-vote/4071578/",
  "https://communityimpact.com/prosper-celina/government/project-tomahawk-developer-scraps-plans-for-prosper-data-center/",
  "https://communityimpact.com/prosper-celina/development/prosper-commission-recommends-denial-of-580-million-data-center/",
  "https://therealdeal.com/texas/2026/09/09/white-rose-spikes-data-center-proposal-in-prosper/",
  "https://www.keranews.org/news/2026-09-03/data-center-growth-north-texas-map",
  "https://tx3dnews.com/plano-residents-call-for-data-center-moratorium/",
  "https://princetonherald.com/2026/07/02/council-agrees-to-limit-data-centers-find-city-manager/",
  "https://gov.texas.gov/news/post/governor-abbott-directs-comprehensive-data-center-audit",
  "https://www.utilitydive.com/news/texas-hits-pause-data-center-interconnections/827046/",
  "https://www.engieresources.com/market-insight/texas-data-centers-the-new-large-load-shaping-ercot/",
  "https://zonewisely.com/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
old={k:sum(len(x.split()) for x in e.get(k,{}).get('paragraphs',[])) for k in R}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-50s %4d -> %4d words, %d paras, %d sources'%(k,old[k],sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs']),len(R[k]['sources'])))
