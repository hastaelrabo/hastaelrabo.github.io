import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path

RSS_URL = "https://anchor.fm/s/dae0736c/podcast/rss"
OUT = Path("episodes.json")


def get_text(element, tag, default=""):
    child = element.find(tag)
    if child is not None and child.text:
        return child.text.strip()
    return default


def clean_html(value):
    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
    value = re.sub(r"<[^>]+>", "", value)
    return unescape(value).strip()


def convert_date(value):
    if not value:
        return ""

    try:
        date = parsedate_to_datetime(value)
        return date.astimezone(timezone.utc).isoformat()
    except Exception:
        return value


print("Descargando RSS...")

request = urllib.request.Request(
    RSS_URL,
    headers={
        "User-Agent": "Mozilla/5.0 HastaElRaboWeb/1.0"
    }
)

with urllib.request.urlopen(request, timeout=60) as response:
    data = response.read()


print("RSS descargado correctamente.")


root = ET.fromstring(data)
channel = root.find("channel")

if channel is None:
    raise RuntimeError("No se encontró el canal RSS.")


items = channel.findall("item")

print(f"Episodios encontrados en el RSS: {len(items)}")


episodes = []

for item in items:

    enclosure = item.find("enclosure")

    if enclosure is None:
        continue

    audio = enclosure.attrib.get("url", "")

    if not audio:
        continue

    title = get_text(item, "title", "Episodio")

    description = get_text(item, "description")

    date = convert_date(
        get_text(item, "pubDate")
    )

    duration = get_text(
        item,
        "{http://www.itunes.com/dtds/podcast-1.0.dtd}duration"
    )

    link = get_text(item, "link")

    guid = get_text(
        item,
        "guid",
        audio
    )

    image_url = ""

    image = item.find(
        "{http://www.itunes.com/dtds/podcast-1.0.dtd}image"
    )

    if image is not None:
        image_url = image.attrib.get("href", "")

        if not image_url:
            image_url = image.attrib.get("url", "")

    episodes.append({
        "title": title,
        "description": clean_html(description),
        "date": date,
        "duration": duration,
        "audio": audio,
        "image": image_url,
        "link": link,
        "guid": guid
    })


if not episodes:
    raise RuntimeError(
        "El RSS no contiene episodios con audio."
    )


episodes.sort(
    key=lambda episode: episode.get("date", ""),
    reverse=True
)


# Eliminar duplicados

unique = []
seen = set()

for episode in episodes:

    identifier = (
        episode.get("guid")
        or episode.get("audio")
        or episode.get("title")
    )

    if identifier in seen:
        continue

    seen.add(identifier)
    unique.append(episode)


episodes = unique


output = {
    "updatedAt": datetime.now(
        timezone.utc
    ).isoformat(),

    "episodes": episodes
}


OUT.write_text(
    json.dumps(
        output,
        ensure_ascii=False,
        indent=2
    ),
    encoding="utf-8"
)


print(
    f"Generados {len(episodes)} episodios en episodes.json"
)

print(
    f"Más reciente: {episodes[0]['title']}"
)

print(
    f"Más antiguo: {episodes[-1]['title']}"
)
