#!/usr/bin/env python3
"""
Download and process municipality boundary GeoJSON from smartnews-smri/japan-topography.
Outputs optimized per-prefecture GeoJSON files to public/data/geojson/.
"""
import json
import urllib.request
import os
import sys

BASE_URL = "https://raw.githubusercontent.com/smartnews-smri/japan-topography/main/data/municipality/geojson/s0010"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data", "geojson")

DECIMALS = 4  # Coordinate precision (~11m accuracy)


def quantize_coords(coords, decimals=DECIMALS):
    """Recursively round coordinates to reduce file size."""
    if isinstance(coords[0], (int, float)):
        return [round(c, decimals) for c in coords]
    return [quantize_coords(c, decimals) for c in coords]


def process_prefecture(pref_code):
    """Download and process a single prefecture's GeoJSON."""
    url = f"{BASE_URL}/N03-21_{pref_code:02d}_210101.json"
    print(f"  Downloading {pref_code:02d}...", end=" ", flush=True)

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read())

    # Group features by municipality name (merge split polygons)
    muni_map = {}
    for feat in data["features"]:
        props = feat["properties"]
        name = props.get("N03_004") or props.get("N03_003") or "unknown"
        code = props.get("N03_007", "")

        if name not in muni_map:
            muni_map[name] = {
                "name": name,
                "code": code,
                "polygons": [],
            }

        geom = feat["geometry"]
        if geom["type"] == "Polygon":
            muni_map[name]["polygons"].append(quantize_coords(geom["coordinates"]))
        elif geom["type"] == "MultiPolygon":
            for poly in geom["coordinates"]:
                muni_map[name]["polygons"].append(quantize_coords(poly))

    # Build output GeoJSON
    features = []
    for muni in muni_map.values():
        if len(muni["polygons"]) == 1:
            geom = {"type": "Polygon", "coordinates": muni["polygons"][0]}
        else:
            geom = {"type": "MultiPolygon", "coordinates": muni["polygons"]}

        features.append({
            "type": "Feature",
            "properties": {
                "name": muni["name"],
                "code": muni["code"],
            },
            "geometry": geom,
        })

    result = {
        "type": "FeatureCollection",
        "features": features,
    }

    output_path = os.path.join(OUTPUT_DIR, f"{pref_code:02d}.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, separators=(",", ":"))

    size = os.path.getsize(output_path)
    print(f"{len(features)} municipalities, {size // 1024}KB")
    return len(features), size


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    total_munis = 0
    total_size = 0

    for code in range(1, 48):
        try:
            munis, size = process_prefecture(code)
            total_munis += munis
            total_size += size
        except Exception as e:
            print(f"ERROR: {e}")

    print(f"\nTotal: {total_munis} municipalities, {total_size // 1024}KB across 47 files")


if __name__ == "__main__":
    main()
