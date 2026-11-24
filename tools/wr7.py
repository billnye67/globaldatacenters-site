# -*- coding: utf-8 -*-
"""Batch seven: China, Germany, India, Brazil."""
import io, json, os

R = {

"/data-centers/china/": {
 "paragraphs": [
  "China's data center problem is the opposite of everyone else's. After a three-year construction "
  "boom driven by competition between local governments, thousands of state-backed facilities are "
  "sitting at low utilisation with high operating costs, and a good many of them are simply empty. "
  "The build-out was speculative, the infrastructure it produced is fragmented, and the viability "
  "of the sites themselves is now the thing the state is worried about.",

  "The response is to try to sell the surplus. The Ministry of Industry and Information Technology "
  "is working with the three state telecoms operators on a single national platform that would "
  "redistribute idle computing power between regions, with the interconnection of public computing "
  "capacity standardised nationwide by 2028. It is an unusual fix, and one only a state that "
  "directed the overbuilding in the first place could attempt.",

  "Making it work is harder than announcing it. The technology to move computing power to a "
  "distant user in real time is not mature, and the facilities are not interchangeable: they run a "
  "mixture of Nvidia parts and domestic alternatives such as Huawei's Ascend chips, with different "
  "hardware and software architectures that do not combine into one cloud service easily.",

  "Alongside the consolidation there is still expansion. A drafted national plan would spend on "
  "the order of $295 billion building an AI data center grid running on 80 per cent domestically "
  "made silicon by 2028, a timeline that depends on Chinese chip production reaching volumes it "
  "has not yet reached.",

  "The external pressure is rising in step. The White House has been weighing restrictions in 2026 "
  "on Chinese networking equipment used in data centers, and Beijing has said it will respond if "
  "the ban is imposed."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/chinese-government-plans-data-center-capacity-reseller-network-amid-overbuild-concerns/",
  "https://finance.yahoo.com/news/billions-wasted-china-data-centres-212800807.html",
  "https://www.aspistrategist.org.au/abundant-electricity-isnt-enough-chinas-overbuilt-ai-computing-power-is-underused/",
  "https://www.tomshardware.com/tech-industry/china-drafts-295-billion-plan-to-build-a-national-ai-data-center-grid-running-on-80-percent-domestic-chips",
  "https://www.oxfordenergy.org/wpcms/wp-content/uploads/2026/02/Comment-The-China-data-centre-advantage.pdf",
  "https://www.tomshardware.com/tech-industry/data-centers/us-mulling-ban-on-key-chinese-networking-tech-in-data-center-component-crackdown-white-house-wants-to-impose-restrictions-in-2026-china-says-it-will-respond-if-necessary"
 ]
},

"/data-centers/germany/": {
 "paragraphs": [
  "Germany requires a new data center to heat something. Under the Energy Efficiency Act, the "
  "Energieeffizienzgesetz, any facility commissioned on or after July 1, 2026 must put at least "
  "ten per cent of its waste heat to use, either on site or fed into a district heating network. "
  "That rises to 15 per cent for sites commissioned in 2027 and 20 per cent in 2028. The same "
  "date brings a power usage effectiveness ceiling of 1.2 with no grace period, and from January "
  "1, 2027 new sites must source all of their electricity from renewables.",

  "The law reaches further down than most national rules do: it applies to every data center in "
  "Germany with a non-redundant nominal connected load of 300 kilowatts or more, not only the "
  "hyperscale campuses. It was passed by the Bundestag in September 2023 and came into force that "
  "November, so operators have had the deadline in view for nearly three years.",

  "The obligation is easier to write than to meet. Waste heat projects keep failing on the same "
  "two obstacles, the absence of a district heating network near the building to feed, and the tax "
  "treatment of selling the heat once it is captured. The federal government has acknowledged both "
  "and says it will work towards legal fixes.",

  "On March 18, 2026 the federal government adopted a National Data Center Strategy that treats "
  "data centers as critical infrastructure for the country's digital transformation and economic "
  "security. Its measures are about access rather than restraint: speeding up grid connections, "
  "revising how capacity is allocated, allowing flexible connection agreements that curtail load "
  "when the grid is tight, and pressing for the technical requirements to be harmonised across the "
  "European Union.",

  "That last point matters because the binding constraint in Germany is physical. Frankfurt, the "
  "largest hub in Europe, has no spare power at all, and the pipeline has moved to smaller places "
  "that have never argued with a hyperscaler before."
 ],
 "sources": [
  "https://www.morganlewis.com/pubs/2026/04/german-government-adopts-national-data-center-strategy",
  "https://www.whitecase.com/insight-alert/data-center-requirements-under-new-german-energy-efficiency-act",
  "https://thecoolingreport.com/intel/germany-heat-reuse-mandate",
  "https://mgrid.org/2025/11/07/germany-enefg-pue-1-2-waste-heat-data-centers-july-2026/",
  "https://blogs.law.columbia.edu/climatechange/2025/10/24/from-eu-framework-to-national-action-how-germany-regulates-data-center-energy-use/",
  "https://www.cundall.com/ideas/blog/why-germanys-energy-efficiency-act-makes-waste-heat-recovery-a-national-priority",
  "https://algorithmwatch.org/en/germany-data-center-boom/"
 ]
},

"/data-centers/india/": {
 "paragraphs": [
  "India is competing for data centers with tax policy rather than regulating them. The Union "
  "Budget for 2026-27 announced a tax holiday running to 2047 for eligible foreign cloud service "
  "providers operating through data center infrastructure based in India, an offer of more than "
  "twenty years of zero tax to move global AI workloads onto Indian soil.",

  "The draft National Data Centre Policy behind it proposes benefits equivalent to infrastructure "
  "status: conditional tax exemptions of up to twenty years, a full exemption from electricity "
  "duty, input tax credits on capital equipment, single-window clearances, and land pre-allocated "
  "in Data Centre Economic Zones sited near the existing IT corridors.",

  "In practice the rules are made by the states, and each has its own. Maharashtra, Tamil Nadu, "
  "Uttar Pradesh, Karnataka, Telangana and Odisha all run separate data centre policies with "
  "different incentives, so that a single national ambition is delivered as one nation with many "
  "laws. In September 2026 Karnataka's cabinet approved a Sustainable Data Centre Policy for 2026 "
  "to 2031 aiming at a gigawatt of cumulative IT capacity by 2031 and a tenth to an eighth of "
  "India's AI-ready capacity, with incentives tied to measured power usage effectiveness and water "
  "usage effectiveness rather than paid out regardless.",

  "The water is the part that has not been solved. Several of the country's largest data centre "
  "hubs sit in areas already under water stress, and the growth in energy and water demand is "
  "running ahead of any national framework for measuring it, let alone limiting it."
 ],
 "sources": [
  "https://www.techcrunch.com/2026/02/01/india-offers-zero-taxes-through-2047-to-lure-global-ai-workloads",
  "https://www.medianama.com/2026/09/223-karnataka-sustainable-data-centre-policy/",
  "https://india.mongabay.com/2026/05/india-bets-on-data-centres-even-as-water-energy-use-concerns-mount/",
  "https://community.nasscom.in/communities/public-policy/analysing-data-centre-policies-india",
  "https://www.profileits.com/data-center-policies-subsidies-approval/",
  "https://blog.se.com/datacenter/2026/09/15/how-state-policies-change-cooling-decisions-across-indias-data-centre-hubs/"
 ]
},

"/data-centers/brazil/": {
 "paragraphs": [
  "Brazil put its data center policy into law on September 15, 2026, when the president signed "
  "Bill 278/2026 as Law 15,504/2026, creating ReData, the Special Tax Regime for Data Center "
  "Services. It suspends the federal taxes on the equipment these buildings are made of: PIS and "
  "COFINS and the industrialised products tax on domestic purchases of ICT fixed assets, and those "
  "plus the import tax on anything brought in. The package is valued at around 5.2 billion reais "
  "from 2026.",

  "The Senate attached conditions the original bill did not have. A company claiming the regime "
  "must run on renewable energy, hydroelectric, solar or wind, and must meet sustainability "
  "targets and investment commitments inside the country to keep the benefit.",

  "It was not passed quietly. Civil society groups objected to the expedited procedure used in the "
  "Chamber of Deputies, arguing it skipped the multistakeholder consultation and the technical "
  "scrutiny a measure of this size would normally get. The substantive objection is about what "
  "Brazil receives in exchange: data centers are highly automated, employ very few people "
  "permanently once built, consume a great deal of electricity, and can operate as enclaves that "
  "draw on local land, power and water without much of the value staying in the region."
 ],
 "sources": [
  "https://www.mattosfilho.com.br/en/unico/special-tax-regime-data-center/",
  "https://abes.org.br/en/presidente-sanciona-o-regime-especial-de-tributacao-para-servicos-de-datacenter/",
  "https://www.datacenterdynamics.com/en/news/the-bill-has-been-approved-by-the-senate-and-is-headed-for-presidential-approval/",
  "https://taiyangnews.info/markets/brazil-senate-ties-data-center-tax-breaks-renewables",
  "https://ip.rec.br/en/blog/position-statement-on-redata-special-tax-regime-for-data-center-services/",
  "https://canalsolar.com.br/en/chamber-approves-redata-datacenters-brazil/",
  "https://www.rinnovabili.net/policy-and-affairs/environmental-policies/brazil-data-center-tax-incentives-renewable-energy/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
