# -*- coding: utf-8 -*-
"""Batch seventeen: South Africa, United Arab Emirates, Marion County IN, Jackson County MO."""
import io, json, os

R = {

"/data-centers/south-africa/": {
 "paragraphs": [
  "In September 2026 South African civil rights organisations called for construction of new data "
  "centres to stop until the country has investigated what they will do to its water, land and "
  "electricity. Their objection is not primarily to the buildings but to being asked to decide "
  "without numbers: operators here are not required to disclose how much water, power or land a "
  "project will use, or to commit to any figure in binding terms.",

  "The timing follows an unexpected reversal in the power system. Eskom, the state utility, came "
  "through the winter peak with a surplus after years of load-shedding, and expects two to three "
  "gigawatts of spare generation over the next few years. It is actively looking for customers to "
  "absorb that, and has named data centres alongside exports and heavy industry as the candidates. "
  "The civil society groups' concern is precisely that the surplus is being sold rather than "
  "banked.",

  "Cape Town is where the argument is sharpest. The city approved a hyperscale facility for "
  "Equinix, eight years after it came within weeks of Day Zero, the date its taps were projected "
  "to run dry, and the electricity the building will draw has drawn objections in a country whose "
  "blackouts are recent memory.",

  "The footprint is already substantial. Johannesburg has more than fifteen operational "
  "facilities, Cape Town is growing as a subsea cable landing point, and Durban and Centurion are "
  "adding capacity. Equinix has bought land in both main cities and plans to add roughly 160 "
  "megawatts under a 7.5 billion rand programme, while Amazon and Microsoft continue to build out "
  "what is intended to be the main data hub for the continent."
 ],
 "sources": [
  "https://fortune.com/2026/09/04/data-centers-south-africa-water-electricity/",
  "https://www.sowetan.co.za/news/2026-09-05-civil-rights-groups-urge-a-halt-to-sas-data-centres-boom-amid-water-and-power-fears/",
  "https://abcnews.com/International/wireStory/civil-rights-groups-urge-halt-south-africa-data-136197407",
  "https://broadbandbreakfast.com/civil-rights-groups-urge-halt-to-south-africa-data-center-boom-amid-water-and-power-fears/",
  "https://www.businessday.co.za/companies/2026-09-03-equinix-points-to-data-centres-economic-role-amid-resource-concerns/",
  "https://enerserv.co.za/blog/data-centre-energy-management"
 ]
},

"/data-centers/united-arab-emirates/": {
 "paragraphs": [
  "There is no local opposition to report in the Emirates. The constraint here is physical, and it "
  "is the largest single data centre project anywhere: Stargate UAE, in Abu Dhabi, a one gigawatt "
  "campus designed to expand to five, costed at more than $30 billion and built by G42's Khazna "
  "Data Centres with Nvidia, Oracle, OpenAI and SoftBank. The site has been reported at around "
  "nineteen square kilometres. Its first 200 megawatt phase is due in the third quarter of 2026.",

  "It will run on nuclear, solar and natural gas together, which is an unusual mix and a necessary "
  "one. A gigawatt of continuous AI load implies somewhere close to nine terawatt hours of "
  "electricity a year on its own.",

  "The part that gets discussed least is the water, because in the Gulf water and power are the "
  "same problem. Fresh water for cooling comes from desalination, desalination runs on "
  "electricity, and the International Energy Agency has suggested Gulf states may need to double "
  "their generating capacity by 2030 to supply both the AI infrastructure and the desalination "
  "needed to keep it cool.",

  "Stargate is not the only commitment. Microsoft and G42 have announced a further 200 megawatts "
  "of Emirati capacity as part of an investment programme worth more than $15 billion, with the "
  "first of it expected online before the end of 2026."
 ],
 "sources": [
  "https://www.g42.ai/resources/news/global-tech-alliance-launches-stargate-uae",
  "https://gulfnews.com/business/markets/stargate-uae-first-phase-of-200mw-to-complete-by-2026-1.500310364",
  "https://www.silicon.co.uk/workspace/uae-stargate-data-centre-to-begin-operation-in-2026-615358",
  "https://www.datacentermap.com/united-arab-emirates/abu-dhabi/stargate-uae/specs/",
  "https://www.khayrion.com/2026/09/18/desert-compute-the-gulfs-ai-gigafactories-and-the-power-and-water-bill-nobody-talks-about/",
  "https://finance.yahoo.com/news/microsoft-g42-announce-200-mw-112347673.html",
  "https://www.blackridgeresearch.com/blog/latest-list-of-top-largest-biggest-data-center-projects-in-united-arab-emirates-uae"
 ]
},

"/data-centers/united-states/indiana/marion-county/": {
 "paragraphs": [
  "Marion County has stopped permitting data centers until at least the end of 2027. The "
  "Indianapolis City-County Council voted 23-1 on August 10, 2026 to approve the pause, and the "
  "Metropolitan Development Commission gave it final approval unanimously, 6-0, on August 19. The "
  "rules proposal it grew out of had cleared its first vote on July 1.",

  "Until that amendment passed, the county's zoning code did not say what a data center was. "
  "Councillors added a definition from the floor: a facility used primarily to store, manage, "
  "process or transmit digital data, written broadly enough to cover server farms, artificial "
  "intelligence training and cloud computing. Everything approved before that was approved under "
  "some other category.",

  "The pause is meant to produce rules rather than simply delay. City staff are to convene a "
  "committee of experts and residents to work through campus size, building height, permitted "
  "sound levels and environmental impact, with the moratorium running no later than December 31, "
  "2027.",

  "The three projects that generated most of the opposition are not covered by it. DC Blox in "
  "Warren Township, Metrobloks in Martindale-Brightwood and Sabey in Decatur Township were already "
  "approved and are exempt, so the residents who campaigned hardest got a moratorium that does not "
  "apply to the buildings they were campaigning about."
 ],
 "sources": [
  "https://www.wfyi.org/wfyi-news/2026-08-19/new-data-centers-temporarily-banned-in-marion-county",
  "https://www.wfyi.org/wfyi-news/2026-08-10/indy-council-advances-pause-on-data-centers-sends-to-commission-for-final-approval",
  "https://fox59.com/news/metropolitan-development-commission-unanimously-approves-data-center-moratorium/",
  "https://mirrorindy.org/indianapolis-city-county-council-data-center-moratorium-approval/",
  "https://www.wfyi.org/wfyi-news/2026-07-01/data-center-rules-proposal-clears-initial-vote-in-indianapolis",
  "https://mirrorindy.org/indianapolis-data-centers-regulations-moratorium/"
 ]
},

"/data-centers/united-states/missouri/jackson-county/": {
 "paragraphs": [
  "Jackson County's legislature passed a 180-day moratorium on June 22, 2026, covering land use "
  "applications for data centers and for battery energy storage systems together, with eight votes "
  "in favour and one member excused. It had delayed a decision on two competing moratorium "
  "proposals three weeks earlier. The stated purpose is to write rules before the next application "
  "arrives rather than to stop development permanently.",

  "The hearings split the county along a line that does not appear in most of these fights. "
  "Residents and environmental groups raised what the buildings would do to neighbourhoods, water "
  "sources and the local environment. Construction unions argued the other way: the Greater Kansas "
  "City Building and Trades Council opposed the moratorium outright, its manager pointing to the "
  "hours of work these projects generate and what those hours pay into health, welfare and pension "
  "funds.",

  "On the electricity side the state has already acted, if narrowly. A 2025 Missouri law requires "
  "the investor-owned utilities, Ameren, Evergy and Liberty, to develop separate higher rate "
  "schedules for very large loads such as data centers, so that the cost of serving them is not "
  "spread across ordinary customers by default.",

  "The politics have travelled beyond the county line. The same backlash has united towns on both "
  "the Missouri and Kansas sides of the metro, and it reached the 2026 Missouri primaries, where "
  "Republican candidates campaigned on demanding state action the legislature had not taken."
 ],
 "sources": [
  "https://www.kctv5.com/2026/06/22/jackson-county-legislature-passes-180-day-moratorium-data-center-applications/",
  "https://www.kctv5.com/2026/06/01/jackson-county-legislature-delays-vote-two-data-center-moratorium-proposals/",
  "https://thebeaconnews.org/stories/2026/06/08/jackson-county-legislators-mull-data-center-moratorium/",
  "https://fox4kc.com/news/jackson-county-lawmakers-to-vote-on-data-center-moratorium/",
  "https://www.kcur.org/housing-development-section/2026-09-02/data-center-backlash-missouri-kansas",
  "https://missouriindependent.com/2026/07/02/data-center-backlash-spills-into-missouri-primaries-as-gop-candidates-demand-action/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
