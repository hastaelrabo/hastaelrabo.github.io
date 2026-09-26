import json, re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path

RSS_URL = 'https://anchor.fm/s/dae0736c/podcast/rss'
OUT = Path('episodes.json')
LIMIT = 12

req = urllib.request.Request(RSS_URL, headers={'User-Agent': 'HastaElRaboWeb/1.0'})
with urllib.request.urlopen(req, timeout=30) as response:
    data = response.read()

root = ET.fromstring(data)
channel = root.find('channel')
if channel is None:
    raise RuntimeError('No se encontró el canal RSS')

items = channel.findall('item')
episodes = []

def text(el, tag, default=''):
    child = el.find(tag)
    return (child.text or '').strip() if child is not None and child.text else default

def strip_html(value):
    value = re.sub(r'<br\s*/?>', '\n', value, flags=re.I)
    value = re.sub(r'<[^>]+>', '', value)
    return unescape(value).strip()

def iso_date(value):
    if not value:
        return ''
    try:
        return parsedate_to_datetime(value).astimezone(timezone.utc).isoformat()
    except Exception:
        return value

for item in items[:LIMIT]:
    enclosure = item.find('enclosure')
    audio = enclosure.attrib.get('url', '') if enclosure is not None else ''
    if not audio:
        continue
    title = text(item, 'title', 'Episodio')
    description = text(item, 'description')
    duration = text(item, '{http://www.itunes.com/dtds/podcast-1.0.dtd}duration')
    image = item.find('{http://www.itunes.com/dtds/podcast-1.0.dtd}image')
    image_url = image.attrib.get('href', '') if image is not None else ''
    if not image_url:
        image_url = image.attrib.get('url', '') if image is not None else ''
    link = text(item, 'link')
    guid = text(item, 'guid', audio)
    episodes.append({
        'title': title,
        'description': strip_html(description),
        'date': iso_date(text(item, 'pubDate')),
        'duration': duration,
        'audio': audio,
        'image': image_url,
        'link': link,
        'guid': guid,
    })

if not episodes:
    raise RuntimeError('El RSS no contiene episodios con audio')

OUT.write_text(json.dumps({'updatedAt': datetime.now(timezone.utc).isoformat(), 'episodes': episodes}, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Generados {len(episodes)} episodios en {OUT}')
