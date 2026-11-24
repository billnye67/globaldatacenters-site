# -*- coding: utf-8 -*-
"""Raw-text recheck: King George County VA, Chester County PA.

Both were written from WebFetch output, which is a small model's summary, not the article. Read
again as raw text with tools/read-article.py.

  King George   3 articles re-read raw (Fredericksburg Free Press, DCD). Real errors found.
  Chester       Spotlight PA re-read raw. Its claims held; more material recovered.

King George corrections:
  - "Supervisor William Davis told residents they needed to be more civically engaged and
    suggested they sign up for county alerts" compressed two things and misplaced one. Davis did
    urge civic involvement, but it was Amy Southall, the county's community engagement director,
    whom he asked to explain the alerts.
  - The August 19 date, the "rezoning, comprehensive plan change and special exception" wording,
    the 485-497 acre range, the 200,000-gallon water tower proffer and the "no county well water
    for cooling" wording all came from citizenportal.ai, an aggregator now ruled out as a source.
    All removed. The Free Press gives the water position directly and differently.
  - The Amazon project's "$6 billion", "December 2023" and "tax abatement" were preview-only and
    are gone. DCD gives the campus as 869 acres at the old Birchwood power plant.
  - Missed entirely: Supervisor Ken Stroud's line, which is the headline of the piece.
"""
import io, json, os

