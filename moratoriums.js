/* ============================================================
   floridadatacenters.org — moratorium data
   Keyed by FIPS to match RISK_DATA in index.html.

   status:  'ban'      permanent prohibition, no expiration
            'active'   temporary pause currently running
            'pending'  board has directed staff / not yet in effect
            'none'     no action on record

   confirmed: true  = adoption date verified against a specific
                      reported final vote. Countdown is shown.
              false = date is approximate. NO countdown is shown.
   ============================================================ */

const MORATORIUM_UPDATED = "2026-08-14";

const MORATORIUMS = {
  /* ---------- permanent bans ---------- */
  "12063": { name:"Jackson",    status:"ban", adopted:"2026-06-23", confirmed:true,
    note:"Adopted unanimously at the third public hearing. Prohibits data centers and associated facilities in unincorporated Jackson County, effective immediately on filing with the Department of State. Started as a one-year moratorium and was amended into a full ban. One amendment closed the door on projects with data center characteristics filed under another name.",
    source:"https://www.wctv.tv/2026/06/23/jackson-county-adopts-ordinance-banning-data-centers/" },

  "12129": { name:"Wakulla",    status:"ban", adopted:"2026-06-15", confirmed:true,
    note:"Unanimous permanent ban, passed over the board attorney's warning that an indefinite prohibition carries more legal exposure than a temporary pause.",
    source:"https://floridapolitics.com/archives/802320-wakulla-becomes-latest-florida-county-to-restrict-data-center-construction/" },

  "12131": { name:"Walton",     status:"ban", adopted:"2026-06-09", confirmed:true,
    note:"Emergency ordinance prohibiting data centers outright, plus large load centers drawing 50 MW or more. Effective immediately.",
    source:"https://www.fox10tv.com/2026/06/10/walton-county-prohibits-data-centers-new-ordinance/" },

  /* ---------- active pauses ---------- */
  "12005": { name:"Bay",        status:"active", adopted:"2026-07-07", months:6, confirmed:true,
    note:"Six months, unincorporated Bay County, adopted after a packed hearing. The draft tracked SB 484's 50 MW definition of a large-scale data center; commissioners lowered the trigger to 5 MW, so it reaches far smaller facilities than any other Florida pause. Shortest term in the state, and the board can extend it another six months.",
    source:"https://www.wjhg.com/2026/07/08/bay-county-approves-six-month-moratorium-ai-data-centers/" },

  "12017": { name:"Citrus",     status:"active", adopted:"2026-05-27", months:12, confirmed:false,
    note:"Twelve-month pause on permits, development orders and rezonings. Deltona's Holder Industrial Park application predated the moratorium and was exempt — which is why it had to be withdrawn to escape a vote.",
    source:"https://www.chronicleonline.com/news/local/county-backs-pause-on-data-centers-temporary-moratorium-gives-county-time-to-gather-information/article_98795fb9-6580-5f53-97a3-10a3b68b6711.html" },

  "12019": { name:"Clay",       status:"active", adopted:"2026-06-23", months:12, confirmed:true,
    note:"One-year pause on data center permitting, adopted after a second public hearing.",
    source:"https://www.firstcoastnews.com/article/news/local/clay-county-approves-1-year-moratorium-data-center-development/77-b4f84bb0-cf9e-41ab-bfc1-7770c9dd6c12" },

  "12027": { name:"DeSoto",     status:"active", adopted:"2026-07-07", months:12, confirmed:false,
    note:"Commissioners directed the county attorney on June 23 to draft a one-year bar on new applications. It does not reach the pending 800-acre rezoning already in the pipeline. The planning commission had recommended two years.",
    source:"https://suncoastsearchlight.org/sarasota-county-blocks-hyperscale-data-centers/" },

  "12035": { name:"Flagler",    status:"active", adopted:"2026-08-03", months:12, confirmed:true,
    note:"Unanimous on second reading. Covers unincorporated Flagler while staff write zoning and land development regulations.",
    source:"https://www.observerlocalnews.com/news/2026/aug/03/flagler-county-approves-one-year-data-center-moratorium/" },

  "12073": { name:"Leon",       status:"active", adopted:"2026-07-14", months:18, confirmed:true,
    note:"Unanimous. Started as a one-year pause and was extended to eighteen months on Commissioner Bill Proctor's suggestion so it runs through all of 2027 — the longest county pause in the state. Covers large-scale data centers and the power generation projects that would serve them. The Tallahassee City Commission voted down a similar measure 3–2, citing its existing land code.",
    source:"https://www.wctv.tv/2026/07/15/leon-county-commissioners-approved-18-month-data-center-moratorium/" },

  "12037": { name:"Franklin",   status:"active", adopted:"2026-06-03", months:12, confirmed:true,
    note:"Unanimous one-year pause. The county planner had recommended going further — either a countywide ban or a five-year moratorium — before the county attorney steered the board to twelve months.",
    source:"https://www.wctv.tv/2026/06/03/franklin-county-commissioners-vote-ai-data-centers/" },

  "12053": { name:"Hernando",   status:"active", adopted:"2026-06-23", months:12, confirmed:true,
    note:"Applies only to applications received after the effective date. Does not cover server rooms incidental to a site's primary use. The county attorney warned that anything longer than a year risks a property-rights claim.",
    source:"https://baynews9.com/fl/tampa/news/2026/06/22/homeowners-share-concerns--opinions-on-data-centers-as-hernando-county-commissioners-to-discuss-potential-moratorium" },

  "12069": { name:"Lake",       status:"active", adopted:"2026-07-14", months:12, confirmed:false,
    note:"The June 23 vote directed staff to draft the ordinance; final adoption was set for roughly July 14. Sponsor Anthony Sabatini framed the pause as a bridge to Oct. 1, 2027, when SB 180 expires and the county regains room to write permanent rules. No data centers and no pending applications in the county.",
    source:"https://www.growthspotter.com/2026/07/14/lake-county-minneola-advance-policies-for-moratorium-on-new-data-centers/" },

  "12089": { name:"Nassau",     status:"active", adopted:"2026-06-08", months:12, confirmed:true,
    ordinance:"2026-044",
    note:"Passed before a single application had been filed. Covers permits, development orders, rezonings and site plans for data centers, data processing, and crypto mining.",
    source:"https://www.nassaucountyfl.com/1528/Data-Centers" },

  "12101": { name:"Pasco",      status:"active", adopted:"2026-07-14", months:12, confirmed:true,
    note:"Covers unincorporated Pasco. The county attorney told commissioners a permanent prohibition would amount to a taking and invite suit.",
    source:"https://www.wusf.org/politics-issues/2026-07-15/pasco-county-one-year-moratorium-large-data-centers" },

  "12113": { name:"Santa Rosa", status:"active", adopted:"2026-07-23", months:12, confirmed:true,
    note:"Twelve-month pause while the county weighs longer-term regulations.",
    source:"https://livinginpalmerranch.com/ai-data-centers-sarasota/" },

  "12115": { name:"Sarasota",   status:"active", adopted:"2026-07-08", months:12, confirmed:true,
    note:"Freeze on acceptance, review and approval of hyperscale applications — 50 MW and up. Passed 5–0 with nothing on file but a single inquiry.",
    source:"https://www.businessobserverfl.com/news/2026/jul/09/sarasota-county-data-center-moratorium/" },

  /* ---------- pending ---------- */
  "12057": { name:"Hillsborough", status:"pending", adopted:"2026-08-05", confirmed:true,
    note:"Commissioners directed the county attorney to draft a moratorium and to explore barring data centers from using county drinking water for cooling. It cannot take effect until SB 180 expires Oct. 1, 2027 or is struck down — the statute blocks new moratoriums in counties hit by Debby, Helene and Milton.",
    source:"https://floridapolitics.com/archives/811637-hillsborough-county-moves-toward-moratorium-on-ai-data-centers/" },

  "12081": { name:"Manatee",    status:"pending", adopted:"2026-07-28", confirmed:true,
    note:"Unanimous direction to staff. Draft goes to the planning commission in September, then back to the board Sept. 22 and Oct. 6.",
    source:"https://www.businessobserverfl.com/news/2026/jul/29/manatee-county-data-center-moratorium/" },

  "12099": { name:"Palm Beach", status:"pending", adopted:"2026-08-06", confirmed:true,
    note:"The zoning commission unanimously recommended a one-year pause, while warning that a 50 MW floor lets a developer size a project just underneath it. Still needs a vote by the county commission.",
    source:"https://cbs12.com/news/local/palm-beach-county-zoning-leaders-back-data-center-moratorium-weighs-tougher-regulations-pause-application-aug-6-2026" },

  "12033": { name:"Escambia",   status:"pending", adopted:"2026-06-16", confirmed:false,
    note:"Pensacola councilman Charles Bare said he is drafting an ordinance mirroring Walton's ban. The county commission chair says a countywide ban has not been discussed.",
    source:"https://weartv.com/news/local/walton-county-bans-data-centers-pensacola-city-councilman-hopes-to-mirror-ordinance" }
};

