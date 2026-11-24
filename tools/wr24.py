# -*- coding: utf-8 -*-
"""Batch twenty-four: Indonesia, Nigeria.

Method: three searches each, then two articles opened per page (Jakarta Post and Global Voices
for Indonesia; Techmoonshot and TechCabal for Nigeria). The water figures, the named campaigners
and the diesel arithmetic below are all from the opened articles.
"""
import io, json, os

R = {

"/data-centers/indonesia/": {
 "paragraphs": [
  "Indonesia took the data centres Singapore and Johor stopped taking. Both neighbours restricted "
  "licensing on water and power grounds, and the industry moved across the strait to Batam, which "
  "sits beside the same submarine cables. By April 2026 the country had about 170 data centres, "
  "eighteen of them in the Batam Industrial Complex, with at least sixteen more in Batam at "
  "various stages of development, and $7.1 billion of data centre investment arrived in the first "
  "half of 2026 alone, four times the figure a year earlier.",

  "Batam's clean water comes from six reservoirs producing 3,487 litres a second. Cooling at "
  "large-scale data centres on the island is estimated to need around 18.93 million litres a day, "
  "which is what between 10,000 and 50,000 residents use, and the facilities are projected to take "
  "roughly 8 per cent of the city's entire water supply. Nongsa Digital Park alone is put at 285 "
  "megawatts and about 29 million litres a day; Kabil Industrial Park at 56 megawatts and up to "
  "three million litres, about what 30,000 people need.",

  "Residents are already rationing. “The situation of water congestion in Batam is currently "
  "like a lottery,” said Uba Ingan Sigalingging of the group Gerakan Bersama Rakyat. "
  "“It's just a matter of waiting for which housing won't receive water today.” In "
  "December 2024, when the supply at Nongsa Digital Park was interrupted, authorities called it a "
  "technical glitch and fixed it immediately; people in the Teluk Mata Ikan fishing village "
  "protested at the contrast between how fast the facility's water came back and how long theirs "
  "stayed off.",

  "The researchers frame it as a priority question rather than a shortage. Hotmauli Sidabalok of "
  "Yayasan Amerta Air Indonesia has described it as environmental injustice, with human needs, "
  "water being a basic one, competing directly against the demands of data centres. The "
  "environmentalist Gari Dafit Semet put the moderate version: “We are not opposed to "
  "development, but the local government must carefully balance industrial expansion with "
  "environmental sustainability.” Suyono Saputra of Batam International University argues for "
  "utility first and investment after, warning that if the infrastructure lags behind the arrival "
  "of the money, a supply crisis will hit residents hard. His long-term answer, seawater reverse "
  "osmosis, needs money and years that nobody has committed.",

  "The power is being contracted anyway. PLN Batam has signed a 511 MVA agreement, around 450 "
  "megawatts, with DayOne to supply a hyperscale campus at Kabil Industrial Tech Park in phases "
  "across 2026 and 2027. The Nvidia-backed Firmus announced a 360 megawatt AI campus at Batam in "
  "June 2026 housing some 170,000 GPUs, and Jakarta has been courting a reported $15 to $20 "
  "billion pipeline of Nvidia-linked investment that would take Batam towards 1.3 gigawatts.",

  "What the state offers in return is unusually generous: under the Special Economic Zone "
  "framework, tax holidays of up to twenty years, exemption from value added tax and import duty, "
  "regional tax reductions, full foreign ownership and a 300 per cent super deduction on research "
  "spending. The older clusters east of Jakarta, at Karawang, Cikarang and Cibitung, run at around "
  "80 per cent occupancy.",

  "The legislative side has not kept pace. A power wheeling bill that would let generators sell "
  "directly across the grid has been stalled in the National Legislation Programme since 2019, "
  "with Ratna Juwita of House Commission XII saying she intends to get it passed in 2026. A "
  "sovereign AI fund managed largely by Danantara is not expected before 2027 at the earliest, and "
  "an industry projection in May put Indonesia on course for a one gigawatt shortfall in Tier 3 "
  "and Tier 4 capacity by 2030."
 ],
 "sources": [
  "http://www.thejakartapost.com/indonesia/2026/08/15/batam-data-center-expansion-threatens-water-electricity-supplies",
  "https://globalvoices.org/2026/04/21/ai-ready-data-centers-are-booming-in-indonesia-but-water-woes-loom/",
  "https://www.thejakartapost.com/business/2026/04/20/batam-powers-ahead-as-southeast-asias-emerging-hyperscale-data-center-hub",
  "https://www.datacenterdynamics.com/en/news/dayone-inks-450mw-ppa-with-pln-batam-to-power-planned-data-center-in-batam-indonesia/",
  "https://technode.global/2026/08/14/indonesias-data-center-boom-faces-growing-infrastructure-challenges-bmi/",
  "https://www.aseanrising.com/articles/indonesia-s-batam-ai-hub-and-the-test-of-sovereign-compute-rplg1",
  "https://en.antaranews.com/news/428800/danantara-eyes-wider-data-center-investment-as-demand-surges",
  "https://www.makarim.com/news/data-center-investments-and-opportunities-in-indonesia",
  "https://en.tempo.co/read/2117796/how-indonesia-emerged-as-a-data-center-hotspot-after-singapore"
 ]
},

"/data-centers/nigeria/": {
 "paragraphs": [
  "Nigeria's electricity grid has never carried more than about 6 gigawatts, for 230 million "
  "people, and it is available roughly 41 per cent of the time, which is to say it is off more "
  "than it is on. South Africa generates 48 gigawatts for 63 million. Every data centre decision "
  "in this country runs through that one fact.",

  "The consequence is diesel, and the arithmetic is brutal. A one megawatt data centre running on "
  "diesel burns something like 250 to 300 litres an hour. At Nigerian prices of 1,400 to 1,600 "
  "naira a litre that is $2 million to $2.6 million a year in fuel for every megawatt, which works "
  "out at 40 to 50 US cents a kilowatt hour against 5 to 10 cents in South Africa or Kenya. "
  "Operating a facility here costs five to ten times what it costs elsewhere on the continent.",

  "They are being built regardless. Kasi Cloud, backed by the Nigeria Sovereign Investment "
  "Authority, has broken ground on a $250 million hyperscale campus at Lekki in Lagos. Equinix is "
  "opening LG3, a $22 million, 610 square metre facility, as the first phase of a $100 million "
  "pan-African plan. Open Access Data Centres is building towards 24 megawatts with a 12 megawatt "
  "phase due in 2026. Nxtra by Airtel has the largest announced campus at 38 megawatts, Africa "
  "Data Centres has a 20.65 megawatt Tier III site in Eko Atlantic City, and Digital Realty bought "
  "Medallion Data Centres to get in. Installed capacity was about 86 megawatts in 2025 with "
  "roughly 320 more planned or under construction.",

  "Operators are engineering around the grid rather than waiting for it. Solar, diesel and battery "
  "hybrids are becoming standard, and MainOne has gone to natural gas generation specifically to "
  "get off diesel. The regulator has started to move too: in June 2026 the Nigerian Electricity "
  "Regulatory Commission gave six regional grid operators sixty days to defend or revise their "
  "large-load tariffs and required thirty-day plans showing generation would be adequate.",

  "The demand side is being created by law. On August 17, 2026 the federal government released the "
  "National Digital Cloud Policy, replacing the 2019 framework and sorting government data into "
  "four levels. Level 4, covering national security and defence, must sit on infrastructure "
  "physically in Nigeria and under sovereign control. Level 3, which takes in financial, health, "
  "biometric and identity data, must be stored at rest in the country. Level 1 carries no "
  "residency requirement at all, so this is a targeted rule rather than blanket localisation.",

  "Federal ministries and agencies must now go cloud-first for new systems unless NITDA grants "
  "them a published, time-bound exemption. NITDA regulates and registers providers, Galaxy "
  "Backbone aggregates government demand and negotiates the framework agreements, and the Bureau "
  "of Public Procurement polices compliance, with a National Digital Marketplace coordinating what "
  "agencies buy. Bosun Tijani, the minister for communications, innovation and digital economy, "
  "set the targets at $250 million of investment within twelve months and $750 million within "
  "twenty-four, on a three-phase roadmap starting in August 2026.",

  "Whether that holds is the open question. The 2019 cloud policy was implemented unevenly because "
  "no single body was coordinating it, which is the specific failure the new structure is built to "
  "fix. The harder problem is unchanged: a residency rule creates demand for Nigerian data centres, "
  "and the grid still cannot power them without burning fuel at ten times the regional cost."
 ],
 "sources": [
  "https://techmoonshot.com/2026/02/26/lagos-is-getting-a-250-million-hyperscale-data-center-heres-why-nigeria-still-cant-power-the-cloud/",
  "https://techcabal.com/2026/08/18/nigerias-new-cloud-policy-puts-government-at-the-centre-of-its-cloud-market/",
  "https://fmcide.gov.ng/federal-government-unveils-national-digital-cloud-policy-to-drive-investment-digital-sovereignty-and-government-transformation/",
  "https://www.mondaq.com/nigeria/new-technology/1834740/nigerias-national-digital-cloud-policy-key-provisions-and-implications-for-business",
  "https://www.datacenterdynamics.com/en/news/equinix-plans-22-million-data-center-in-lagos-nigeria/",
  "https://businessday.ng/technology/article/nigeria-races-toward-ai-data-centre-ambitions-amid-energy-gaps/",
  "https://www.safeexpat.com/lagos-data-centers-energy-risk-esg-nigeria/",
  "https://cioafrica.co/nigerias-cloud-policy-sets-the-rules-can-it-enforce-them/",
  "https://www.mordorintelligence.com/industry-reports/nigeria-data-center-market"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d paras, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs']),len(R[k]['sources'])))
