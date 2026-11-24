# -*- coding: utf-8 -*-
"""Batch six: Hessen, Australia, Singapore, United Kingdom."""
import io, json, os

R = {

"/data-centers/germany/hessen/": {
 "paragraphs": [
  "Frankfurt is the largest data centre hub in Europe and in 2026 it ran out of electricity. The "
  "available power capacity in the city is effectively zero: operators have already contracted "
  "every megawatt the grid can supply, and anything not already signed for has nowhere to plug in.",

  "The arithmetic behind that is slow and public. A high-voltage grid connection in the Frankfurt "
  "region takes 24 to 36 months to deliver, and the grid operators say no new utility-scale "
  "substation comes online before the second quarter of 2027. Mainova, the Frankfurt utility, has "
  "put the outer limit further out still, estimating that large high-capacity connections will not "
  "be possible again until the middle of the 2030s.",

  "So the pipeline has moved. New projects are being built in the surrounding region rather than "
  "inside the city, which shifts the water, land and noise questions onto smaller municipalities "
  "that have had far less experience of arguing with a hyperscaler than Frankfurt has.",

  "German law now sets the efficiency floor for anything that does get built. The Energy "
  "Efficiency Act, the Energieeffizienzgesetz, imposes binding power usage effectiveness "
  "thresholds from 2026, 1.2 for a new build and 1.3 for an existing site, and obliges operators "
  "to make their waste heat available for reuse rather than exhausting it. Those are among the "
  "strictest rules applied to data centres anywhere, and Hessen has more buildings that have to "
  "meet them than any other German state."
 ],
 "sources": [
  "https://neospaces.de/en/insights/frankfurt-data-center-fra1-power-2026-q2",
  "https://www.igorslab.de/en/frankfurt-at-its-limit-power-shortages-are-slowing-the-boom-in-data-centers/",
  "https://algorithmwatch.org/en/germany-data-center-boom/",
  "https://www.techpolicy.press/germanys-data-center-boom-is-pushing-the-power-grid-to-its-limits/",
  "https://www.datacenterknowledge.com/data-center-site-selection/germany-s-data-center-market-expands-amid-power-regulatory-pressures",
  "https://thecoolingreport.com/intel/germany-heat-reuse-mandate",
  "https://www.moduledge.com/blog/eu-data-center-regulations-2026"
 ]
},

"/data-centers/australia/": {
 "paragraphs": [
  "Australia's first ministers agreed on August 26, 2026 that the Commonwealth would write "
  "mandatory national standards for data centres covering energy use, water consumption and where "
  "they can be built, with legislation aimed at early 2027. The siting rules are the unusual part: "
  "developers would have to keep new facilities an appropriate size and away from homes, schools, "
  "agricultural land and land that could otherwise be used for housing. Queensland and the "
  "Northern Territory objected to being made to mandate renewable sourcing for new sites.",

  "The scale being planned for is set out in the Australian Energy Market Operator's own "
  "forecasts. AEMO expects data centre demand on the National Electricity Market to rise almost "
  "sevenfold over the next decade, from roughly 5 terawatt hours a year to about 34 by 2035-36. "
  "As of June 2026 prospective projects had lodged grid connection requests totalling 66.9 "
  "gigawatts, a number far beyond what will actually be built and a problem in itself for anyone "
  "trying to run a queue.",

  "The regulators are catching up in pieces. The Australian Energy Market Commission has published "
  "a framework for how large loads connect and pay, and New South Wales has moved separately to "
  "control grid access rather than let the queue decide.",

  "On the ground the binding constraint is planning consent, now the most cited bottleneck in the "
  "industry's own surveys. Residents in Lane Cove on Sydney's North Shore have organised against "
  "an AI data centre development they say would change the character of the suburb, and in "
  "September 2026 the build-out revived Victoria's long-running fight over new transmission lines, "
  "since the power has to cross somebody's farmland to reach the buildings."
 ],
 "sources": [
  "https://www.abc.net.au/news/2026-07-29/data-center-boom-powers-up-political-energy-debate/106929726",
  "https://www.abc.net.au/news/2026-09-17/datacentre-boom-revives-vic-transmission-fight/107155564",
  "https://datacentremagazine.com/news/australian-data-centres-aemo-2026-electricity-statement",
  "https://www.pv-tech.org/australias-data-centre-energy-rules-take-shape-as-aemc-publishes-framework-and-nsw-moves-to-control-grid-access/",
  "https://tech-insider.org/au/australia-data-centre-energy-standards-national-cabinet-2026/",
  "https://itkservices3.com/background/data_centres_australia_community"
 ]
},

"/data-centers/singapore/": {
 "paragraphs": [
  "Singapore is the one place that solved the data center siting argument by refusing to have it. "
  "The government froze new capacity from 2019, and when it reopened the door it did so by "
  "rationing: capacity is released in fixed allocations, applied for, and awarded to whoever meets "
  "the efficiency conditions.",

  "The current framework is the Green Data Centre Roadmap, launched by the Infocomm Media "
  "Development Authority on May 30, 2024, which offered at least 300 megawatts of additional "
  "capacity and more beyond that for operators using green energy. The second allocation round, "
  "DC-CFA2, was announced by the Economic Development Board and IMDA on December 1, 2025 to hand "
  "out at least 200 megawatts. Applications closed on March 31, 2026 and the winners have not yet "
  "been named.",

  "The conditions are tight. A new build has to hit a power usage effectiveness below 1.3, be "
  "best-in-class on both energy and IT efficiency, and draw at least half its power from green "
  "sources, which the scheme defines to include biomethane, low-carbon ammonia, hydrogen, fuel "
  "cells with carbon capture and on-site solar. Meeting the standard buys faster approvals and a "
  "reserved grid allocation rather than merely permission.",

  "The effect is that Singapore's constraint is deliberate rather than accidental. A land-scarce "
  "island with no domestic generation to spare decided how much of its grid the industry could "
  "have, and every project on this page sits inside that ceiling."
 ],
 "sources": [
  "https://www.morganlewis.com/pubs/2026/03/singapore-announces-data-center-capacity-allocation-call",
  "https://www.nortonrosefulbright.com/en/knowledge/publications/3b294288/singapore-s-green-data-centre-roadmap-and-dc-cfa2-driving-sustainable-ai-ready-infrastructure",
  "https://www.datacenterdynamics.com/en/news/singapore-to-unlock-300mw-of-data-center-capacity-through-industry-energy-efficiency-initiatives/",
  "https://www.mayerbrown.com/en/insights/publications/2024/08/singapores-green-data-centre-roadmap-representing-a-necessary-intersection-between-digital-infrastructure-and-sustainability",
  "https://introl.com/blog/singapore-green-data-center-mandate-dc-cfa2-2026",
  "https://smc.co/future-state/understanding-singapore-s-green-data-centre-roadmap"
 ]
},

"/data-centers/united-kingdom/": {
 "paragraphs": [
  "The British government has put its weight behind data centre construction rather than against "
  "it. Its policy paper on delivering AI Growth Zones, published in January 2026, designates areas "
  "where planning and grid connection are to be accelerated, and in August 2026 ministers "
  "explicitly rejected calls for a freeze on new data centre construction.",

  "The obstacle is the grid, and the government says so itself: the connection queue is vastly "
  "oversubscribed and, in its own words, does not reflect national demand priorities. The response "
  "is to jump the queue for favoured projects. Sites inside an AI Growth Zone qualify for the new "
  "Connections Accelerator Service and for capacity reserved at named physical connection points. "
  "National Grid has begun building a substation at Uxbridge Moor in Buckinghamshire that will "
  "connect more than a dozen data centres and add 1.8 gigawatts, part of a 35 billion pound "
  "network investment programme running from 2026 to 2031.",

  "Policy has moved faster than delivery. Planning approvals inside the growth zones have run "
  "slower than the promise, and long-lead electrical equipment, specialist labour, financing and "
  "local opposition all sit between the announcements and anything being built.",

  "Water is the other constraint and the one the public raises most. Twenty-eight planned sites "
  "sit in the area served by Thames Water, a company already under scrutiny for its own supply, "
  "and Anglian Water has begun questioning proposals in the east of England, pushing operators "
  "towards closed-loop liquid cooling.",

  "Where the government has been challenged it has been in court rather than in Parliament. In "
  "January 2026 it conceded a High Court case over a green belt data centre at Iver in "
  "Buckinghamshire, admitting it had granted permission without requiring a full environmental "
  "impact assessment."
 ],
 "sources": [
  "https://www.bakermckenzie.com/en/insight/publications/2026/01/uk-government-policy-paper-delivering-ai-growth-zones",
  "https://www.constructionmagazine.uk/2026/08/uk-data-centre-construction-2026-government-rejects-freeze.html",
  "https://commonslibrary.parliament.uk/research-briefings/cbp-10315/",
  "https://barbour-abi.com/ai-growth-zones-uk-and-their-data-centres/",
  "https://www.burges-salmon.com/articles/102lxwu/data-centres-ai-growth-zones-in-planning-change-on-the-horizon-in-2026/",
  "https://www.blakeclough.com/uk-ai-growth-zones-turning-policy-into-deliverable-data-centre-projects/",
  "https://www.theregister.com/2026/01/23/uk_gov_dc/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
