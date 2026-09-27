import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path


RSS_URL = 'https://anchor.fm/s/dae0736c/podcast/rss'
OUT = Path('episodes.json')


# --------------------------------------------------
# DESCARGAR RSS
# --------------------------------------------------

req = urllib.request.Request(
    RSS_URL,
    headers={
        'User-Agent': 'Mozilla/5.0 (compatible; HastaElRaboWeb/1.0)'
    }
)

with urllib.request.urlopen(req, timeout=60) as response:
    data = response.read()


# --------------------------------------------------
# LEER XML
# --------------------------------------------------

root = ET.fromstring(data)

channel = root.find('channel')

if channel is None:
    raise RuntimeError('No se encontró el canal RSS')


items = channel.findall('item')


print(f'Episodios encontrados en el RSS: {len(items)}')


# --------------------------------------------------
# FUNCIONES AUXILIARES
# --------------------------------------------------

def text(el, tag, default=''):

    child = el.find(tag)

    if child is not None and child.text:
        return child.text.strip()

    return default


def strip_html(value):

    value = re.sub(
        r'<br\s*/?>',
        '\n',
        value,
        flags=re.I
    )

    value = re.sub(
        r'<[^>]+>',
        '',
        value
    )

    return unescape(value).strip()


def iso_date(value):

    if not value:
        return ''

    try:

        return parsedate_to_datetime
