# -*- coding: utf-8 -*-
"""Batch eighteen: Hanover County VA, Pottawattamie County IA, Carroll County GA, Selangor."""
import io, json, os

R = {

"/data-centers/united-states/virginia/hanover-county/": {
 "paragraphs": [
  "Hanover County turned down the biggest data center proposal it has ever received. On May 28, "
  "2026 the Board of Supervisors voted 4-3 against rezoning nearly 430 acres for Mountain Road "
  "Technology Park, a campus put forward by the Denver-based developer Tract. Chairman Sean Davis "
  "and Supervisors Stoneman, Floyd and Prichard voted to deny; Supervisors Herzberg, Sue Dibble "
  "and Ryan Hudson voted to approve.",

  "The board went against its own planning commission to do it. Six weeks earlier, on April 16, "
  "the commission had recommended the 427-acre campus for approval by 6-1.",

  "Water decided it. The campus was estimated to need between 600,000 and two million gallons a "
  "day, and Hanover does not produce its own drinking water; it buys it from the City of Richmond. "
  "A county that depends on a neighbour's supply was being asked to commit an unknown share of it "
  "to one customer for the life of the buildings.",

  "This was the second refusal of the year. In January the planning commission had voted to deny a "
  "rezoning of about 400 acres for an HHHunt data center development, sending that decision up to "
  "the supervisors in February. A third proposal, Iron Horse, was deferred on June 19 rather than "
  "decided."
 ],
 "sources": [
  "https://richmondbizsense.com/2026/05/28/hanover-supervisors-reject-data-center-project-on-mountain-road/",
  "https://www.wtvr.com/news/local-news/hanover-county/tract-data-center-vote-may-28-2026",
  "https://virginiabusiness.com/hanover-supervisors-reject-430-acre-data-center-campus/",
  "https://www.vpm.org/news/2026-06-01/hanover-mountain-road-data-center-tract-davis-prichard-kirchner-dibble",
  "https://www.vpm.org/news/2026-04-17/hanover-planning-commission-mountain-rd-data-center-covington-strong/",
  "https://www.wtvr.com/news/local-news/hanover-planning-commission-hhhunt-data-center-rezoning-jan-15-2026",
  "https://www.12onyourside.com/2026/06/19/iron-horse-data-center-proposal-deferred-hanover-county/"
 ]
},

"/data-centers/united-states/iowa/pottawattamie-county/": {
 "paragraphs": [
  "While eight Iowa counties adopted data center moratoriums during 2026, Council Bluffs voted "
  "against one unanimously. The city council rejected a proposal in June that would have limited "
  "new projects for a year, which in a state where the pauses have been arriving steadily makes "
  "Pottawattamie County the clearest case of a place that has decided it wants more of this rather "
  "than less.",

  "It has the longest relationship with the industry in Iowa to go with that. Google has been in "
  "Council Bluffs since 2009 and has expanded the campus repeatedly; the current expansion is "
  "around 300 megawatts, putting the site near 300 megawatts overall. The city granted a twenty-"
  "year tax abatement on the original building and has renewed incentives at each expansion since.",

  "That arrangement is what the statewide argument is now about. Rob Sand has campaigned on a plan "
  "to end Iowa's data center tax breaks altogether, and communities across the state are writing "
  "their own rules as the development spreads beyond the established sites at Council Bluffs, "
  "Cedar Rapids, Altoona, Waukee and West Des Moines.",

  "Nothing in Council Bluffs suggests the council regrets the bargain. What has changed is that "
  "the rest of Iowa is now looking closely at what the bargain was."
 ],
 "sources": [
  "https://nonpareilonline.com/news/local/government-politics/article_a40a8fd9-d8dc-4229-b7ab-f25f094767af.html",
  "https://nonpareilonline.com/news/local/article_1b19ff8d-a8f5-41e4-b979-05a78769d9e9.html",
  "https://morethanjustparks.com/data-center-tracker/google-council-bluffs-expansion-ia--bd3d1acf-a1f7-4a7e-a3cd-748baf5ecb70",
  "https://www.thegazette.com/news/elections/sand-unveils-plan-to-end-iowa-data-center-tax-breaks/article_8eb1a97a-db27-4dad-9b17-50a9a9de6c9c.html",
  "https://www.businessrecord.com/iowa-communities-grapple-with-regulating-data-centers-as-development-spreads/"
 ]
},

"/data-centers/united-states/georgia/carroll-county/": {
 "paragraphs": [
  "Carroll County's commissioners voted 7-0 on March 3, 2026 for a 100-day moratorium on permits "
  "for data centers and battery energy storage systems, and in June they extended it for another "
  "100 days. Residents had been turning up to speak against data center development since the "
  "start of the year, and around a dozen did so at the meeting where the extension was considered.",

  "The commissioners were explicit about the limit of what they had passed: the moratorium covers "
  "unincorporated Carroll County only and does not touch the municipalities inside it. That is the "
  "same gap developers have been using across Georgia, where a county pause can be stepped around "
  "by buying land at a city's edge and asking to be annexed.",

  "The campaign that produced the vote started with one site. A petition to stop a data center at "
  "Villa Rica has been running alongside the commission meetings, and it was the pressure from "
  "that fight that turned into a countywide pause rather than a decision on a single application."
 ],
 "sources": [
  "https://gradickcommunications.com/carroll-county-board-of-commissioners-approve-100-day-moratorium-on-data-centers-battery-energy-storage-systems/",
  "https://www.times-georgian.com/news/local/data-center-moratorium-extended/article_a7d31b38-3e6a-59d0-8da4-6ac3a17a167c.html",
  "https://www.change.org/p/stop-the-villa-rica-ga-data-center/u/34716236",
  "https://www.interconnectedcapital.com/research/data-center-moratoriums"
 ]
},

"/data-centers/malaysia/selangor/": {
 "paragraphs": [
  "Selangor approved 39 data centre projects between 2021 and 2025, and the state puts the "
  "permanent employment they will create at more than 2,400 people, which works out at somewhere "
  "around sixty jobs for each approved project.",

  "The terms have tightened since. On September 8, 2026 the Menteri Besar, Amirudin Shari, said no "
  "data centre will be approved in Selangor without guaranteed water and electricity supply behind "
  "it. Every proposal has to clear federal committees and task forces first, with Tenaga Nasional "
  "assessing whether the grid can carry it and Air Selangor assessing whether the water exists.",

  "There is a threshold attached. Any project expected to consume more than two million litres of "
  "water a day must now submit a detailed water availability study before it goes any further.",

  "The state's position is that current reserves cover what has already been approved, and that "
  "the Rasau Water Supply Scheme will add 350 million litres a day, rising to 700 million on full "
  "completion of its first phase. That is a claim about future infrastructure rather than existing "
  "supply, and it is the assumption the approvals rest on.",

  "Selangor is the older of Malaysia's two clusters. The Klang Valley, including Cyberjaya, holds "
  "much of the country's early colocation capacity and Google's first Malaysian data centre at "
  "Elmina, and it has not been subject to the water-cooling freeze imposed next door in Johor."
 ],
 "sources": [
  "https://www.thestar.com.my/metro/metro-news/2026/09/08/amirudin-data-centre-project-approvals-subject-to-sufficient-water-power-supply",
  "https://www.malaymail.com/news/malaysia/2026/09/08/no-data-centre-approval-without-enough-water-power-says-selangor-mb/234401",
  "https://www.thestar.com.my/metro/metro-news/2026/08/07/almost-40-data-centres-approved-in-selangor",
  "https://thesun.my/news/malaysia-news/people-issues/selangor-closely-monitoring-water-power-supply-amid-data-centre-expansion/",
  "https://opengovasia.com/malaysia-selangor-aligns-data-centre-growth-with-water-and-energy-security/?c=us",
  "https://www.malaymail.com/news/malaysia/2026/09/10/malaysias-data-centre-boom-how-it-affects-jobs-electricity-and-water/234298",
  "https://airmap.my/investment/data-centers/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
