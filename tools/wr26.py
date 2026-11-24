# -*- coding: utf-8 -*-
"""Batch twenty-six: Pinal County AZ, Union County OH.

Method, counted honestly:
  Pinal County    3 searches, 2 articles opened in full (KJZZ, Pinal Post).
  Union County    3 searches, 1 reference page opened (stopohiodatacenters). The Marysville
                  Journal Tribune is hard paywalled: curl with a browser user agent returned only
                  the first sentence of each of three stories, and the Marysville Matters
                  newsletter returned only its headline. Those ledes are used and attributed as
                  ledes; nothing is inferred past where the paywall cuts. The page is shorter
                  because of it, which is the honest outcome rather than a padded one.
"""
import io, json, os

R = {

"/data-centers/united-states/arizona/pinal-county/": {
 "paragraphs": [
  "So many people came to object that Pinal County had to open five overflow rooms across three "
  "separate buildings. On August 26, 2026 the Board of Supervisors voted 4-1 to refuse the "
  "rezoning for the La Osa Energy Center outside Eloy, after nearly three hours of public "
  "testimony. Around 300 people attended and more than 150 filed cards against it. Supervisor "
  "Stephen Miller cast the only vote the other way.",

  "Vermaland had proposed the largest data center project in Arizona: 3,300 acres carrying 59 "
  "data center buildings, two on-site natural gas plants and utility-scale battery storage, "
  "against a demand of three gigawatts.",

  "In May the company cut it by about 80 per cent, to eleven buildings, a single 500 megawatt gas "
  "plant and batteries, for a gigawatt in total, moved several miles further from its neighbours, "
  "with a pledge to use less water. The concession did not move a single vote, and some residents "
  "read it as a tactic. “Probably planned all along,” said Robin Davis. “Ask for "
  "more than you want and settle for what you really wanted.” Mark Seidel put the other "
  "objection: “I don't want an incomplete and hastily built and ever-changing proposal.”",

  "The water argument here is not hypothetical. “Many of my neighbors' wells have gone dry "
  "and require additional depth,” Mary Eileen Flanagan told the board, in a basin that has "
  "already been overdrawn to the point of land subsidence.",

  "The power did not hold together either. Robert Clang, for the developer, said the project had "
  "secured 500 megawatts of natural gas and would need to find the rest from solar or nuclear. "
  "Supervisor Jeffrey McClure's response to what was available was short: “My understanding "
  "is that's dedicated to some other companies.”",

  "What residents asked for after winning was rules, not another refusal: enforceable caps on "
  "water use, protections on energy, and a zoning code that addresses data centers as their own "
  "category rather than case by case.",

  "Casa Grande, in the north of the county, shows what that can look like, and what it costs. The "
  "city adopted Ordinance 3479 in October 2025 requiring a conditional use permit for data centers "
  "in industrial and B-4 districts. In February 2026 attorneys for the landowners Dale Willis and "
  "Vernon Barnes served separate demands under Arizona's Proposition 207 statute, each seeking "
  "$73,180,800 in compensation, about $146 million between them, or else a binding waiver "
  "restoring the by-right use they had lost.",

  "On August 3, 2026 the council voted 7-0 to grant the waivers, and wrote the conditions into "
  "them. Potable water is capped at 800 net acre-feet a year across both properties, against about "
  "1,240 acre-feet the land uses now as farmland, with once-through cooling prohibited, the cap "
  "counting water used by on-site generation, and annual usage reports required. Power must come "
  "from behind-the-meter generation at the outset, a grid connection is optional and the owner "
  "pays every interconnection cost, and the technology, capacity and fuel source must be disclosed "
  "to the city. Noise is limited to 60 dBA between 8am and 9pm and 55 dBA overnight, with "
  "post-construction noise studies for three years and generator testing confined to weekdays "
  "between 9am and 4pm. If operations stop for 24 continuous months, removal must begin within 180 "
  "days and covers the IT equipment, cooling, generators, fuel tanks, batteries, transformers and "
  "environmental remediation. The owners also put up $5 million for city recreation facilities.",

  "“None of us were really happy when the notice came,” Mayor Fitzgibbons said, before "
  "thanking the owners for accepting the conditions. City Manager Rains noted that any other data "
  "center would still have to go through a conditional use permit. Councilmember Dugan pointed out "
  "the capped figure is a reduction on current use. Resident Casey Day did the conversion on the "
  "cap: “That's like between 2,500 and 3,000 residential homes every year.”"
 ],
 "sources": [
  "https://www.kjzz.org/politics/2026-08-26/pinal-county-rejects-massive-la-osa-data-center-residents-want-more-rules-for-future-projects",
  "https://pinalpost.com/casa-grande-data-center-waiver-approved/",
  "https://www.azfamily.com/2026/08/27/pinal-county-board-rejects-massive-data-center-project/",
  "https://www.azfamily.com/2026/08/26/pinal-county-residents-fight-proposed-data-center/",
  "https://www.kjzz.org/fronteras-desk/2026-05-28/largest-proposed-data-center-in-arizona-to-be-scaled-back-80-after-opposition",
  "https://www.pinalcentral.com/eloy_enterprise/massive-pinal-data-center-tabled-after-public-backlash/article_24e7ee19-cc37-405f-b947-f199fc329aaa.html",
  "https://www.pinalcentral.com/casa_grande_dispatch/cg-council-oks-waiver-for-potential-data-center-site/article_a4607a3c-4043-4d53-be3a-bf18e505cdd7.html",
  "https://azbex.com/legislation-issues/casa-grande-council-discusses-possible-damages-from-data-center-rules/",
  "https://www.compute-atlas.com/facilities/vermaland-la-osa-eloy-az"
 ]
},

"/data-centers/united-states/ohio/union-county/": {
 "paragraphs": [
  "Jerome Township already has two large Amazon data centers, served by the local police and fire "
  "departments, which will pay no property tax for years under the abatement Amazon was given when "
  "they were built. That arrangement is the backdrop to everything the township has done since.",

  "The township adopted a nine-month moratorium in September 2025, due to run out in June 2026. "
  "Before it did, trustees moved to change the rules underneath it: on March 17, 2026 they voted "
  "to advance amendments reclassifying data centers as a conditional use rather than a permitted "
  "one, which means each future application has to be argued for rather than approved as of right. "
  "The moratorium then expired as planned, and development now proceeds under the restrictions "
  "passed in March.",

  "Residents did not think the handling had been straight. In February, after the township issued "
  "four new data center zoning certificates, they filled a trustees' meeting to say so. The "
  "complaints on record are noise and what the buildings do to the value of the houses near them.",

  "The buying has continued regardless. In July 2026 a company linked to Amazon Web Services "
  "quietly bought more than 100 acres on Industrial Parkway in Jerome Township.",

  "In Marysville, which supplies the water and sewer, two facilities already take roughly a tenth "
  "of the city's daily water. Legislation supporting a second data center project, at Marysville "
  "South, had its first reading on November 10, 2025, after the Amazon site. In September 2026 the "
  "city adopted a moratorium of its own.",

  "Union County Commissioner Tom McCarthy came back from a National Association of Counties "
  "meeting in August 2026 arguing that with opposition to data centers now close to universal "
  "across the country, the balance of power may be shifting towards the communities, but that "
  "local leaders have to understand what they are agreeing to before they agree to it.",

  "Two pieces of state law shape what any of this can achieve. House Bill 15, signed in 2025, "
  "created a behind-the-meter generation framework that lets a data center build its own power on "
  "site and bypass some local zoning review and Public Utilities Commission oversight with it. "
  "House Bill 695 would stop county commissioners, township trustees and village officials from "
  "knowingly signing non-disclosure agreements about their official duties, which is the practice "
  "residents here and elsewhere in Ohio have objected to most. By September 18, 2026 the state had "
  "more than 125 active data center moratoriums.",

  "A note on sourcing: the Marysville Journal Tribune, which covers the township meetings in "
  "detail, is paywalled, and only the opening paragraph of each of its reports could be read. The "
  "votes, dates and certificate counts above come from those opening paragraphs and are no more "
  "specific than they were."
 ],
 "sources": [
  "https://www.marysvillejt.com/2026/03/19/jerome-clamps-data-centers/",
  "https://www.marysvillejt.com/2026/02/06/jerome-residents-dont-like-data-center-dealings/",
  "https://ww2.marysvillejt.com/2026/08/05/mccarthy-citizens-cards-data-center-battle/",
  "https://ohiocapitaljournal.com/2026/09/18/ohio-now-has-over-125-active-moratoriums-on-data-centers-see-where-they-are/",
  "https://stopohiodatacenters.org/data-center-usage-ohio",
  "https://stopohiodatacenters.org/counties/union",
  "https://marysvillematters.substack.com/p/do-union-county-voters-care-enough",
  "https://signalohio.org/ohio-data-center-boom-faces-political-resistence/",
  "https://marysvilleohio.org/772/Data-Center-FAQs"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d paras, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs']),len(R[k]['sources'])))
