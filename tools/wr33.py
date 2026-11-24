# -*- coding: utf-8 -*-
"""Correction sweep 1 of the 79 shallow pages: Australia, Brazil.

First batch written under the hard rule. Every fact below comes from an article opened and read.
Claims that existed on the old pages but could only be traced to a search preview have been cut,
and each page records which ones and why in `unconfirmed`.

  Australia  3 searches, 3 articles opened (Clayton Utz, iTnews, The Post Sydney).
  Brazil     3 searches, 3 articles opened (two Data Center Dynamics pieces via curl, IP.rec).
"""
import io, json, os

R = {

"/data-centers/australia/": {
 "paragraphs": [
  "Australia's nine governments agreed on August 26, 2026 to make large data centers net "
  "contributors to the electricity grid. Under the mandatory national standards National Cabinet "
  "endorsed, an operator must add at least as much energy to the grid as it consumes, pay the full "
  "cost of its transmission and distribution connection, adopt efficiency measures, and support "
  "grid stability through demand flexibility. It is a considerably harder test than the "
  "pay-your-own-way rules other countries have settled on.",

  "On water the obligation is to minimise use, maximise efficiency and pay for any additional "
  "water infrastructure the facility requires. The standards cover large-scale facilities, "
  "co-location sites, hyperscale operations and large-scale AI compute centres rather than small "
  "edge or enterprise rooms, with the final thresholds to be set through consultation. They build "
  "on the Commonwealth's Data Centre Expectations published in March 2026, and legislation is "
  "timetabled for early 2027.",

  "The land-use pillar is the one still missing. It is meant to steer large data centers towards "
  "suitable sites and stop them crowding out competing uses such as housing, with early community "
  "engagement emphasised, but it remains undeveloped next to the energy and water rules.",

  "Queensland and the Northern Territory won the argument they came to have. Both pushed "
  "successfully for an energy-agnostic approach rather than a requirement to source renewables "
  "specifically, which reflects their interests as owners of state generation.",

  "The forecasts underneath all this moved sharply. The Australian Energy Market Operator now "
  "expects data centre consumption on the National Electricity Market to rise roughly sevenfold "
  "over a decade, from about 5 terawatt hours to around 34. A year earlier the same body had "
  "projected 21.4 terawatt hours by 2034-35 and 35.7 by 2054-55, so the curve has been pulled "
  "forward by about twenty years. Growth is expected to concentrate in New South Wales and "
  "Victoria.",

  "AEMO is careful about what those numbers rest on. The forecast counts 225 known data centre "
  "projects, and the operator notes that more than 40 per cent of data centre projects since 2025 "
  "have either dropped out or regressed in connection status. Operators themselves say a new "
  "facility may take five to ten years to reach capacity, and AEMO projects that mature data "
  "centres in aggregate use only about half the network connection capacity they hold.",

  "The sharpest local fight is at Lane Cove West in Sydney, where Goodman Group has proposed "
  "Project Mars at 12 Mars Road: about 90 megawatts, running continuously. The proposal drew 374 "
  "submissions, of which 358 were objections. One data centre already operates in Lane Cove West "
  "and three more are proposed.",

  "The residents do not get the final say, and neither does their council. Project Mars is a State "
  "Significant Development, so the decision rests with the New South Wales government; it is "
  "currently at the response to submissions stage. Goodman says the assessments have shaped the "
  "design, pointing to noise attenuation of equipment and to building elements and orientation "
  "that put line-of-sight noise barriers between the plant and what the planning system calls "
  "sensitive receivers.",

  "The state-level stake is why this is being argued at all. Data centres take around 4 per cent "
  "of New South Wales electricity now and are forecast to reach 11 per cent by 2030, and the "
  "Climate Council has warned that without mandatory renewable energy standards the state's "
  "wholesale electricity prices could rise by as much as 26 per cent by 2035."
 ],
 "sources": [
  "https://www.claytonutz.com/insights/2026/august/nine-governments-one-rulebook-national-cabinet-backs-mandatory-ai-and-data-centre-standards",
  "https://www.itnews.com.au/news/aemo-predicts-seven-fold-rise-in-data-centre-power-use-over-next-decade-628396",
  "https://thepost.sydney/lane-cove-data-centre-project-mars/",
  "https://www.aemo.com.au/newsroom/media-release/2026-esoo",
  "https://www.planningportal.nsw.gov.au/major-projects/projects/project-mars-data-centre",
  "https://www.lanecove.nsw.gov.au/Home/Tabs/Hot-Topics-and-Major-Projects/Data-Centre-proposed-for-12-Mars-Road-Lane-Cove",
  "https://www.abc.net.au/news/2026-07-26/nsw-sydney-ai-data-centres-turn-suburbs-into-wastelands/106946638"
 ],
 "unconfirmed": "Cut from the previous version because they could only be traced to search previews, "
   "not to an opened article: a figure of 66.9 gigawatts of grid connection requests as of June 2026 "
   "(AEMO's opened report gives 225 projects and the attrition rate, not that total); a 150-metre "
   "minimum distance between a data centre and a residential building (Clayton Utz's account of the "
   "same agreement says the siting pillar is still undeveloped); siting rules specifically naming "
   "schools and agricultural land; at Lane Cove, distances of 50 metres to backyards and 160 metres "
   "to a primary school, brownouts in Lane Cove West attributed to AirTrunk's expansion, and Goodman "
   "telling a Senate hearing it had not secured a social licence and would decide by the end of 2026. "
   "Each may well be right; none is on the page until it is read in an article. Also unread: the AEMC "
   "large-load framework and New South Wales moving separately to control grid access."
},

"/data-centers/brazil/": {
 "paragraphs": [
  "About 60 per cent of the data and artificial intelligence workloads used in Brazil are processed "
  "outside the country, and the Ministry of Finance attributes that in part to the cost of tax. "
  "ReData is the attempt to change it.",

  "President Lula signed Bill 278/2026 into law at the Planalto Palace on September 15, 2026, "
  "creating the Special Taxation Regime for Data Center Services. It suspends import duties, the "
  "IPI industrial products tax, PIS/Pasep and COFINS, including on imports, on information and "
  "communication technology equipment and components bought for data centers at home or abroad. "
  "The suspension runs up to five years and becomes a permanent exemption once the obligations are "
  "met. The import duty relief applies only where no equivalent product is made in Brazil, and the "
  "Manaus Free Trade Zone keeps its own treatment, with the IPI suspension not reaching certain "
  "items produced there.",

  "The government estimates the waiver at about 5.2 billion reais, roughly $1 billion, in 2026, "
  "and about 1 billion reais in each of the following two years.",

  "What Brazil asks in return is unusual. A company registered under ReData must allocate at least "
  "10 per cent of its data processing, storage and handling capacity to the Brazilian market, and "
  "cannot export or withhold that portion.",

  "How it passed is the substance of the objection to it. The Chamber of Deputies approved the "
  "bill in February under an urgent procedure, without it going through committees. The Senate "
  "passed it on September 1 with no substantive change, its rapporteur Senator Cid Gomes making "
  "only editorial adjustments so that it would not have to return to the Chamber.",

  "IP.rec, the Recife institute for research on law and technology, opposed that route directly. "
  "“Legislative haste cannot serve as justification for eliminating spaces of public debate "
  "and transparency,” it wrote, arguing the expedited procedure drastically reduced the time "
  "available for technical analysis, and that the regime as drafted offers tax exemptions without "
  "clear guarantees of meaningful social development.",

  "Its substantive case is the one made against this industry everywhere, put precisely. Data "
  "centers are highly automated and generate few permanent jobs. They consume large amounts of "
  "energy and demand robust electrical and water infrastructure, and without safeguards their "
  "arrival may strain regional systems and affect residential consumers, small businesses and "
  "public services. Absent binding obligations, IP.rec argues, they may operate as enclaves, "
  "using local resources while the gains stay concentrated, reproducing what it calls an "
  "extractive logic. What it asks for is clear and measurable obligations, mandatory investment in "
  "local electrical infrastructure, environmental impact assessment, meaningful processing for the "
  "domestic market, transparency about the tax benefits, and incentives tied to reducing regional "
  "inequality.",

  "The test case is in Ceara. A data center is being built inside the Pecem Industrial and Port "
  "Complex north of Fortaleza, developed by the Brazilian wind energy company Casa dos Ventos and "
  "to be operated by ByteDance, TikTok's parent. Regulatory approval came in June 2025, "
  "construction was due to start in the second half of that year, and operations are scheduled for "
  "January 2027, against a total expected investment in infrastructure and equipment of up to 50 "
  "billion reais, about $8.7 billion.",

  "The Anace Indigenous community, which lives around the municipalities of Caucaia and Sao "
  "Goncalo do Amarante, says it is being built on land the community claims. On August 4 the "
  "community occupied the headquarters of SEMACE, the state environment superintendency, in "
  "Caucaia. On August 26 it filed a complaint against the Brazilian government: Brazilian "
  "publications report that it seeks cancellation of the environmental licensing, argues the "
  "facility has been improperly classified as a low-impact activity, and demands the development "
  "licence be revoked, on environmental, procedural and constitutional grounds bearing on land "
  "ownership.",

  "It also disputes the water. Casa dos Ventos' sustainability report put the facility's "
  "consumption at about 30,000 litres a day, as reported by The Intercept Brasil, and the "
  "complaint challenges that figure rather than accepting it."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/president-lula-signs-bill-at-the-planalto-palace/",
  "https://www.datacenterdynamics.com/en/news/brazilian-indigenous-community-files-complaint-to-halt-tiktok-data-center/",
  "https://ip.rec.br/en/blog/position-statement-on-redata-special-tax-regime-for-data-center-services/",
  "https://www.trenchrossi.com/en/legal-alerts/brazil-enacts-law-no-15504-2026-creating-the-redata-tax-incentive-regime/",
  "https://abes.org.br/en/presidente-sanciona-o-regime-especial-de-tributacao-para-servicos-de-datacenter/",
  "https://w.media/brazil-signs-redata-tax-regime-into-law-to-stoke-data-center-investment/",
  "https://www.business-humanrights.org/en/latest-news/brazil-tiktok-data-centre-project-raises-concerns-over-data-governance-environmental-impacts-and-indigenous-rights/"
 ],
 "unconfirmed": "Cut because they came from search previews only: that the Ceara complex would be "
   "ByteDance's largest outside China and carry a price of 200 billion reais or $39 billion (the "
   "opened DCD report gives up to 50 billion reais, about $8.7 billion, and the two figures may cover "
   "different scopes); a $2 billion Casa dos Ventos deal supplying an initial 300MW of wind from "
   "Ceara and Piaui; and a projection that Brazilian data centre capacity could triple by 2030. The "
   "joint statement by civil society organisations, unions and social movements against Bill 278 is "
   "reported by Agencia Brasil and others but was not opened this pass, so only IP.rec's own "
   "published position is used here. The renewable-energy condition attributed to the Senate in the "
   "earlier version of this page is not in the opened sources in that form; what they carry is a "
   "sustainability criterion including electricity from renewable or low-emission sources."
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
old={k:sum(len(x.split()) for x in e.get(k,{}).get('paragraphs',[])) for k in R}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-28s %4d -> %4d words, %d paras, %d sources'%(k,old[k],sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs']),len(R[k]['sources'])))
