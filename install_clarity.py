import os
TAG = "whyg2fbg7c"
BLOCK = f'''    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){{c[a]=c[a]||function(){{(c[a].q=c[a].q||[]).push(arguments)}};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);}})(window, document, "clarity", "script", "{TAG}");
    </script>
</head>'''
u=s=0
for root, dirs, files in os.walk("."):
    if ".git" in root: continue
    for f in files:
        if not f.endswith(".html"): continue
        p = os.path.join(root, f)
        c = open(p, "r", encoding="utf-8").read()
        if "clarity.ms" in c: s+=1; continue
        if "</head>" not in c: continue
        open(p, "w", encoding="utf-8").write(c.replace("</head>", BLOCK, 1))
        u+=1
print(f"Updated: {u}, Skipped: {s}")
