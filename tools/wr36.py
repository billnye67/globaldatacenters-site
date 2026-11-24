# -*- coding: utf-8 -*-
"""Raw-text recheck: Polk County FL.

LkldNow re-read with tools/read-article.py. All three commissioner quotations survived verbatim,
which is the first page tonight where nothing was wrong. What the summary had dropped was the
substance: the city attorney's position that data centers were already prohibited, and the fact
that the three commissioners who voted no also wanted a pause.
"""
import io, json, os

R = {

"/data-centers/united-states/florida/polk-county/": {
 "paragraphs": [
  "Lakeland Electric's largest customer on a single meter is a Publix complex drawing about 18 "
  "megawatts. The utility has never had a new customer turn up asking for 50 or 100 at once. That "
  "is the measure against which the city was being asked to consider Project Swan, a 600,000 "
  "square foot data center in west Lakeland that officials said could take up to 100 megawatts.",

  "On August 3, 2026 the city commission voted 4-3 for a one-year moratorium covering data centers "
  "and any business expected to use at least 50 megawatts. Applause broke out in the chamber when "
  "the result was read. Mayor Sara Roberts McCarley and commissioners Terry Coney, Chad McLeod and "
  "Guy LaLonde Jr. voted for it. Stephanie Madden, Mike Musick and Ashley Troutman voted against.",

  "The vote was 4-3 but the room was not. All sixteen people who spoke in public comment supported "
  "a pause or something stronger, and all three commissioners who voted no said they wanted a "
  "pause too. Their objection was that the ordinance was drawn too broadly, covering every data "
  "center whatever its size.",

  "“The simple fact of the matter is there's still too many unknowns that we've heard from "
  "our constituents,” LaLonde said, voting for it. “I think that we need to have a "
  "pause,” Musick answered, voting against, “but I don't like the terminology and I "
  "don't like the way that it's written.”",

  "Troutman wanted small proposals left to the city's ordinary development review while Lakeland "
  "studied the very large power users, and he named the thing he was not asking for. “I am "
  "not asking my fellow commissioners to take on a Fort Meade project,” he said, meaning the "
  "campus planned in the south of the county. The city should instead refine the ordinance to "
  "“safeguard against the impacts that have been wisely stated by many of our residents, but "
  "also embrace an emerging technology in this state.” Madden argued some smaller data "
  "centers might suit Lakeland, particularly ones reusing existing warehouses, which would "
  "generate fewer lorry movements than another distribution centre.",

  "The most consequential thing said that day came from the city attorney, and it reframes what "
  "the moratorium actually is. Palmer Davis told the commission that data centers are not listed "
  "as an allowed use anywhere in Lakeland's development code, so staff already treat them as "
  "prohibited. He called the moratorium a belt-and-suspenders approach: it strengthens a position "
  "the city already holds while clearer rules are written. His practical difficulty was that the "
  "code as it stands gives staff no clear basis for approving a small third-party data center and "
  "refusing a larger one.",

  "Lakeland Electric wanted the time. Scott Bishop, its new acting general manager, supported the "
  "pause.",

  "The residents who spoke asked the city to work out the effects on electricity, water, noise and "
  "neighbouring property, and to make certain developers carry the cost of any infrastructure "
  "built for them rather than the utility's other customers.",

  "The moratorium reaches past the city line without being a county ban. It stops Lakeland "
  "accepting, processing or approving data center permits inside the city and in the "
  "unincorporated parts of Polk County that take the city's electric, water or wastewater service.",

  "Troutman's Fort Meade remark points at the larger project, in the south of the county, which "
  "Lakeland's ordinance does not touch. Stonebridge is behind a campus on 1,330 acres of former "
  "phosphate mine near U.S. Highway 17 and Broadway, starting at about 1.9 million square feet "
  "with room to reach 4.4 million, and drawing more than a gigawatt at full capacity. Fort Meade "
  "approved the rezoning and a tax break for it in 2025 and is now deciding the final site plan. "
  "Residents turned out against it at a public forum afterwards, which is the sequence Christina "
  "Reichert, a senior attorney at Earthjustice, objected to: the city had already taken the first "
  "step to approve a development of that size before the people living there had any chance to "
  "give the local government their view."
 ],
 "sources": [
  "https://www.lkldnow.com/lakeland-approves-one-year-moratorium-on-data-centers/",
  "https://www.lakelandgov.net/portals/CityClerk/City%20Commission/Agendas/2026/08-03-26/26-018Ord.pdf",
  "https://www.lkldnow.com/data-center-moratorium-draws-crowd-and-lakeland-revises-hearing-dates/",
  "https://www.wusf.org/environment/2026-02-16/proposals-massive-data-centers-across-florida-are-local-governments-prepared"
 ],
 "unconfirmed": "LkldNow was re-read as raw text and every commissioner quotation on this page "
   "survived verbatim, which makes it the first page in this sweep where the summary had invented "
   "nothing. It had still dropped the two things that matter most: city attorney Palmer Davis saying "
   "data centers are already prohibited because they are not an allowed use in the development code, "
   "which changes what the moratorium is for, and the fact that all three commissioners who voted "
   "against it wanted a pause and objected only to the drafting. Both are now on the page. The Fort "
   "Meade paragraph and the Christina Reichert quotation still rest on a WebFetch summary of WUSF "
   "and have not been re-read raw; they are queued. The July 6 hearing detail, 19 of 20 commenters "
   "opposed and the Polk County Republican Party and Democratic Socialists both speaking against, "
   "came from capturecascade.org, which has not been verified as an original source, and is off the "
   "page until it is."
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
old={k:sum(len(x.split()) for x in e.get(k,{}).get('paragraphs',[])) for k in R}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
for k in R: print('  %-46s %4d -> %4d words, %d paras'%(k,old[k],sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs'])))
