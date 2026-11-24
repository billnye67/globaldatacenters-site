# -*- coding: utf-8 -*-
"""Batch thirty-one: Los Angeles County CA and Kent County MI, second pass.

Both were written before the paywall rule. LA had three outlets refuse; Kent had two.

Redo method:
  Los Angeles   3 further searches on StratCap, the City of Industry and LAX01 rather than the
                county. Data Center Dynamics and Local News Pasadena opened with curl. 6 searches
                and 4 articles opened in total.
  Kent County   3 further searches on Covenant Business Park, Solon Township and the Steelcase
                parcels. CNBC opened with curl after refusing WebFetch. 6 searches and 3 articles
                opened in total.

Two corrections to what was published before, both from opened sources:
  - The Monterey Park developer was given as "the Australian firm StratCap". It is HMC Capital,
    an Australian investment firm which bought the developer StratCap in 2025.
  - LAX01 in Vernon was described as a building already drawing enough power for 26,400 homes.
    It is under construction: 32MW of IT capacity against 49.5MW of secured utility power, with
    the first 6MW due in December 2026.
"""
import io, json, os

R = {

"/data-centers/united-states/california/los-angeles-county/": {
 "paragraphs": [
  "Monterey Park is the first city in the United States to ban data centers permanently by popular "
  "vote, and it got there in four steps over six months. Measure NDC passed on June 2, 2026 by "
  "10,321 votes to 1,362, or 88.34 per cent. It amends the city's General Plan to prohibit data "
  "centers anywhere inside the city limits, it does not expire, and the council cannot undo it. "
  "Only another vote of the public can.",

  "The building that started it sat empty for a decade. The Saturn Business Park at 1977 Saturn "
  "Street is about 65 acres of industrial land across thirteen parcels and roughly twelve owners, "
  "and occupancy had collapsed well before the pandemic. HMC Capital, an Australian investment "
  "firm which bought the developer StratCap in 2025, optioned the 15.8-acre site, proposing to "
  "demolish the vacant 225,000 square foot office block and put up a data center of close to "
  "250,000 square feet. Planning documents show fourteen emergency diesel engines of 4MW each, "
  "implying about 56 megawatts. The Los Angeles Times reported HMC had acquired the site in late "
  "2024 for $39 million.",

  "The company's offer was specific: $5 to $7 million a year into the general fund through parcel "
  "taxes, a new public pocket park, landscaping and lighting along Saturn Street, no increase in "
  "electricity rates for residents or businesses, and minimal water use through closed-loop "
  "cooling. Councilmember Vinh Ngo explained why it needed the city's goodwill at all: "
  "“Because of zoning, which is not really clear, they would be allowed to build a data "
  "center, but it was definitive, so they needed community buy-in.” The city had already "
  "formed the Sparks Committee, chaired by then-Mayor Thomas Wong with Ngo as co-chair, which held "
  "five weekly public meetings.",

  "The community did not buy in. The council was due to decide on December 3, 2025 and postponed "
  "to January 21, 2026 in the face of the opposition, then adopted a 45-day moratorium instead. On "
  "March 4 it voted to put a permanent prohibition to the voters. On April 20 it went further "
  "than the ballot required, passing three ordinances unanimously that banned data centers and "
  "declared them public nuisances. The developer withdrew the next day, citing community "
  "opposition that made continuing impossible. The June vote then locked the ban beyond the "
  "council's reach.",

  "Steven Kung, who co-founded No Data Center Monterey Park, called the result a victory landslide "
  "and named what had moved people: “The noise solution, the air pollution, the rise in the "
  "electricity rates, the deal just didn't make sense.” He also said the thing most winners "
  "in these fights leave out. “Pulling the plug on data centers in Southern California will "
  "most likely mean the centers will plug into someone else's community.”",

  "He was right, and the map shows where. His group has turned to the City of Industry, which "
  "borders more than a dozen communities whose residents have no vote over what it builds, and "
  "organised opposition has since appeared in Rowland Heights, Hacienda Heights, Pomona, Diamond "
  "Bar and La Puente.",

  "The county has now moved at a much larger scale. Amy Bodek, director of Regional Planning, "
  "signed a temporary moratorium on new hyperscale data centers effective September 17, 2026, "
  "covering every unincorporated zone in Los Angeles County. Supervisor Hilda Solis, who chairs "
  "the Board of Supervisors, is pushing a permanent ordinance aimed at facilities that link "
  "hundreds of computers to run artificial intelligence; enterprise, accessory and sole-source "
  "data centers would stay permissible. It went to the Community Services Cluster on September 23 "
  "and the full board on October 6, and reaches the roughly one million people who live in "
  "unincorporated parts of a county of ten million.",

  "The county's own officials supplied the numbers. Public Works Director Mark Pestrella told the "
  "board a single hyperscale data center can use up to five million gallons of water a day. Solis "
  "warned the demand coming could take electricity equivalent to eight million homes, and that "
  "meeting it would mean leaning on fossil-fuel peaker plants.",

  "The industry had already concentrated in the one place in the county with its own power. Vernon "
  "runs a municipal utility supplying electricity, water, gas and fibre at rates reported as low "
  "as half what other Southern California providers charge, a short distance from the One Wilshire "
  "carrier hotel. Goodman Group is building LAX01 there on a 5.6-acre site: 32 megawatts of "
  "critical IT capacity against 49.5 megawatts of secured utility power, fed by a 2N substation "
  "with dual 66kV feeds from Vernon Public Utilities. The first 6 megawatts are due in December "
  "2026 and the rest progressively to September 2027.",

  "Vernon is close to full. The utility's exposure to a single source-line agreement with Southern "
  "California Edison has been reported as stepping up 12.7 times in one cycle, with Edison stating "
  "that further data center load would require further rate adjustments, and the result has been "
  "an administrative pause at utility level rather than a political one. The City of Commerce "
  "separately imposed a 45-day freeze.",

  "A Public Policy Institute of California poll in July found 73 per cent of Californians oppose "
  "data centers being built in their own communities, which is the context in which a council puts "
  "a permanent ban on the ballot and expects to win by 88 per cent."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/proposal-for-250000-sq-ft-data-center-in-monterey-park-california-facing-opposition/",
  "https://localnewspasadena.com/2026/monterey-park-city-council-adopts-moratorium-on-data-centers/",
  "https://abc7.com/post/monterey-park-voters-approve-measure-ndc-banning-power-hungry-data-centers-within-city-limits/19229466/",
  "https://hoodline.com/2026/09/la-county-freezes-giant-ai-data-centers-as-solis-pushes-permanent-ban/",
  "https://www.yahoo.com/news/articles/monterey-park-just-blocked-250-160115988.html",
  "https://laist.com/brief/news/politics/how-monterey-park-residents-pushed-back-on-a-data-center-and-changed-the-conversation",
  "https://lapublicpress.org/2026/01/a-data-center-boom-is-coming-to-the-san-gabriel-valley-residents-had-no-idea/",
  "https://spectrumlocalnews.com/ca/california/politics/2026/06/07/monterey-park-ai-data-centers-vote-inspires-san-gabriel-valley",
  "https://ballotpedia.org/Monterey_Park,_California,_Measure_NDC,_Prohibit_Data_Centers_Measure_(June_2026)",
  "https://us.goodman.com/data-centers/los-angeles/lax01",
  "https://www.connectcre.com/stories/goodman-breaks-ground-on-49-5-mw-data-center-in-vernon/",
  "https://www.costar.com/article/365329619/us-data-center-backlash-takes-shape-in-los-angeles"
 ]
},

"/data-centers/united-states/michigan/kent-county/": {
 "paragraphs": [
  "In December 2025 a Grand Rapids business owner turned up to the Lowell Charter Township "
  "planning commission in a Mr. Peanut costume holding a sign that read “This is nuts.” "
  "The crowd was large enough that the commission postponed the public hearing on rezoning "
  "altogether, and days later officials said they were holding off on the project. Nobody in the "
  "room yet knew whose data center it was.",

  "Franklin Partners, an Illinois developer, had first raised it at the commission in November "
  "2025, asking the township to add a definition of a data warehousing facility to its zoning "
  "ordinance and to rezone the Covenant Business Park to Industrial. It would say only that it was "
  "working with a national company. Open houses that December drew standing-room-only crowds and "
  "overwhelmingly negative reaction.",

  "On January 7, 2026 Microsoft ended the guessing itself, in a letter the township published. "
  "“We are introducing ourselves now because we have observed that the community would like "
  "more information about the proposal,” it said. It named the site as the 237-acre lot "
  "beside Interstate 96, in a township of about 6,500 people twenty miles southeast of Grand "
  "Rapids, terminated the non-disclosure agreements in place, and said it would stop using NDAs "
  "with local governments altogether. On April 13 it applied to rezone Covenant Business Park and "
  "three adjoining properties to light industrial, for an investment put at $500 million to $1 "
  "billion over three to five years.",

  "The township then declined to pause. On May 19, 2026 the board voted 2-5 against a moratorium, "
  "to booing and shouts of recall. Trustee Andy Vander Ziel argued it should take expert advice "
  "and stay open to the conversation rather than regulate first. Resident Jessica Mazarka offered "
  "the board the expertise it said it lacked: “You have an audience full of people who are "
  "willing to help you in this fight.” A committee was formed to draft an ordinance anyway.",

  "Twenty miles west, Gaines Township held its own hearing in a high school auditorium because the "
  "township hall would not hold the people coming. An earlier hearing had been cancelled for "
  "overcrowding. Hundreds came to South Christian High School on April 15, 2026, and the planning "
  "commission tabled the vote to a meeting it has not yet scheduled, without sending anything to "
  "the board of trustees. Microsoft had already asked once to delay the vote while it revised the "
  "plans, and the commissioners had sent it a list of conditions first.",

  "Microsoft assembled that site quietly and early: 316 acres bought from the office furniture "
  "maker Steelcase in 2024 for $45.3 million, and a further 40.5 acres from Republic National "
  "Distributing in November 2024 for $9.7 million. The rezoning request covers five parcels, "
  "nearly 104 acres along Patterson Avenue SE and 76th Street SE.",

  "What the neighbours objected to was specific. Molly Knooihuisen told the commission the noise "
  "might carry as far as two miles and asked the officials to stand up for the people in front of "
  "them. Stephanie Pratt, who lives 150 feet from the site, talked about the land itself: it "
  "“has been farmed for the 10 years I've lived there. Every year they put crops in.” "
  "Residents asked for a moratorium to give the township time.",

  "Microsoft's answer was a set of pledges, and they are the company's own: that it would cover "
  "costs so electricity rates do not rise, replenish more water than it consumes, add to the local "
  "tax base and create full-time jobs without straining local resources. Consumers Energy, which "
  "would serve the site, filed a memo pointing at its November 2024 rate tariff filing and a March "
  "2025 cost-of-service analysis, both of which it says require large energy users to fully fund "
  "the transmission, distribution and generation their service needs.",

  "Solon Township, in the north of the county, is on its fifth draft and running out of time. It "
  "adopted a six-month moratorium in February 2026 amid community pushback, due to expire in "
  "August, and its planning commission has tabled the latest version of a zoning ordinance that "
  "would add definitions for data centers and general rules on noise, mechanical equipment, water "
  "quality and power. Residents say the draft leaves groundwater depletion, grid strain, "
  "wastewater discharge, heat dissipation and noise unaddressed.",

  "The number at issue in Solon is 800 acres, which is what the draft would allow, against the 200 "
  "acres residents have asked for. They have pointed out that the township already caps solar "
  "fields at 200 acres, and that the tone toward four times as much land for data centers has been "
  "markedly warmer.",

  "Across Kent County the pattern is that the pause is the thing that fails. Gaines tabled rather "
  "than refused, Lowell voted a moratorium down and started drafting rules afterwards, and Solon "
  "is redrafting against a clock. Microsoft is separately planning a campus in Dorr Township, just "
  "over the county line in Allegan."
 ],
 "sources": [
  "https://www.cnbc.com/2026/01/07/microsoft-behind-controversial-data-center-in-michigan-township.html",
  "https://www.fox17online.com/news/local-news/wyoming-kentwood-byron-center/hundreds-of-neighbors-protest-microsoft-data-center-rezoning-proposal-at-gaines-township-public-hearing",
  "https://www.michiganpublic.org/politics-government/2026-05-20/why-one-michigan-township-just-rejected-data-centers-while-another-stays-open-to-them",
  "https://lowellledger.org/articles/news/microsoft-reveals-itself-as-data-center-developer-in-lowell-township/",
  "https://lowellsfirstlook.com/lowell-data-center/",
  "https://www.datacenterdynamics.com/en/news/microsoft-plans-data-centers-in-dorr-and-lowell-townships-applies-for-property-rezoning-in-gaines-townships/",
  "https://www.crainsgrandrapids.com/news/real-estate/microsoft-asks-gaines-township-to-delay-vote-on-data-center-rezoning/",
  "https://www.woodtv.com/news/kent-county/solon-township-board-tables-ordinance-proposal-to-limit-data-centers/",
  "https://www.csbugle.com/post/residents-press-planning-commission-to-strengthen-data-center-ordinance-extend-moratorium",
  "https://wwmt.com/news/local/consumers-energy-energy-utilities-microsoft-ai-data-center-gaines-township-caledonia-kent-county-michigan-public-hearing-wwmt",
  "https://www.woodtv.com/news/kent-county/lowell-township-board-votes-against-data-center-moratorium/",
  "https://michiganadvance.com/2026/06/29/michigan-data-centers-the-weekly-download-3-2/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
old={k:sum(len(x.split()) for x in e.get(k,{}).get('paragraphs',[])) for k in R}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-54s %4d -> %4d words, %d paras, %d sources'%(k,old[k],sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs']),len(R[k]['sources'])))
