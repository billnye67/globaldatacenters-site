# -*- coding: utf-8 -*-
"""Fetch an article and print its raw text, so a fact can be read rather than summarised.

    python tools/read-article.py <url> [chars]

Why this exists. WebFetch does not hand you the article: it converts the page and then answers
your prompt against it with a small fast model. What comes back is that model's summary. Summaries
compress away exactly what a report turns on, and they sometimes invent detail that is not on the
page at all: an audit in this repo caught WebFetch producing acreages, prices per acre and a
decibel limit for a Rome News-Tribune story the article never contained, and separate sessions
have since found a fabricated dissenting supervisor, a wrong claimant name, an invented meeting
date and several quotations cut off before the clause that carried their meaning.

So: use WebSearch to find the url, use this to read it, and quote only what you can see in the
output below. WebFetch is for deciding whether a page is worth reading, never for sourcing a fact.

A browser user agent gets past most of the 403s WebFetch reports, including Data Center Dynamics
and most local papers.

Reading the header line. Every run prints how the text was extracted and how many characters came
out of how many bytes of html. A small extraction from a large page is an extraction failure, not
a paywall, and the warning says so: go and curl the url by hand rather than falling back on a
summariser. Only a small extraction from a small page is a real wall, and then the story is
usually somewhere else anyway, under the project name, the township, the city or the developer.
"""
import sys, re, subprocess, html

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/125.0 Safari/537.36')

FURNITURE = r'(?is)<(script|style|nav|header|footer|aside|form|noscript|figure)[^>]*>.*?</\1>'


def clean(x):
    x = re.sub(r'(?is)<br\s*/?>|</p>|</h[1-6]>|</li>', '\n', x)
    x = re.sub(r'(?s)<[^>]+>', ' ', x)
    x = html.unescape(x)
    x = re.sub(r'[ \t\xa0]+', ' ', x)
    return re.sub(r'\n\s*\n+', '\n\n', x).strip()


def rot47(s):
    """BLOX/TownNews papers (PinalCentral and many other local titles) serve the body of the
    article ROT47 encoded between kAm and k^Am markers. It looks like a paywall and is not."""
    return ''.join(chr(33 + ((ord(c) - 33 + 47) % 94)) if 33 <= ord(c) <= 126 else c for c in s)


def read(url, limit):
    result = subprocess.run(
        ['curl', '-sSL', '--compressed', '--max-time', '40', '-A', UA,
         '-H', 'Accept-Language: en-US,en;q=0.9', url],
        capture_output=True,
        creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0)
    )
    raw = result.stdout.decode('utf-8', 'replace')
    if result.returncode:
        # A failed transfer is not evidence that a source lacks a fact or is paywalled.
        # Do not print potentially sensitive proxy/config details from curl stderr.
        return ('[read-article: fetch failed, curl exit %d; no complete article read]\n'
                'Check network/sandbox access before classifying this source. '
                'A partial or empty response is not usable reporting evidence.' % result.returncode)
    if not raw.strip():
        return ('(empty response: cause not established; this does not prove a paywall '
                'or that the source has no useful information)\n\n'
                'Known cases, and what to do instead:\n'
                '  globenewswire.com  returns no HTTP response at all, even at 75 seconds. It is a\n'
                '    wire service, so the same release is on the issuing company\'s investor\n'
                '    relations page and usually on a second wire. Take it from there.\n'
                '  dailyherald.com    sits behind Incapsula bot protection. Do not try to defeat\n'
                '    it. It is an access control the publisher chose, and working around it is not\n'
                '    something this project does. Find the story in another outlet.\n\n'
                'In both cases the fact is not lost, only this route to it. Search the project\n'
                'name, the township, the city or the developer and read a different report.')

    # BLOX/TownNews and Lee Enterprises titles serve the story body ROT47 encoded between kAm
    # and k^Am markers. Entities must be unescaped BEFORE decoding: ROT47 of the letter m is '>',
    # which the page ships as &gt;, so decoding first turns every m in the article into garbage.
    # That is what made nwitimes.com look like an unreadable scramble rather than a template.
    if 'kAm' in raw and 'k^Am' in raw:
        raw = re.sub(r'kAm.*?k\^Am',
                     lambda m: rot47(html.unescape(m.group(0))), raw, flags=re.S)

    body = re.sub(FURNITURE, ' ', raw)

    # Extraction. The obvious approach, grabbing the div carrying an article-body class, is wrong:
    # the regex for it is non-greedy and stops at the FIRST </div>, so on any site that nests divs
    # inside its story body it truncates to the lede. That is what made this tool report wtop.com
    # as paywalled when a bare curl returns the whole article. Collecting every <p> sidesteps
    # nesting entirely, so that is the primary path; the <article> element and a full strip of the
    # document are fallbacks, and whichever yields the most text wins.
    paras = re.findall(r'(?is)<p[^>]*>(.*?)</p>', body)
    by_para = clean('\n\n'.join(
        p for p in paras if len(re.sub(r'(?s)<[^>]+>', '', p).strip()) > 40))

    arts = re.findall(r'(?is)<article[^>]*>(.*?)</article>', body)
    by_article = clean(max(arts, key=len)) if arts else ''

    whole = clean(body)

    text, how = max(
        ((by_para, 'paragraphs'), (by_article, 'article element'), (whole, 'whole document')),
        key=lambda pair: len(pair[0]))

    head = '[read-article: via %s, %d chars from %d bytes of html]' % (how, len(text), len(raw))

    if len(text) < 400:
        if len(raw) > 40000:
            head += ('\n--- WARNING: only %d characters extracted from %d bytes. The page is NOT '
                     'short, so this is an EXTRACTION FAILURE, not a paywall. Curl this url by '
                     'hand before concluding it cannot be read. Do not fall back to WebFetch.'
                     % (len(text), len(raw)))
        else:
            head += ('\n--- WARNING: under 400 characters and the page itself is small. This is a '
                     'paywall or a Javascript challenge. Do not source a fact from it; find the '
                     'story elsewhere under the project, township, city or developer name.')

    # Truncation used to be silent at 6,000 characters, about a thousand words. Long
    # investigative pieces ran past it, a session would not find a quote in what it was shown,
    # and would conclude the article did not contain it. That is the same failure as reading a
    # summary. The default is now the whole article, and any cut says so loudly.
    if limit and len(text) > limit:
        return (head + '\n\n' + text[:limit]
                + '\n\n--- TRUNCATED: %d of %d characters shown, %d CUT. You have NOT'
                  ' read the whole article. Re-run with a larger limit before concluding'
                  ' a fact or a quote is absent:  python tools/read-article.py <url> 200000'
                  % (limit, len(text), len(text) - limit))
    return head + '\n\n' + text


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('usage: python tools/read-article.py <url> [chars]')
    # No limit by default: a partly read article is how facts go missing.
    out = read(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 0)
    try:
        print(out)
    except UnicodeEncodeError:
        print(out.encode('ascii', 'replace').decode('ascii'))