/* ---------- city-level actions, shown separately ---------- */
const CITY_MORATORIUMS = [
  { city:"Lakeland", county:"Polk", status:"active", adopted:"2026-08-03", months:12, confirmed:true,
    note:"Passed 4–3, effective immediately, and written to catch Project Swan. Covers anything projected at 50 MW or more — including projects outside city limits that want Lakeland Electric service. Commissioners may lift it early once permanent rules are written.",
    source:"https://www.lkldnow.com/lakeland-approves-one-year-moratorium-on-data-centers/" },

  { city:"North Port", county:"Sarasota", status:"active", adopted:"2026-07-22", months:18, confirmed:false,
    note:"Eighteen months — six longer than Sarasota County's — approved after the city received an actual data center application. Paired with workshops, a community engagement series, staff definitions of 'hyperscale,' and a noise ordinance rewrite covering data center frequencies.",
    source:"https://www.yoursun.com/northport/news/north-port-receives-data-center-application-takes-steps-toward-18-month-moratorium/article_af81f423-7d14-4adb-b4f0-f06ac1aa89a9.html" },

  { city:"Minneola", county:"Lake", status:"pending", adopted:"2026-07-14", confirmed:false,
    note:"City council advanced a one-year moratorium with a final vote to follow. The city attorney said the language was lifted from ordinances already adopted elsewhere in Florida.",
    source:"https://www.growthspotter.com/2026/07/14/lake-county-minneola-advance-policies-for-moratorium-on-new-data-centers/" },

  { city:"Zephyrhills", county:"Pasco", status:"active", adopted:"2026-06-22", months:12, confirmed:true,
    note:"Passed 4–0 and written retroactively, so it reaches any and all applications — a more aggressive posture than Hernando's, which only covers filings after the effective date. The city had no applications and no known projects when it acted. The widely-cited June 8 date was the first reading; the second reading and final 4–0 vote were June 22, with one member absent.",
    source:"https://www.wusf.org/politics-issues/2026-06-24/zephyrhills-city-council-one-year-moratorium-data-centers" }
];
