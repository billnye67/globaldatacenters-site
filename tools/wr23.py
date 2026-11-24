# -*- coding: utf-8 -*-
"""Batch twenty-three: Ontario, Denmark.

Method: three searches each. Ontario, five articles requested and three returned (National
Observer and the Globe both refused once); Denmark, five requested and three returned (CNBC and
Computer Weekly refused). Alternate outlets were fetched for the refused stories rather than
falling back on the search summaries.
"""
import io, json, os

R = {

"/data-centers/canada/ontario/": {
 "paragraphs": [
  "Ontario has taken the decision about data centre grid connections away from the utilities and "
  "given it to the cabinet. The Protect Ontario by Securing Affordable Energy for Generations Act "
  "received Royal Assent on December 11, 2025, handing the provincial government final say over "
  "whether any large-load facility gets to connect at all, and on August 13, 2026 the government "
  "published the Data Centre Playbook setting out how it intends to use that power. Consultation "
  "ran thirty days, to September 12, with a final version expected in the autumn.",

  "The money question is settled in the draft. A new rate class would cover any data centre "
  "drawing more than one megawatt, which in practice is all of them, charging more than other "
  "industrial users and making them ineligible for the Industrial Conservation Initiative. "
  "Developers pay for every grid upgrade their project requires. Premier Doug Ford's summary was "
  "that the measures ensure no costs are passed to consumers.",

  "Connecting is then a two-part test rather than a queue. A system impact assessment covers "
  "feasibility, the effect on the grid, full cost recovery, what reinforcement is needed and what "
  "the applicant proposes to generate on site. A strategic priority assessment covers economic "
  "development, data security, digital sovereignty and community investment. Closed-loop cooling "
  "and noise reduction technology count in a project's favour. “The question is, what are "
  "the benefits you're bringing to the community?” Ford said, and on the sovereignty point he "
  "was blunter: “We want to have sovereign data. We don't want to rely on President Trump "
  "getting his paws all over it.”",

  "How much is waiting depends who is counting. The IESO has put data centre requests at around "
  "6,000 megawatts, enough for more than four million Ontario homes. The Playbook's own figure for "
  "applications in the pipeline exceeds 10,000 megawatts, roughly 40 per cent of the province's "
  "recent peak demand. The IESO does not publish the locations of the sites securing that power, "
  "so a municipality generally finds out when a rezoning application arrives.",

  "Which is why the cities have not waited for the final Playbook. Oakville enacted a one-year "
  "moratorium in August 2026. On September 16 Mississauga's council voted unanimously for a "
  "one-year freeze on new data centres above 10 megawatts, a threshold its own report equated to "
  "the electricity used by about 10,000 homes. Councillor Martin Reid, who sponsored it, told "
  "residents “we've heard your voice loud and clear” and described the regulatory "
  "situation as kind of a Wild West. Mayor Carolyn Parrish had put the previous position more "
  "drily before the vote: who turns down Prologis? I haven't seen anyone yet.",

  "What Mississauga residents actually objected to was specific rather than general: the "
  "electricity demand, the backup generators, a site in a floodplain, the water and the noise.",

  "The provincial opposition wants the pause made general. Green Party leader Mike Schreiner has "
  "called for a province-wide halt until the environmental, energy and health effects have been "
  "properly studied. Polling by Leger puts the share of Canadians worried that data centres will "
  "push up their electricity bills at about 80 per cent."
 ],
 "sources": [
  "https://www.millerthomson.com/en/insights/technology-ip-and-privacy/ontarios-data-centre-playbook-what-it-means-for-grid-access/",
  "https://www.theglobeandmail.com/business/article-ontario-data-centre-framework-electricity-rates-environmental/",
  "https://ero.ontario.ca/notice/026-0853",
  "https://www.torys.com/our-latest-thinking/publications/2026/08/new-framework-for-data-centre-grid-connections",
  "https://www.mccarthy.ca/en/insights/blogs/canadian-energy-perspectives/ontario-launches-data-centre-playbook-proposed-framework-for-grid-access-electricity-costs-and-project-approval",
  "https://www.cp24.com/local/peel/2026/09/16/mississauga-council-set-to-vote-on-temporary-data-centre-moratorium/",
  "https://www.nationalobserver.com/2026/08/11/news/oakville-ont-enacts-one-year-moratorium-data-centres-developers-ai-companies-race",
  "https://www.nationalobserver.com/2026/03/02/news/ontario-towns-cities-data-centres-mapped",
  "https://thepointer.com/article/2026-08-12/green-party-calls-for-province-wide-halt-on-ai-data-centres-until-safeguards-are-in-place",
  "https://www.cbc.ca/news/canada/london/data-centre-framework-local-reaction-9.7306903"
 ]
},

"/data-centers/denmark/": {
 "paragraphs": [
  "Denmark has roughly 60 gigawatts of projects queuing for a grid connection. Peak electricity "
  "demand in the whole country is about 7 gigawatts. The queue is nearly nine times the load the "
  "system was built to carry, and that single ratio is what has driven every Danish decision of "
  "the past year.",

  "Energinet, the national transmission operator, stopped taking new large-scale connection "
  "agreements, covering data centres and other energy-intensive industry alike, and used the pause "
  "to work out how to manage what it already had. Chief Operating Officer Soren Dupont Kristensen "
  "described the halt as a window of opportunity to rethink the regulation.",

  "The allocation rule changed underneath it. From February 1, 2026 Energinet abandoned first come, "
  "first served and began assessing applications in pools against a maturity and realism test: "
  "land rights, how far permitting has progressed, documented delivery timelines, and evidence "
  "that a project is grid-friendly. “Going forward, Energinet will no longer assess projects "
  "solely on a chronological basis,” the operator said. Its tariff design is moving the same "
  "way, from a charge per megawatt hour consumed to a charge per megawatt of capacity reserved, "
  "which bills a developer for holding a connection open whether or not it uses it.",

  "The industry that queue is made of is still small on the ground. Denmark had about 398 "
  "megawatts of installed data centre capacity at the start of 2026 with another 208 under "
  "construction, heading for a projected 1.2 gigawatts by 2030, and hyperscale sites account for "
  "around 60 per cent of what exists. Projects now entering the queue face waits of five to ten "
  "years for full access while the network is planned, procured and built.",

  "Denmark is also where waste heat recovery has been taken furthest, and it has been done "
  "voluntarily rather than under a mandate like Germany's. Meta's Odense campus feeds surplus heat "
  "into the municipal district heating network, enough for roughly 9,000 households, with its "
  "Tietgenbyen facility designed to recover 215,000 megawatt hours. Microsoft and the utility VEKS "
  "expected their first deliveries to reach residents during the 2025-26 heating season, and Danish "
  "engineers have drawn up plans to connect an Apple data centre to a district heating network for "
  "home heating and hot water.",

  "The geography of the whole thing is one substation. Google bought a 131-acre plot at Aabenraa "
  "in 2017 beside an Apple site and next to the 400 kilovolt Kasso substation, which is the point "
  "where the Danish and German grids meet. Being that close to the interconnector is why the "
  "hyperscalers came, along with a cool climate and the cleanest power in Europe.",

  "Whether the pause ends is an open question inside the industry itself. Henrik Hansen, who runs "
  "the Danish Data Center Industry Association, has said an extension cannot be ruled out, and "
  "moratoriums and who should get priority access dominated this year's Data Centers Denmark "
  "conference in Copenhagen. Parliament has separately debated an emergency energy plan aimed at "
  "curbing the sector."
 ],
 "sources": [
  "https://www.datacenterknowledge.com/build-design/denmark-rations-grid-access-as-ai-buildout-floods-nordic-systems",
  "https://thenextweb.com/news/denmark-data-centre-grid-pause-ai-energy",
  "https://renewablesnow.com/news/energinet-to-replace-first-come-first-served-model-from-feb-2026-1285874/",
  "https://www.cnbc.com/2026/05/04/denmark-data-centers-moratorium-grid-pause-power-demand.html",
  "https://www.enerdata.net/publications/daily-energy-news/denmark-introduces-emergency-law-reform-grid-access.html",
  "https://www.computerweekly.com/news/366645787/Denmark-debates-emergency-energy-plan-to-curb-datacentres",
  "https://thetechcapital.com/denmark-targets-data-centre-connections-as-60gw-grid-queue-strains-power-system/",
  "https://www.ramboll.com/en-us/projects/energy/meta-surplus-heat-to-district-heating",
  "https://www.computerweekly.com/news/366623832/Apple-to-play-modest-role-after-datacentre-heat-breakthrough-in-Denmark",
  "https://www.colliers.com/en-dk/news/datacentre-i-danmark-er-det-nemmere-bare-at-sige-nej"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d paras, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs']),len(R[k]['sources'])))
