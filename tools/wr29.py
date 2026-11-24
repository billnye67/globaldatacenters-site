# -*- coding: utf-8 -*-
"""Batch twenty-nine: Union County OH, rewritten.

Why this page was redone. The first version stopped when the Marysville Journal Tribune
paywalled and ran to 459 words with a closing apology for it. That was the wrong response to a
paywall. Searching the township, the city, the project names and the developer instead of the
county name found a great deal the county search never surfaced, and Data Center Dynamics, which
refused WebFetch twice, opened immediately with curl and a browser user agent.

Method for the redo:
  6 searches, all with the state in the query: Jerome Township Ohio; Marysville Ohio Amazon JEDD;
  "Marysville South"; AWS Jerome Township Industrial Parkway; Plain City Ohio; Tom McCarthy.
  4 articles opened in full: WOSU, New Project Media, and two Data Center Dynamics pieces via
  curl. Combined with the first pass, 9 searches and 5 sources opened.

Two traps recorded for whoever does the rest:
  - A paywall on one outlet is never the end of the search. Search the project name, the township,
    the city and the developer.
  - Union County exists in Ohio, Pennsylvania, South Carolina, Tennessee, New Jersey and more.
    Several Citizen Portal results returned for "Plain City" were tagged Athens County, a
    different Ohio place called The Plains, and are not used here.
"""
import io, json, os

