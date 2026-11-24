# -*- coding: utf-8 -*-
"""Raw-text recheck: Ontario.

Re-read CP24 and the Globe and Mail with tools/read-article.py. Note: rechecking costs no search
budget, because the source urls are already recorded on the page. This session is at its 200
search cap and can still do this work.

Corrections:
  - Mayor Carolyn Parrish's "who turns down Prologis? I haven't seen anyone yet" is not in the
    CP24 report. It came from a National Observer summary. Removed.
  - Ford's "We want to have sovereign data. We don't want to rely on President Trump getting his
    paws all over it" is not in the Globe text read. Removed.
  - "Premier Doug Ford's summary was that the measures ensure no costs are passed to consumers"
    was a paraphrase presented as his position. The Globe says something different and more
    specific, which is now on the page.
Recovered: Oakville's was the PROVINCE'S FIRST moratorium; Hamilton and Burlington rejected one
and ordered studies instead; Ford has been critical of moratoriums; and Reid's verdict on the
playbook, which is the sharpest line in the story.
"""
import io, json, os

R = {

"/data-centers/canada/ontario/": {
 "paragraphs": [
  "Ontario has taken the decision about data centre grid connections away from the utilities and "
  "given it to the cabinet. The Protect Ontario by Securing Affordable Energy for Generations Act "
  "received Royal Assent on December 11, 2025, handing the provincial government final say over "
  "whether any large-load facility connects at all, and on August 13, 2026 the government "
  "published a draft Data Centre Playbook setting out how it intends to use that power. "
  "Consultation ran thirty days, with a final version expected in the autumn.",

  "The centre of it is that data centres should build their own power. Premier Doug Ford said the "
  "government will encourage developers to put up their own generation rather than lean on the "
  "grid, and proposed a separate electricity rate for large projects: anything drawing more than "
  "one megawatt would pay more than other large industrial users, a threshold low enough to catch "
  "essentially every new data centre built for artificial intelligence. Developments would also "
  "have to benefit local economies and meet environmental standards on water consumption and "
  "noise. “The question is, what are the benefits you're bringing to the community?” "
  "Ford said.",

  "Connecting is a two-part test rather than a queue. A system impact assessment covers "
  "feasibility, the effect on the grid, full cost recovery, what reinforcement is needed and what "
  "the applicant proposes to generate on site. A strategic priority assessment covers economic "
  "development, data security, digital sovereignty and community investment.",

  "How much is waiting depends who is counting. The IESO has put data centre requests at around "
  "6,000 megawatts, enough for more than four million Ontario homes. The Playbook's own figure for "
  "applications in the pipeline exceeds 10,000 megawatts, roughly 40 per cent of the province's "
  "recent peak demand. The IESO does not publish the locations of the sites securing that power, "
  "so a municipality generally finds out when a rezoning application arrives.",

  "Which is why the cities moved first, and why the province is chasing them. Oakville passed the "
  "first municipal moratorium in Ontario in August 2026. On September 16 Mississauga's council "
  "voted unanimously for a one-year freeze on data centres drawing more than 10 megawatts, about "
  "enough electricity for 10,000 homes, framing it as time to work out what guardrails it could "
  "put around them given residents' concerns about energy, water and noise.",

  "“We've heard your voice loud and clear,” said Martin Reid, the councillor who "
  "sponsored it. His complaint is that cities have been left without enforceable standards: "
  "“It's kind of a Wild West.”",

  "Not every city has gone the same way. Hamilton and Burlington directed staff to carry out data "
  "centre planning studies and rejected a moratorium.",

  "Ford has been critical of moratoriums throughout and presents these projects as investment. "
  "Reid's verdict on the province's answer to the municipalities is the sharpest thing anyone has "
  "said about it: the playbook is encouraging but lacks teeth. “There's no recourse,” he "
  "said.",

  "The provincial opposition wants the pause made general. Green Party leader Mike Schreiner has "
  "called for a province-wide halt until the environmental, energy and health effects have been "
  "studied. Polling by Leger puts the share of Canadians worried that data centres will push up "
  "their electricity bills at about 80 per cent."
 ],
 "sources": [
  "https://www.cp24.com/local/peel/2026/09/16/mississauga-council-set-to-vote-on-temporary-data-centre-moratorium/",
  "https://www.theglobeandmail.com/business/article-ontario-data-centre-framework-electricity-rates-environmental/",
  "https://www.millerthomson.com/en/insights/technology-ip-and-privacy/ontarios-data-centre-playbook-what-it-means-for-grid-access/",
  "https://ero.ontario.ca/notice/026-0853",
  "https://www.torys.com/our-latest-thinking/publications/2026/08/new-framework-for-data-centre-grid-connections",
  "https://thepointer.com/article/2026-08-12/green-party-calls-for-province-wide-halt-on-ai-data-centres-until-safeguards-are-in-place"
 ],
 "unconfirmed": "Removed in the raw-text recheck, because they are not in the articles when read as "
   "raw text rather than through a WebFetch summary: Mayor Carolyn Parrish's line 'who turns down "
   "Prologis? I haven't seen anyone yet', which is not in the CP24 report; Ford's 'We want to have "
   "sovereign data, we don't want to rely on President Trump getting his paws all over it', which is "
   "not in the Globe and Mail text; and a sentence saying Ford's summary was that the measures ensure "
   "no costs are passed to consumers, which was a paraphrase rather than his position. What the Globe "
   "actually reports is more specific and is now on the page: the government will encourage "
   "developers to build their own generation rather than rely on the grid. The Miller Thomson and "
   "Torys analyses supporting the two-part assessment and the 10,000 MW pipeline figure have not yet "
   "been re-read raw and are queued."
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
old={k:sum(len(x.split()) for x in e.get(k,{}).get('paragraphs',[])) for k in R}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
for k in R: print('  %-30s %4d -> %4d words'%(k,old[k],sum(len(x.split()) for x in R[k]['paragraphs'])))
