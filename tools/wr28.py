# -*- coding: utf-8 -*-
"""Batch twenty-eight: Troup County GA, Kent County MI.

Method, counted honestly:
  Troup County   3 searches, 1 article opened in full (Georgia Public Broadcasting). The LaGrange
                 Daily News reports and the ordinance detail come from search results, not from
                 opened pages, and are written without quotation for that reason.
  Kent County    3 searches, 2 articles opened in full (Fox 17, Michigan Public). Crain's Grand
                 Rapids and WOOD TV both refused.
"""
import io, json, os

R = {

"/data-centers/united-states/georgia/troup-county/": {
 "paragraphs": [
  "The thing that turned Troup County against the Hogansville proposal was not the megawatts. It "
  "was the 18-month non-disclosure agreement that kept it out of public view while it was "
  "arranged. “I'm not sure what their definition of transparency is,” said Roseanna "
  "Prado, “but mine certainly isn't keeping something like this from the public.” Paula "
  "Darden, a retired nurse, was shorter: “It's infuriating.”",

  "The project itself is a 600 megawatt data center on 437 acres, put forward by Luis Matta of "
  "Fertile Ground Investments, who offered $12,000 an acre on condition the land was rezoned from "
  "residential to industrial. Councilman Michael Taylor Jr., the only voice against it on the "
  "council, did the arithmetic that mattered to him: “At the end of the day, it's only going "
  "to bring about 30 to 35 jobs.”",

  "A study by MEAG, the state municipal power agency, put the infrastructure needed at about $300 "
  "million, with $153.75 million of that falling on the customer side. Residents raised property "
  "values, water, electricity bills and generator emissions, and asked what happens to the houses "
  "nearest the site. “How could you sit there and tell people from Hightower Road and look "
  "them in the eye and say they're not going to lose their properties?” asked Gage Bailey, an "
  "activist from LaGrange who has spent the past year pressing cities in the county to write "
  "restrictions.",

  "The county did write them. Troup adopted a 90-day moratorium on data center zoning changes, "
  "extended it by another 90 days while it drafted, and then approved an ordinance and lifted the "
  "pause. The result is a 17-page text amendment: every data center now needs a special use "
  "permit, average and hyperscale facilities are confined to heavy industrial zoning, and the "
  "conditions include a 1,500-foot setback, Tier 4 diesel generators rather than the Tier 2 "
  "engines normally installed, a requirement to connect to public sewer, and roofs built to carry "
  "solar panels.",

  "The Troup County Anti-Data Center Coalition told the commissioners it did not go far enough. "
  "Cindy Hutchings raised PFAS contamination found at some data center sites, low-frequency noise, "
  "and the effect on air and water quality.",

  "LaGrange has been running its own version of the argument. The council created a 180-day "
  "moratorium in September and separately called a public hearing on a special use permit for a "
  "data center at the Lafayette Logistics Center off Old Hutchinson Mill Road, taking care to say "
  "that calling the hearing was a required step and not a signal of support. The planning "
  "commission had recommended the permit in June subject to noise studies and a 100-foot "
  "vegetative buffer with a six-foot berm along the road, and had noted that eight parcels "
  "immediately adjoining the site sit outside the city and are zoned suburban single-family "
  "residential by the county.",

  "Where the power would come from was the council's question rather than the residents'. "
  "Councilman Mark Mitchell asked directly; the developers said it would arrive through Georgia "
  "Transmission as part of a larger build serving this site and a neighbouring one, and city "
  "manager Patrick Bowie said more work would be needed before the site could actually be served.",

  "None of this was settled at the state level. Georgia's legislature adjourned without passing "
  "significant data center restrictions and never seriously took up a moratorium, Georgia Power "
  "has asked to add roughly 10,000 megawatts of capacity, and the state is forgoing an estimated "
  "$2.5 billion in revenue in 2026 through data center tax exemptions."
 ],
 "sources": [
  "https://www.gpb.org/news/2025/11/26/why-are-troup-county-residents-saying-no-600-mw-data-center-in-hogansville",
  "https://www.lagrangenews.com/news/commissioners-approve-data-center-ordinance-lift-moratorium-2b6e15ed",
  "https://www.lagrangenews.com/news/anti-data-center-coalition-says-proposed-ordinance-falls-short-adfe3cc6",
  "https://www.lagrangenews.com/news/troup-unveils-proposed-data-center-draft-ordinance-5b5dcee3",
  "https://www.lagrangenews.com/news/troup-extends-data-center-moratorium-another-90-days-c6ce311c",
  "https://www.lagrangenews.com/news/lagrange-council-calls-for-data-center-public-hearing-insisting-call-doesnt-indicate-support-6da06ff2",
  "https://citizenportal.ai/articles/8781289/georgia/troup-county/troup-county-extends-moratorium-on-data-center-zoning-changes-for-90-days-amid-community-concern",
  "https://www.ajc.com/business/2026/04/georgia-lawmakers-leave-data-center-tax-breaks-intact-punt-on-energy-costs/",
  "https://www.yahoo.com/news/us/articles/georgia-data-center-ordinances-most-154058839.html"
 ]
},

"/data-centers/united-states/michigan/kent-county/": {
 "paragraphs": [
  "Gaines Township held its hearing on Microsoft's rezoning in a high school auditorium because "
  "the township hall would not hold the people coming. Hundreds turned up at South Christian High "
  "School on April 15, 2026. The planning commission heard them and then tabled the vote to a "
  "meeting it has not yet scheduled, without sending anything on to the board of trustees.",

  "Microsoft had asked to rezone five parcels, nearly 104 acres along Patterson Avenue SE and 76th "
  "Street SE, from their existing designations to light industrial for a data center campus. It "
  "had bought 316 acres from the office furniture maker Steelcase in October 2024 for $45.3 "
  "million.",

  "What the neighbours objected to was specific and local. Molly Knooihuisen told the commission "
  "the noise might carry as far as two miles and asked the officials to stand up for the people in "
  "front of them. Stephanie Pratt, who lives 150 feet from the site, talked about the land itself: "
  "it “has been farmed for the 10 years I've lived there. Every year they put crops in.” "
  "Residents asked the township for a moratorium to give itself time.",

  "Microsoft's answer was a set of pledges, and they are the company's own: that it would cover "
  "costs so electricity rates do not rise, replenish more water than it consumes, add to the local "
  "tax base and create full-time jobs without straining local resources. Consumers Energy, which "
  "would serve the site, filed a memo pointing at its November 2024 rate tariff filing and a March "
  "2025 cost-of-service analysis, both of which it says require large energy users to fully fund "
  "the transmission, distribution and generation their service needs.",

  "A few miles away in Lowell Township the same company is considering a $1 billion hyperscale "
  "campus at the 237-acre Covenant Business Park on Alden Nash Avenue near I-96. On May 19, 2026 "
  "the township board voted 2-5 against a moratorium, to booing and shouts of recall from the "
  "room. Trustee Andy Vander Ziel argued the township should take expert advice and stay open to "
  "the conversation rather than regulate first. Resident Jessica Mazarka offered the board the "
  "help it said it lacked: “You have an audience full of people who are willing to help you "
  "in this fight.” The board later formed a committee to draft an ordinance anyway.",

  "Residents have been arriving at these meetings in red, carrying signs reading no data center, "
  "no AI in MI, Michigan does not need data centers, and build community not data centers. In "
  "January 2026 an Illinois developer put a west Michigan project costed at $500 million to $1 "
  "billion on hold after residents shut a meeting down.",

  "Solon Township, in the north of the county, is on its fifth draft. Its planning commission "
  "tabled the latest version of a data center zoning ordinance with a six-month moratorium due to "
  "run out in August, while an unidentified developer looks at a site of more than 800 acres.",

  "The pattern across Kent County is that the pause is the thing that fails. Gaines tabled rather "
  "than refused, Lowell voted a moratorium down and then started writing rules, and Solon is "
  "redrafting against a clock. In the same week Lowell said no to a pause, a township outside "
  "Lansing adopted one unanimously, which is the range Michigan townships are operating across."
 ],
 "sources": [
  "https://www.fox17online.com/news/local-news/wyoming-kentwood-byron-center/hundreds-of-neighbors-protest-microsoft-data-center-rezoning-proposal-at-gaines-township-public-hearing",
  "https://www.michiganpublic.org/politics-government/2026-05-20/why-one-michigan-township-just-rejected-data-centers-while-another-stays-open-to-them",
  "https://www.crainsgrandrapids.com/real-estate/commercial/cgr-gaines-township-data-center-explainer-20260403/",
  "https://wwmt.com/news/local/gaines-township-proposed-data-center-public-hearing-meeting-microsoft-conditions-rezone-land-noise-water-electricity-community-michigan-wwmt",
  "https://wwmt.com/news/local/consumers-energy-energy-utilities-microsoft-ai-data-center-gaines-township-caledonia-kent-county-michigan-public-hearing-wwmt",
  "https://www.woodtv.com/news/kent-county/lowell-township-board-votes-against-data-center-moratorium/",
  "https://www.woodtv.com/news/kent-county/we-dont-want-this-protesters-flood-lowell-township-data-center-meeting/",
  "https://eu.detroitnews.com/story/business/2026/01/04/residents-protest-data-center-lowell-township-grand-rapids-kent-county-west-michigan/87992899007/",
  "https://michiganadvance.com/2026/06/29/michigan-data-centers-the-weekly-download-3-2/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d paras, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs']),len(R[k]['sources'])))
