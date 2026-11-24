# -*- coding: utf-8 -*-
"""Batch twenty-seven: Caddo Parish LA, Polk County FL.

Method, counted honestly:
  Caddo Parish   3 searches, 2 articles opened in full (KSLA on the 31 August vote; the Yahoo
                 syndication of the Louisiana Illuminator on Amazon's commitments, after the
                 Illuminator itself refused). KTAL refused twice, so the parish attorney's legal
                 advice below is given in reported speech from KTAL and KTBS rather than quoted.
  Polk County    3 searches, 2 articles opened in full (LkldNow on the moratorium vote, WUSF on
                 Fort Meade).
"""
import io, json, os

R = {

"/data-centers/united-states/louisiana/caddo-parish/": {
 "paragraphs": [
  "Most of Caddo Parish has no zoning at all. Outside Shreveport's city limits and the five-mile "
  "planning boundary around them there is nothing on the books, which Stephen Jean of the "
  "Metropolitan Planning Commission put plainly: there is no zoning whatsoever outside that "
  "boundary. A developer building on unincorporated parish land is not asking anyone's "
  "permission, and that single fact explains everything that has happened here since February.",

  "On February 23, 2026 Amazon announced more than $12 billion across three interconnected "
  "campuses in Caddo and Bossier parishes, which local officials called the largest economic "
  "development win northwest Louisiana had seen in a generation. The company put permanent "
  "employment at 540 jobs paying about 50 per cent above the state average wage, with up to 1,500 "
  "construction jobs through its partner Stack Infrastructure.",

  "The commitments Amazon made are worth attributing carefully, because they are the company's "
  "own. Roger Wehner, its vice president for economic development, said the campuses will use "
  "water for cooling less than 13 per cent of the year and that the design is 80 per cent more "
  "efficient than the industry average. Amazon also committed $400 million towards public water "
  "systems across Caddo and Bossier. On the electricity, SWEPCO president Brett Madison said "
  "Amazon had committed to pay 100 per cent of its own costs, and American Electric Power said "
  "none of it would reach other customers' bills. Unlike Meta's Louisiana deal, this arrangement "
  "did not require Public Service Commission approval.",

  "Residents have not found the answers easy to get. At a meeting held by SWEPCO, the city and "
  "the water utility, people asked about jobs, electricity and water and afterwards said they "
  "never got a straight answer on any of the three.",

  "The commission's attempts to slow it down have run into the same gap that lets the projects "
  "through. Commissioner John-Paul Young proposed a two-year moratorium on tax benefits for "
  "future data centers in August; it went back to the special projects committee. Parish attorney "
  "Donna Frazier advised that a moratorium cannot be created by resolution at all, because under "
  "the parish charter a resolution has no force of law, and that an ordinance imposing one on a "
  "land use in an area with no master plan and no zoning ordinance would conflict with the "
  "Louisiana Constitution of 1974 and with state law. A parish with no zoning cannot pause what it "
  "never regulated.",

  "Young tried the other route instead. Resolution 53 would have asked the Planning and Zoning "
  "Commission merely to consider recommending a moratorium on data center construction in the "
  "commercially and industrially zoned parts of unincorporated Caddo Parish. On August 31, 2026 "
  "the commission voted it down 6-4, with two members absent.",

  "The pressure has not come only from residents. A parish zoning official brought the commission "
  "research on the noise and heat these buildings generate, describing the newer ones as colossal "
  "concrete monoliths that permanently erase wildlife habitat and completely alter the local "
  "microclimate, and argued the commission already has tools short of a moratorium it could be "
  "using. The commission has also declined to take up a one-year pause on developments drawing "
  "water from Caddo Lake.",

  "Inside Shreveport, where zoning does exist, a separate data center was held up by a legal "
  "review before a ruling cleared it to proceed."
 ],
 "sources": [
  "https://www.ksla.com/2026/09/15/caddo-parish-commission-rejects-pause-data-center-construction/",
  "https://www.yahoo.com/news/articles/amazon-says-limit-water-pay-224040383.html",
  "https://lailluminator.com/2026/02/23/amazon-data-center/",
  "https://www.ksla.com/2026/08/18/caddo-parish-commissioner-seeks-moratorium-data-center-tax-incentives/",
  "https://www.ktalnews.com/news/local-news/caddo-parish-data-center-moratorium/",
  "https://www.ktbs.com/news/caddo-commission-data-center-moratorium-on-hold-as-legality-questioned/article_73ba2fa2-4887-462c-b8b9-5b38e386bab3.html",
  "https://www.shreveportbossieradvocate.com/news/yall-have-got-tools-caddo-zoning-official-pushes-alternatives-for-data-center-restrictions/article_ce48f3dd-3ef0-4313-a595-254db26e4139.html",
  "https://www.shreveportbossieradvocate.com/business/west-shreveport-data-center-back-on-track-for-construction/article_b57b6eb0-d3d4-4df6-bcf0-b7844dbe2e1b.html",
  "https://www.ktalnews.com/news/local-news/caddo-data-center-backlash/"
 ]
},

"/data-centers/united-states/florida/polk-county/": {
 "paragraphs": [
  "Lakeland Electric's largest customer on a single meter is a Publix complex drawing about 18 "
  "megawatts. The utility has never had a new customer turn up asking for 50 or 100 at once. That "
  "is the measure against which the city was being asked to approve Project Swan, a 600,000 square "
  "foot data center in west Lakeland that officials said could take up to 100 megawatts.",

  "On August 3, 2026 the city commission voted 4-3 for a one-year moratorium covering data centers "
  "and any business expected to use at least 50 megawatts, effective immediately. Mayor Sara "
  "Roberts McCarley, Terry Coney, Chad McLeod and Guy LaLonde Jr. voted for it; Stephanie Madden, "
  "Mike Musick and Ashley Troutman voted against.",

  "The split was not a split about data centers. “The simple fact of the matter is there's "
  "still too many unknowns that we've heard from our constituents,” LaLonde said, voting for "
  "the pause. Musick, voting against it, said: “I think that we need to have a pause, but I "
  "don't like the terminology and I don't like the way that it's written.” Troutman's "
  "objection was about scope: “I am not asking my fellow commissioners to take on a Fort "
  "Meade project.”",

  "All sixteen people who spoke at the hearing backed the moratorium or wanted something stronger, "
  "raising utility rates, water use, noise and what they saw as overstated economic benefits. A "
  "month earlier, on July 6, residents had filled City Hall over Project Swan and 19 of the 20 "
  "public commenters opposed it. The opposition crossed party lines in a way that is becoming "
  "common: the chair of the Polk County Republican Party and the Polk County Democratic Socialists "
  "of America both spoke against the project at the same hearing.",

  "The moratorium reaches past the city line without being a county ban. It stops Lakeland "
  "accepting, processing or approving data center permits inside the city and also in the "
  "unincorporated parts of Polk County that take the city's electric, water or wastewater service. "
  "During the year the city is to work out power and water demand, noise, public safety, "
  "environmental effects, the impact on neighbouring property, who pays for the infrastructure, "
  "and what the jobs and tax revenue actually come to.",

  "Troutman's Fort Meade remark points at the larger project, in the south of the county, which "
  "Lakeland's ordinance does not touch. Stonebridge is behind a campus on 1,330 acres of former "
  "phosphate mine near U.S. Highway 17 and Broadway, starting at about 1.9 million square feet "
  "with room to reach 4.4 million, and drawing more than a gigawatt at full capacity.",

  "Fort Meade approved the rezoning and a tax break for it in 2025, and is now deciding the final "
  "site plan. Residents turned out against it at a public forum afterwards, which is the sequence "
  "Christina Reichert, a senior attorney at Earthjustice, objected to: the city had already taken "
  "the first step to approve a development of that size, and the people living there had never had "
  "the chance to give the local government their view before the vote."
 ],
 "sources": [
  "https://www.lkldnow.com/lakeland-approves-one-year-moratorium-on-data-centers/",
  "https://www.wusf.org/environment/2026-02-16/proposals-massive-data-centers-across-florida-are-local-governments-prepared",
  "https://wusf.org/text/politics-issues/2026-08-03/lakeland-approves-one-year-moratorium-on-data-centers",
  "https://www.lkldnow.com/data-center-moratorium-draws-crowd-and-lakeland-revises-hearing-dates/",
  "https://www.lakelandgov.net/portals/CityClerk/City%20Commission/Agendas/2026/08-03-26/26-018Ord.pdf",
  "https://capturecascade.org/event/2026-07-08--lakeland-fl-bipartisan-opposition-project-swan-data-center/",
  "https://baynews9.com/fl/tampa/news/2026/08/03/lakeland-city-officials-approve-vote-on-data-center-moratorium",
  "https://www.datacenterbans.com/state/florida"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d paras, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs']),len(R[k]['sources'])))