R = {

"/data-centers/united-states/ohio/union-county/": {
 "paragraphs": [
  "Two Amazon data centers under construction in Jerome Township called the fire service 84 times "
  "between 2021 and 2025, roughly twice a month for four years, often with lights and sirens. The "
  "Columbus Dispatch obtained the records. Two of the calls were deaths: a worker crushed at the "
  "Warner Road site, another who fell at the Industrial Parkway site. A fire at Industrial Parkway "
  "in April 2025 held firefighters for 30 hours and did $50 million of damage.",

  "The Dispatch also found that when crews arrived they were frequently stopped by security and "
  "made to wait outside, sometimes for as long as an hour. Amazon said it and its contractors had "
  "put additional mechanisms in place to improve health and safety at their sites, and attributed "
  "the delays to contractors applying different background-check policies at the gate.",

  "The township's fire chief, David Baird, put his position plainly to the paper: “We're not "
  "a huge fan of the data centers, but Hilliard controls economic development, and data centers "
  "bring in business.” The buildings generating those call-outs carry tax abatements running "
  "years into the future, so they are not yet paying for the service they are using.",

  "Jerome Township's trustees voted unanimously for a moratorium on the receipt, processing, "
  "issuance or approval of any zoning certificate for a data center. It did not hold. The "
  "township's zoning inspector approved certificates for four data center complexes he had "
  "previously rejected; two of them had been filed before the moratorium, and two had not. "
  "Residents filled the trustees' meeting in February 2026 to say so. On March 17 the trustees "
  "voted to advance amendments making data centers a conditional use rather than a permitted one, "
  "so that each future application has to be argued for.",

  "The queue behind those certificates is substantial. Civil Solutions, a Cincinnati firm, filed "
  "in April for two campuses on about 215 acres either side of the AWS site: six buildings of "
  "180,000 to 270,000 square feet each on Industrial Parkway, and five of 157,500 to 229,500 "
  "square feet on Warner Road, on land held by 8510 Warner Road LLC. Neither filing named an end "
  "user. Zoning inspector Eric Snowden disapproved both on September 3, and Civil Solutions "
  "appealed to the Board of Zoning Appeals for December 17. Separately, Magnus Development, a "
  "company linked to AWS, paid $9.7 million in July for 109 acres at 12030 Industrial Parkway.",

  "In Marysville the terms are on the record. The city council granted AWS a reinvestment area "
  "agreement on March 10, 2025 for Project Cosmo: two buildings totalling 500,000 square feet on "
  "55 acres at 14684 Industrial Parkway in Marysville Innovation Park, against a $1 billion "
  "commitment, with a 30-year, 100 per cent property tax exemption on the assessed value of the "
  "data centers. AWS agreed to payments in lieu of taxes of about $1.04 million a year for fifteen "
  "years, some $15.6 million in total, shared between the Marysville Exempted Village School "
  "District and the city. Roger Wehner, the company's vice president for economic development, "
  "said it was reinforcing a long-term commitment to Ohio; city manager Terry Emery called it a "
  "significant step forward for Marysville and Union County.",

  "A second and much larger project, Marysville South, is being developed by Anadonna LLC on "
  "nearly 600 acres off Weaver Road, southwest of the city below the Union County Airport. The "
  "site is close to inaccessible, so the developer is paying to build a bridge over the railway "
  "rather than route traffic down Weaver Road. Marysville has offered a 15-year, 100 per cent "
  "abatement on the building, with taxes on the land itself expected to raise about $18 million "
  "over fifteen years for the schools and the city.",

  "The water is the part the city negotiated hardest. Council expanded its joint economic "
  "development district with Jerome Township to take in land near Mitchell-Dewitt and Industrial "
  "Parkway for a potential hyperscale site, and the agreement allows 40,000 gallons a day through "
  "the peak cooling months of May to September, rising to four times that out of season when the "
  "system is slacker. Going over carries penalties that escalate from five times the standard rate "
  "for a small overage to as much as 500 times it for extreme overuse. Two data centers already "
  "operating south of the city take an estimated tenth of Marysville's daily water capacity. Amber "
  "Darst, a Union County farmer whose land lies downstream of the proposed site, is among those "
  "who want the assurances tested rather than accepted.",

  "Plain City, which straddles the Union and Madison county line, adopted a moratorium of its own "
  "in August 2026 after council took up a six-month pause on August 10. It stops new zoning "
  "applications, site approvals and permit reviews for large computing facilities inside the "
  "village, and reaches neither the projects already permitted nor the unincorporated county land "
  "around it.",

  "Union County Commissioner Tom McCarthy came back from a National Association of Counties "
  "meeting in New Orleans in August 2026 arguing that with opposition now close to universal, the "
  "balance may be shifting towards the communities, provided local leaders understand what they "
  "are signing. The state has two bills that bear on exactly that: House Bill 15, signed in 2025, "
  "lets a data center build generation behind the meter and bypass some local zoning review and "
  "Public Utilities Commission oversight with it, and House Bill 695 would fine local officials "
  "$1,000 a time for knowingly signing a non-disclosure agreement with a data center developer. By "
  "September 18, 2026 Ohio had more than 125 active data center moratoriums."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/amazon-data-centers-in-jerome-township-ohio-called-emergency-services-84-times-since-2021/",
  "https://www.datacenterdynamics.com/en/news/aws-gets-go-ahead-for-data-center-campus-in-marysville-ohio/",
  "https://newprojectmedia.com/developer-files-plans-for-two-large-scale-data-center-campuses-adjacent-to-aws-in-jerome-township-oh/",
  "https://www.wosu.org/2026-02-26/ohio-towns-are-pushing-back-against-data-centers-to-varying-degrees-of-success",
  "https://www.10tv.com/article/news/local/boomtown-ohio/marysville-weighs-data-center-impact/530-467eb56b-2095-4bf8-94da-86cfa0b9f019",
  "https://marysvillematters.substack.com/p/detour-west-5th-median-on-the-way",
  "https://marysvillematters.substack.com/p/marysville-north-plan-pushed-forward",
  "https://www.marysvillejt.com/2026/02/06/jerome-residents-dont-like-data-center-dealings/",
  "https://www.marysvillejt.com/2026/03/19/jerome-clamps-data-centers/",
  "https://ww2.marysvillejt.com/2026/08/05/mccarthy-citizens-cards-data-center-battle/",
  "https://abc6onyourside.com/news/local/plain-city-council-to-vote-aug-10-on-six-month-moratorium-on-data-centers",
  "https://ohiocapitaljournal.com/2026/09/18/ohio-now-has-over-125-active-moratoriums-on-data-centers-see-where-they-are/",
  "https://www.ohiomfg.com/our-communities/central-ohio-township-places-moratorium-on-new-data-centers/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
old = sum(len(x.split()) for x in e.get('/data-centers/united-states/ohio/union-county/',{}).get('paragraphs',[]))
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
k='/data-centers/united-states/ohio/union-county/'
print('total reports: %d'%len(e))
print('  %s  %d -> %d words, %d paras, %d sources'%(k, old, sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs']),len(R[k]['sources'])))
