#!/usr/bin/env python3
"""
Download and process oaza (大字・町) boundary GeoJSON from frogcat/japan-small-area.
Outputs per-municipality GeoJSON files to public/data/oaza/.
Also generates meta.json with oaza count per municipality.

Data source: https://frogcat.github.io/japan-small-area/
"""
import json
import urllib.request
import os
import sys
import time

BASE_URL = "https://frogcat.github.io/japan-small-area"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data", "oaza")

DECIMALS = 4  # Coordinate precision (~11m accuracy)


def quantize_coords(coords, decimals=DECIMALS):
    """Recursively round coordinates to reduce file size."""
    if isinstance(coords[0], (int, float)):
        return [round(c, decimals) for c in coords]
    return [quantize_coords(c, decimals) for c in coords]


def extract_muni_code(parent_str):
    """Extract 5-digit municipality code from parent property.

    Example: "http://data.e-stat.go.jp/lod/sac/C36208-20060301" -> "36208"
    Also handles: "C36208-20060301" -> "36208"
    """
    if not parent_str:
        return None
    # Extract the C{code}-{date} part from URL or direct value
    segment = parent_str.rsplit("/", 1)[-1]  # "C36208-20060301"
    if not segment.startswith("C"):
        return None
    code_part = segment.split("-")[0]  # "C36208"
    return code_part[1:]  # "36208"


def process_prefecture(pref_code):
    """Download and process a single prefecture's oaza GeoJSON.

    Returns dict of { muni_code: oaza_count } for this prefecture.
    """
    url = f"{BASE_URL}/{pref_code:02d}.json"
    print(f"  Downloading {pref_code:02d}...", end=" ", flush=True)

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        print(f"RETRY after error: {e}")
        time.sleep(3)
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read())

    # Group features by municipality code
    # muni_code -> { oaza_id -> { name, polygons[] } }
    muni_map = {}

    for feat in data.get("features", []):
        props = feat.get("properties", {})
        parent = props.get("parent", "")
        muni_code = extract_muni_code(parent)
        if not muni_code:
            continue

        # id is at feature level (URL), extract short code from last segment
        raw_id = feat.get("id", "")
        oaza_id = raw_id.rsplit("/", 1)[-1] if raw_id else ""
        oaza_name = props.get("label", "")
        if not oaza_name:
            continue

        if muni_code not in muni_map:
            muni_map[muni_code] = {}

        oaza_map = muni_map[muni_code]
        if oaza_id not in oaza_map:
            oaza_map[oaza_id] = {
                "name": oaza_name,
                "code": oaza_id,
                "polygons": [],
            }

        geom = feat.get("geometry", {})
        geom_type = geom.get("type", "")
        coords = geom.get("coordinates", [])

        if geom_type == "Polygon":
            oaza_map[oaza_id]["polygons"].append(quantize_coords(coords))
        elif geom_type == "MultiPolygon":
            for poly in coords:
                oaza_map[oaza_id]["polygons"].append(quantize_coords(poly))

    # Write per-municipality GeoJSON files
    meta = {}
    for muni_code, oaza_map in muni_map.items():
        features = []
        for oaza in oaza_map.values():
            if not oaza["polygons"]:
                continue
            if len(oaza["polygons"]) == 1:
                geom = {"type": "Polygon", "coordinates": oaza["polygons"][0]}
            else:
                geom = {"type": "MultiPolygon", "coordinates": oaza["polygons"]}

            features.append({
                "type": "Feature",
                "properties": {
                    "name": oaza["name"],
                    "code": oaza["code"],
                },
                "geometry": geom,
            })

        if not features:
            continue

        result = {
            "type": "FeatureCollection",
            "features": features,
        }

        output_path = os.path.join(OUTPUT_DIR, f"{muni_code}.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, separators=(",", ":"))

        meta[muni_code] = len(features)

    total_oaza = sum(meta.values())
    print(f"{len(meta)} municipalities, {total_oaza} oaza areas")
    return meta


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    all_meta = {}
    total_munis = 0
    total_oaza = 0

    for code in range(1, 48):
        try:
            pref_meta = process_prefecture(code)
            all_meta.update(pref_meta)
            total_munis += len(pref_meta)
            total_oaza += sum(pref_meta.values())
        except Exception as e:
            print(f"ERROR: {e}")

    # Write meta.json
    meta_path = os.path.join(OUTPUT_DIR, "meta.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(all_meta, f, ensure_ascii=False, separators=(",", ":"))

    # Summary
    total_size = 0
    for fname in os.listdir(OUTPUT_DIR):
        fpath = os.path.join(OUTPUT_DIR, fname)
        if os.path.isfile(fpath):
            total_size += os.path.getsize(fpath)

    print(f"\nTotal: {total_munis} municipalities, {total_oaza} oaza areas")
    print(f"Files: {len(os.listdir(OUTPUT_DIR))} files, {total_size // (1024 * 1024)}MB")


if __name__ == "__main__":
    main()
