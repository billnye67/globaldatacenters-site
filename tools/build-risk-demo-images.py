"""Fetch fixed satellite views once; visitors receive local JPEGs, not map tiles."""
import concurrent.futures
import io
import json
import math
from pathlib import Path
import urllib.parse
import urllib.request
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'img' / 'risk-demo'
SCENES = json.loads((ROOT / 'data' / 'risk-demo-scenes.json').read_text())
SERVICE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export'

def build(job):
    scene, kilometres = job
    stem = scene['id'] + '-' + str(kilometres) + 'km'
    target = OUT / (stem + '.jpg')
    lat, lng = scene['loc']['lat'], scene['loc']['lng']
    x = 6378137 * math.radians(lng)
    y = 6378137 * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
    half = kilometres * 500 / math.cos(math.radians(lat))
    size = 4096 if kilometres == 3 else 2048
    args = dict(bbox=','.join(str(v) for v in [x-half,y-half,x+half,y+half]),
                bboxSR=3857,imageSR=3857,size=f'{size},{size}',format='jpg',f='image')
    url = SERVICE + '?' + urllib.parse.urlencode(args)
    if not target.exists():
        request = urllib.request.Request(url, headers={'User-Agent':'GlobalDataCenters/1.0'})
        with urllib.request.urlopen(request, timeout=120) as response:
            raw = response.read()
        image = Image.open(io.BytesIO(raw)).convert('RGB')
        if image.size != (size,size):
            raise RuntimeError(f'Unexpected image size for {scene["id"]}: {image.size}')
        image.save(target, quality=88, optimize=True)
    with Image.open(target) as image:
        phone_size = 1536 if kilometres == 3 else 1024
        image.resize((phone_size,phone_size),Image.Resampling.LANCZOS).save(OUT/(stem+'-phone.jpg'),quality=88,optimize=True)
    print(stem, target.stat().st_size, flush=True)
    return {'id':scene['id'],'source':url,'groundWidthMetres':kilometres*1000,'width':size,'height':size,
            'attribution':'Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community',
            'bytes':target.stat().st_size}

OUT.mkdir(parents=True,exist_ok=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    results = list(pool.map(build, [(scene,km) for scene in SCENES for km in [4096,512,64,8,3]]))
(OUT/'sources.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps(results,indent=2))