R = {

"/data-centers/united-states/virginia/king-george-county/": {
 "paragraphs": [
  "“It's painful we're getting this months late,” said Ken Stroud, who represents the "
  "James Madison District on the King George County Board of Supervisors. “This should've "
  "happened last year.” He was agreeing with the residents, not answering them.",

  "The public comment period on the evening of June 3, 2026 had turned into an unscheduled town "
  "hall. Supervisors in King George do not normally reply to speakers; that night they made an "
  "exception, because people had come to object to three data center projects the county had "
  "already approved.",

  "Residents living on St. Pauls Road said the 500-acre Dahlgren West campus would upend their "
  "lives. It had been approved unanimously the previous August. “I'm, like, freaking up,” "
  "said Briana Morgan, who had moved to the county on October 1, 2025. “We bought our forever "
  "home. I've got little kids and I don't want a data center in my backyard. I found this out on "
  "Sunday and was spinning. What are we going to do with the animals? Where are they going to go? "
  "The forest?” She asked whether enough pushback could make the board reconsider, because "
  "this is bull. Officials told her residents had had their say, at the planning commission and "
  "board hearings the year before. Joshua Mills put it shorter: “I'm terrified.”",

  "County Administrator Matthew Smolnik explained why it was finished. “The Code of Virginia "
  "dictates the governing body vote on special exceptions, rezonings, anything that requires "
  "legislative review,” he said. “The board of supervisors, the five elected officials, "
  "are elected by the public so each of you have representation up here on the board of "
  "supervisors. So, the legislative process is already over. Everything, from here on out, is "
  "administrative.”",

  "The supervisors did answer the substance. Dahlgren West will use potable water for its "
  "restrooms and a possible kitchen, but the county will not permit potable water for cooling the "
  "equipment, and the developers are looking at treated wastewater for that instead. Northern Neck "
  "Electric Cooperative is supplying the power and requires the developers to pay the entire cost "
  "of connecting.",

  "Residents complained that nobody had knocked on their door. The developer, Potomac Development "
  "Group, had held the first of several public outreach events, an open house at the University of "
  "Mary Washington's Dahlgren campus, in April 2024, and later opened an office off U.S. 301.",

  "Dahlgren District Supervisor William Davis told them that when the county issues the first "
  "permit for the project, the developers must pay $5 million that can go to King George County "
  "Public Schools and to the county's deteriorating buildings. He then pressed residents to get "
  "involved before decisions are taken, suggesting they start a podcast about county news and "
  "invite developers onto it. “We have to take a little bit of initiative as adults to go, "
  "what can I do to make sure I know the things that I need to know?” Davis said. “Not "
  "that someone always gives it to me because we put it out there, but you also have to take "
  "responsibility.” He asked Amy Southall, the county's community engagement director, to "
  "explain how to sign up for alerts on public hearings. One man told Davis he has a job and "
  "cannot follow board meetings: “We pay our taxes, so you can have a job.”",

  "Another resident asked everyone in the room opposed to data centers to raise a hand, as an "
  "informal poll to show the board what the public thought. Many did. It changed nothing, which "
  "is what prompted Stroud's remark.",

  "Dahlgren West itself is the largest thing the county has entertained. The Chantilly firm "
  "Potomac Development Group proposed a 500-acre campus near the Navy base at Dahlgren, off James "
  "Madison Parkway, potentially 9 million square feet across ten to fifteen buildings, working "
  "with the family of the late Ed Veazey to get the zoning and prepare the site before handing it "
  "to one or more end users, who have never been named. The land sits off U.S. 301 in the Cleydael "
  "settlement area and had been designated a technology zone by the board, which carries "
  "incentives. “I want to stress, it's early in the process,” principal Nick Over said "
  "when the plan surfaced in April 2024. “We really want to listen to the community and take "
  "that feedback and perfect our application before we bring it to the county.”",

  "The second project, Green Energy Ventures' 300-acre, thirteen-building campus at the northwest "
  "corner of Kings Highway and Bloomsbury Road, was approved 3-2 in February 2026.",

  "The third is the one in court. Amazon Data Services proposed an 869-acre campus at the old "
  "Birchwood power plant on State Route 3 near Sealston, approved by a previous board in 2023 and "
  "still the subject of a pending lawsuit against the county. The current board, excluding James "
  "Monroe District representative Bryan Metts, who was elected the previous November, voted in "
  "early 2024 to back out of the performance agreement. The board went on to declare the county at "
  "war with Amazon Data Services and voted unanimously to ask the planning commission to "
  "reconsider the rezoning and turn the land from industrial back to agricultural.",

  "None of this was required of King George by anyone above it. Virginia has no statewide data "
  "center regulation, and the county only added data centers to its zoning ordinance in 2019."
 ],
 "sources": [
  "https://www.fredericksburgfreepress.com/2026/06/03/this-shouldve-happened-last-year-king-george-residents-protest-already-approved-data-centers/",
  "https://www.datacenterdynamics.com/en/news/9-million-sq-ft-data-center-campus-proposed-in-virginias-king-george-county/",
  "https://www.fredericksburgfreepress.com/2026/02/19/king-george-board-of-supervisors-approves-300-acre-data-center-campus/",
  "https://virginiamercury.com/2025/06/20/virginia-doesnt-have-statewide-data-center-regulations-localities-are-making-their-own-rules-instead/"
 ],
 "unconfirmed": "Removed in the raw-text recheck because they came from citizenportal.ai, an "
   "aggregator that is no longer an acceptable source here, or from a WebFetch summary: an August 19 "
   "date for the Dahlgren West approval and the wording that the board approved a rezoning, a "
   "comprehensive plan amendment and a special exception together; an acreage range of 485 to 497; a "
   "proffer of a 200,000-gallon water tower and a commitment not to use county well water for any "
   "cooling purpose; and for the Amazon project, a $6 billion value, a December 2023 approval date "
   "and a tax abatement. The Free Press gives the water position directly and it is not the same "
   "sentence. King George's 2023 noise ordinance rewrite, the addition of dBC as a measure and the "
   "75-foot setback for ground-mounted mechanical equipment were read through WebFetch from county "
   "PDFs and have been dropped pending a raw read of those documents."
},

"/data-centers/united-states/pennsylvania/chester-county/": {
 "paragraphs": [
  "Steve Hacker's well ran dry in October 2024, the first time since he moved to Chester County in "
  "1983. He went 39 days without running water, showering at the Colonial Theatre where he works "
  "part-time in retirement, or at the local YMCA. It was the drought that did it, he says, but he "
  "reads it as a sign of what is coming, because his township of East Vincent is being asked to "
  "host a data center campus. “They want to pull millions of gallons of water out. I don't "
  "see how that can work,” Hacker told Spotlight PA. “Who is responsible if all the "
  "wells in my town dry out? Who's going to compensate us?”",

  "What he wants is delay. “They want to go full speed ahead. But I want them to slow "
  "down,” he said. “That's the number one thing I want from the state government: I want "
  "to slow down. I would want a moratorium on building these things.” Polling puts 42 per "
  "cent of Pennsylvanians against having one built in or near their own community.",

  "Chester County's own state senator has taken that position into Harrisburg. Katie Muth, whose "
  "district contains the campus Hacker is worried about, says the bills now moving to control what "
  "ratepayers are charged are the bare minimum, and that nobody is paying attention to emergency "
  "planning or to the long-term health of the people living nearby. If a battery fire broke out on "
  "the planned campus in her district, she wants the developer to have a plan for stopping it "
  "spreading to the nuclear power plant nearby. She intends to introduce a bill creating a two-year "
  "moratorium, to give local officials time to work out what they are being asked to approve. "
  "“Who has control about the information of these projects is really key,” Muth said. "
  "“These decisions are being made in vacuums.”",

  "She is arguing against the grain of her own legislature. “I've had people tell me, well, "
  "just let's bar them, we'll prohibit them,” State Senator Gene Yaw, a Lycoming County "
  "Republican, told Spotlight PA. “Then let's go to the library and burn all the books too "
  "while we're at it.”",

  "And against the governor. Josh Shapiro has backed the industry and celebrated a planned $20 "
  "billion Amazon Web Services investment in two data centers in eastern Pennsylvania. “I "
  "announced the largest private sector investment in the history of the Commonwealth of "
  "Pennsylvania just a few months ago, right here in northeastern Pennsylvania,” Shapiro said "
  "last October. “A deal with AWS, Amazon, that's going to create 10,000 construction jobs, "
  "and it's also, at the same time going to create over 1,000 permanent jobs.” Asked about "
  "residents' concerns, he said that with any of these deals you have got to work with the local "
  "community.",

  "Hacker's answer to that is the sentence the whole county argument reduces to. “To let "
  "industry do whatever they want and deal with the consequences later, we should know "
  "better,” he said. “I absolutely want our state legislators as a whole, right up to "
  "Shapiro, to listen to the people.”",

  "Amazon Web Services and Blackstone have between them announced tens of billions of dollars of "
  "private investment in Pennsylvania data centers. Supporters in the legislature point to "
  "thousands of temporary construction jobs and hundreds of permanent ones, to attracting workers "
  "to the state, and to competing with China. Even the sceptics mostly expect the number of "
  "facilities to rise, and argue the legislature's job is to create regulators or incentives that "
  "make developers take environmental safety seriously rather than to stop them."
 ],
 "sources": [
  "https://www.spotlightpa.org/news/2026/01/data-centers-pennsylvania-debate-legislature-environment-environment/",
  "https://www.chescoplanning.org/UandI/DataCenters/pdf/DataCenterOrdinanceGuide.pdf",
  "https://www.suburbanrealtorsalliance.com/news/2026/07/24/chester-county/west-chester-council-approves-data-center-zoning-ordinance/",
  "https://www.cityandstatepa.com/policy/2026/04/power-plays-battle-over-data-centers-pa/412554/"
 ],
 "unconfirmed": "This page has been cut back to what a raw read of Spotlight PA supports. Everything "
   "previously on it about East Vincent's unanimous refusal of the 1.9m sq ft Pennhurst Holdings "
   "proposal, North Coventry's 3-2 rejection of the Envision Land Use scheme before it was filed, the "
   "Tredyffrin, West Bradford, Uwchlan and West Chester ordinances, and the East Whiteland ballot "
   "question on expanding the board of supervisors, came from WebFetch summaries of the Inquirer and "
   "thecooldown and has not yet been re-read as raw text. It is very likely correct and it is queued "
   "for the next pass; it is off the page until the articles are read rather than summarised. The "
   "PECO 67-megawatt line from East Coventry through Linfield is in the same position."
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
old={k:sum(len(x.split()) for x in e.get(k,{}).get('paragraphs',[])) for k in R}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-52s %4d -> %4d words, %d paras, %d sources'%(k,old[k],sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs']),len(R[k]['sources'])))
