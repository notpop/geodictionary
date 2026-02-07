#!/usr/bin/env python3
"""
Generate roads.json with major Japanese national routes (国道) data.

Produces data for:
  - Routes 1-58 (旧一級国道 / 主要幹線)
  - Selected important 3-digit routes (一般国道 / 補助国道)

Output: src/data/roads.json
"""

import json
import os
import sys

# Standard Japanese prefecture codes (JIS X 0401)
PREFECTURE_NAMES = {
    "01": "北海道",
    "02": "青森県",
    "03": "岩手県",
    "04": "宮城県",
    "05": "秋田県",
    "06": "山形県",
    "07": "福島県",
    "08": "茨城県",
    "09": "栃木県",
    "10": "群馬県",
    "11": "埼玉県",
    "12": "千葉県",
    "13": "東京都",
    "14": "神奈川県",
    "15": "新潟県",
    "16": "富山県",
    "17": "石川県",
    "18": "福井県",
    "19": "山梨県",
    "20": "長野県",
    "21": "岐阜県",
    "22": "静岡県",
    "23": "愛知県",
    "24": "三重県",
    "25": "滋賀県",
    "26": "京都府",
    "27": "大阪府",
    "28": "兵庫県",
    "29": "奈良県",
    "30": "和歌山県",
    "31": "鳥取県",
    "32": "島根県",
    "33": "岡山県",
    "34": "広島県",
    "35": "山口県",
    "36": "徳島県",
    "37": "香川県",
    "38": "愛媛県",
    "39": "高知県",
    "40": "福岡県",
    "41": "佐賀県",
    "42": "長崎県",
    "43": "熊本県",
    "44": "大分県",
    "45": "宮崎県",
    "46": "鹿児島県",
    "47": "沖縄県",
}


def categorize(number: int) -> str:
    """Return the category based on route number."""
    if number <= 9:
        return "主要幹線"
    elif number <= 58:
        # Routes 10-58 are also former class-1 national routes,
        # but per the spec: 1-digit -> 主要幹線, 2-digit -> 一般国道
        return "一般国道"
    else:
        return "補助国道"


def build_routes():
    """Build the list of all route data."""

    routes = [
        # ===== Routes 1-58 (旧一級国道) =====
        {
            "number": 1,
            "startPoint": "東京都中央区（日本橋）",
            "endPoint": "大阪府大阪市（梅田新道）",
            "prefectures": ["13", "14", "22", "23", "24", "25", "26", "27"],
            "length": 761.6,
            "tips": "東海道ルート。箱根峠を越える区間が特徴的。静岡県内では海沿いを走り、富士山が見えることも。"
        },
        {
            "number": 2,
            "startPoint": "大阪府大阪市（梅田新道）",
            "endPoint": "福岡県北九州市（門司）",
            "prefectures": ["27", "28", "33", "34", "35", "40"],
            "length": 671.4,
            "tips": "山陽道ルート。瀬戸内海沿いを走る。明石海峡大橋の近くを通過。"
        },
        {
            "number": 3,
            "startPoint": "福岡県北九州市（門司）",
            "endPoint": "鹿児島県鹿児島市",
            "prefectures": ["40", "43", "46"],
            "length": 389.1,
            "tips": "九州西回りルート。福岡・熊本・鹿児島を縦断。"
        },
        {
            "number": 4,
            "startPoint": "東京都中央区（日本橋）",
            "endPoint": "青森県青森市",
            "prefectures": ["13", "11", "08", "09", "07", "04", "03", "02"],
            "length": 836.1,
            "tips": "日本最長の国道。奥州街道ルートで東北を縦断。仙台・盛岡を経由。"
        },
        {
            "number": 5,
            "startPoint": "北海道函館市",
            "endPoint": "北海道札幌市",
            "prefectures": ["01"],
            "length": 276.2,
            "tips": "北海道の主要幹線。函館から小樽経由で札幌へ。冬は積雪路面が特徴的。"
        },
        {
            "number": 6,
            "startPoint": "東京都中央区（日本橋）",
            "endPoint": "宮城県仙台市",
            "prefectures": ["13", "12", "08", "07", "04"],
            "length": 345.4,
            "tips": "常磐道ルート。水戸・いわき経由で太平洋側を北上。"
        },
        {
            "number": 7,
            "startPoint": "新潟県新潟市",
            "endPoint": "青森県青森市",
            "prefectures": ["15", "06", "05", "02"],
            "length": 481.3,
            "tips": "日本海沿いを北上する羽州街道ルート。秋田を経由。冬は厳しい風雪。"
        },
        {
            "number": 8,
            "startPoint": "新潟県新潟市",
            "endPoint": "京都府京都市",
            "prefectures": ["15", "16", "17", "18", "25", "26"],
            "length": 579.5,
            "tips": "北陸道ルート。富山・金沢・福井を経由。日本海側の主要幹線。"
        },
        {
            "number": 9,
            "startPoint": "京都府京都市",
            "endPoint": "山口県下関市",
            "prefectures": ["26", "28", "31", "32", "35"],
            "length": 647.4,
            "tips": "山陰道ルート。日本海側を走る。鳥取砂丘の近くを通過。"
        },
        {
            "number": 10,
            "startPoint": "福岡県北九州市",
            "endPoint": "鹿児島県鹿児島市",
            "prefectures": ["40", "44", "45", "46"],
            "length": 461.0,
            "tips": "九州東回りルート。大分・宮崎を経由。別府温泉街の近くを通過。"
        },
        {
            "number": 11,
            "startPoint": "徳島県徳島市",
            "endPoint": "愛媛県松山市",
            "prefectures": ["36", "37", "38"],
            "length": 195.5,
            "tips": "四国北部を横断。高松・松山を結ぶ。讃岐うどん街道とも呼ばれる区間あり。"
        },
        {
            "number": 12,
            "startPoint": "北海道札幌市",
            "endPoint": "北海道旭川市",
            "prefectures": ["01"],
            "length": 150.7,
            "tips": "日本最長の直線道路（29.2km）を含む。北海道らしい広大な景色。"
        },
        {
            "number": 13,
            "startPoint": "福島県福島市",
            "endPoint": "秋田県秋田市",
            "prefectures": ["07", "06", "05"],
            "length": 288.0,
            "tips": "東北中央を縦断。米沢・山形・横手を経由。奥羽街道ルート。"
        },
        {
            "number": 14,
            "startPoint": "東京都中央区（日本橋）",
            "endPoint": "千葉県千葉市",
            "prefectures": ["13", "12"],
            "length": 38.6,
            "tips": "京葉道路ルート。東京と千葉を結ぶ短い国道。都市部の交通量が非常に多い。"
        },
        {
            "number": 15,
            "startPoint": "東京都中央区（日本橋）",
            "endPoint": "神奈川県横浜市",
            "prefectures": ["13", "14"],
            "length": 29.6,
            "tips": "第一京浜。東京と横浜を結ぶ。品川・川崎を通過する都市部の幹線。"
        },
        {
            "number": 16,
            "startPoint": "神奈川県横浜市",
            "endPoint": "神奈川県横浜市",
            "prefectures": ["14", "13", "11", "12"],
            "length": 140.8,
            "tips": "東京環状（横浜起終点）。首都圏の環状線。厚木基地や横田基地の近くを通過。"
        },
        {
            "number": 17,
            "startPoint": "東京都中央区（日本橋）",
            "endPoint": "新潟県新潟市",
            "prefectures": ["13", "11", "10", "15"],
            "length": 353.8,
            "tips": "三国街道ルート。関越方面。三国峠を越えて新潟へ。スキー場が多い地域。"
        },
        {
            "number": 18,
            "startPoint": "群馬県高崎市",
            "endPoint": "長野県上田市",
            "prefectures": ["10", "20"],
            "length": 102.1,
            "tips": "碓氷峠を越える。旧道にはめがね橋（碓氷第三橋梁）がある。中山道ルート。"
        },
        {
            "number": 19,
            "startPoint": "愛知県名古屋市",
            "endPoint": "長野県長野市",
            "prefectures": ["23", "21", "20"],
            "length": 271.1,
            "tips": "中山道ルート。木曽路を通る。馬籠・妻籠宿の近く。山間部の景色が美しい。"
        },
        {
            "number": 20,
            "startPoint": "東京都中央区（日本橋）",
            "endPoint": "長野県塩尻市",
            "prefectures": ["13", "19", "20"],
            "length": 225.4,
            "tips": "甲州街道ルート。八王子・甲府を経由。諏訪湖の近くを通過。"
        },
        {
            "number": 21,
            "startPoint": "岐阜県瑞浪市",
            "endPoint": "滋賀県米原市",
            "prefectures": ["21", "25"],
            "length": 117.1,
            "tips": "中山道ルートの一部。関ヶ原を通過。岐阜県内を東西に横断。"
        },
        {
            "number": 22,
            "startPoint": "愛知県名古屋市",
            "endPoint": "岐阜県岐阜市",
            "prefectures": ["23", "21"],
            "length": 33.8,
            "tips": "名岐バイパス。名古屋と岐阜を結ぶ短い幹線。交通量が多い。"
        },
        {
            "number": 23,
            "startPoint": "愛知県豊橋市",
            "endPoint": "三重県伊勢市",
            "prefectures": ["23", "24"],
            "length": 179.6,
            "tips": "名四国道を含む。伊勢湾沿いを走る。名古屋南部の工業地帯を通過。"
        },
        {
            "number": 24,
            "startPoint": "京都府京都市",
            "endPoint": "和歌山県和歌山市",
            "prefectures": ["26", "29", "30"],
            "length": 131.0,
            "tips": "京奈和ルート。奈良を経由して和歌山へ。寺社仏閣が多い地域。"
        },
        {
            "number": 25,
            "startPoint": "三重県四日市市",
            "endPoint": "大阪府大阪市",
            "prefectures": ["24", "25", "27"],
            "length": 164.2,
            "tips": "名阪国道を含む。三重と大阪を結ぶ無料の自動車専用道路区間あり。"
        },
        {
            "number": 26,
            "startPoint": "大阪府大阪市",
            "endPoint": "和歌山県和歌山市",
            "prefectures": ["27", "30"],
            "length": 69.5,
            "tips": "大阪湾沿いを南下。堺・岸和田を経由。だんじり祭りの地域。"
        },
        {
            "number": 27,
            "startPoint": "福井県敦賀市",
            "endPoint": "京都府船井郡",
            "prefectures": ["18", "26"],
            "length": 151.3,
            "tips": "若狭湾沿い。小浜・舞鶴を経由。リアス式海岸の景色。"
        },
        {
            "number": 28,
            "startPoint": "兵庫県神戸市",
            "endPoint": "徳島県徳島市",
            "prefectures": ["28", "36"],
            "length": 162.2,
            "tips": "淡路島を縦断する国道。明石海峡大橋・大鳴門橋を経由。"
        },
        {
            "number": 29,
            "startPoint": "兵庫県姫路市",
            "endPoint": "鳥取県鳥取市",
            "prefectures": ["28", "31"],
            "length": 125.2,
            "tips": "播但連絡道路と並行。中国山地を越える。鳥取砂丘方面へ。"
        },
        {
            "number": 30,
            "startPoint": "岡山県岡山市",
            "endPoint": "香川県高松市",
            "prefectures": ["33", "37"],
            "length": 73.3,
            "tips": "瀬戸大橋ルート。本州と四国を結ぶ。瀬戸内海の絶景。"
        },
        {
            "number": 31,
            "startPoint": "広島県広島市",
            "endPoint": "広島県呉市",
            "prefectures": ["34"],
            "length": 28.6,
            "tips": "広島と呉を結ぶ。呉は旧海軍の街。大和ミュージアムの近く。"
        },
        {
            "number": 32,
            "startPoint": "香川県高松市",
            "endPoint": "高知県高知市",
            "prefectures": ["37", "36", "39"],
            "length": 149.1,
            "tips": "四国を南北に縦断。大歩危・小歩危峡を通過する景勝ルート。"
        },
        {
            "number": 33,
            "startPoint": "高知県高知市",
            "endPoint": "愛媛県松山市",
            "prefectures": ["39", "38"],
            "length": 153.5,
            "tips": "四国山地を横断。仁淀川沿いの美しい渓谷。石鎚山の近く。"
        },
        {
            "number": 34,
            "startPoint": "広島県広島市",
            "endPoint": "長崎県長崎市",
            "prefectures": ["34", "35", "40", "41", "42"],
            "length": 406.8,
            "tips": "関門海峡を渡り九州へ。佐賀・長崎へ向かう。原爆関連施設の近く。"
        },
        {
            "number": 35,
            "startPoint": "山口県下関市",
            "endPoint": "山口県美祢市",
            "prefectures": ["35"],
            "length": 57.4,
            "tips": "山口県内の短い国道。秋吉台・秋芳洞の近くを通過。"
        },
        {
            "number": 36,
            "startPoint": "北海道札幌市",
            "endPoint": "北海道室蘭市",
            "prefectures": ["01"],
            "length": 128.4,
            "tips": "北海道の太平洋側。千歳空港の近くを通過。支笏湖方面。"
        },
        {
            "number": 37,
            "startPoint": "北海道室蘭市",
            "endPoint": "北海道帯広市",
            "prefectures": ["01"],
            "length": 204.0,
            "tips": "北海道南部を横断。日高山脈を越える。牧場が多い地域。"
        },
        {
            "number": 38,
            "startPoint": "北海道滝川市",
            "endPoint": "北海道釧路市",
            "prefectures": ["01"],
            "length": 299.2,
            "tips": "北海道中央部から東部へ。狩勝峠を越える。十勝平野の広大な景色。"
        },
        {
            "number": 39,
            "startPoint": "北海道旭川市",
            "endPoint": "北海道網走市",
            "prefectures": ["01"],
            "length": 211.8,
            "tips": "北海道の内陸から北東へ。層雲峡・大雪山の近く。北見峠を越える。"
        },
        {
            "number": 40,
            "startPoint": "北海道旭川市",
            "endPoint": "北海道稚内市",
            "prefectures": ["01"],
            "length": 247.2,
            "tips": "日本最北端へ向かう国道。宗谷岬方面。サロベツ原野を通過。"
        },
        {
            "number": 41,
            "startPoint": "愛知県名古屋市",
            "endPoint": "富山県富山市",
            "prefectures": ["23", "21", "16"],
            "length": 232.8,
            "tips": "飛騨街道ルート。高山を経由。飛騨の古い町並みの近く。"
        },
        {
            "number": 42,
            "startPoint": "長崎県長崎市",
            "endPoint": "長崎県佐世保市",
            "prefectures": ["42"],
            "length": 107.6,
            "tips": "長崎県内を走る。大村湾沿い。ハウステンボスの近く。"
        },
        {
            "number": 43,
            "startPoint": "大阪府大阪市",
            "endPoint": "兵庫県神戸市",
            "prefectures": ["27", "28"],
            "length": 30.0,
            "tips": "阪神間の幹線。工業地帯を通過。阪神高速と並行。"
        },
        {
            "number": 44,
            "startPoint": "北海道帯広市",
            "endPoint": "北海道釧路市",
            "prefectures": ["01"],
            "length": 124.4,
            "tips": "十勝から釧路へ。広大な牧草地帯。霧が多い地域。"
        },
        {
            "number": 45,
            "startPoint": "宮城県仙台市",
            "endPoint": "青森県青森市",
            "prefectures": ["04", "03", "02"],
            "length": 543.6,
            "tips": "三陸海岸沿い。リアス式海岸の景色。東日本大震災の復興区間が多い。"
        },
        {
            "number": 46,
            "startPoint": "秋田県秋田市",
            "endPoint": "青森県弘前市",
            "prefectures": ["05", "02"],
            "length": 101.4,
            "tips": "秋田と青森を結ぶ。白神山地の近く。りんご畑が広がる地域。"
        },
        {
            "number": 47,
            "startPoint": "宮城県仙台市",
            "endPoint": "山形県鶴岡市",
            "prefectures": ["04", "06"],
            "length": 163.7,
            "tips": "仙台から山形の日本海側へ。鳴子峡を通過。温泉地が多い。"
        },
        {
            "number": 48,
            "startPoint": "宮城県仙台市",
            "endPoint": "山形県山形市",
            "prefectures": ["04", "06"],
            "length": 65.0,
            "tips": "関山峠を越える仙台と山形の最短ルート。冬は積雪が多い。"
        },
        {
            "number": 49,
            "startPoint": "福島県いわき市",
            "endPoint": "新潟県新潟市",
            "prefectures": ["07", "15"],
            "length": 252.2,
            "tips": "磐越道ルート。会津若松を経由。猪苗代湖・磐梯山の近く。"
        },
        {
            "number": 50,
            "startPoint": "群馬県前橋市",
            "endPoint": "茨城県水戸市",
            "prefectures": ["10", "09", "08"],
            "length": 157.5,
            "tips": "北関東を東西に横断。足利・筑西を経由。北関東道と並行。"
        },
        {
            "number": 51,
            "startPoint": "千葉県千葉市",
            "endPoint": "茨城県水戸市",
            "prefectures": ["12", "08"],
            "length": 123.4,
            "tips": "成田空港の近くを通過。利根川を渡る。鹿島灘沿い。"
        },
        {
            "number": 52,
            "startPoint": "山梨県甲府市（甲府市）",
            "endPoint": "静岡県静岡市",
            "prefectures": ["19", "22"],
            "length": 88.7,
            "tips": "身延道。富士川沿いを走る。身延山久遠寺の近く。"
        },
        {
            "number": 53,
            "startPoint": "岡山県岡山市",
            "endPoint": "鳥取県鳥取市",
            "prefectures": ["33", "31"],
            "length": 145.6,
            "tips": "中国山地を縦断。津山を経由。因幡街道ルート。"
        },
        {
            "number": 54,
            "startPoint": "広島県広島市",
            "endPoint": "島根県松江市",
            "prefectures": ["34", "32"],
            "length": 188.1,
            "tips": "中国山地を縦断。三次を経由。出雲大社方面へ。"
        },
        {
            "number": 55,
            "startPoint": "徳島県徳島市",
            "endPoint": "高知県高知市",
            "prefectures": ["36", "39"],
            "length": 247.1,
            "tips": "四国東岸沿い。室戸岬を経由。太平洋の景色が美しい。"
        },
        {
            "number": 56,
            "startPoint": "高知県高知市",
            "endPoint": "愛媛県松山市",
            "prefectures": ["39", "38"],
            "length": 303.2,
            "tips": "四国西部を周回。足摺岬・宇和島を経由。四万十川を渡る。"
        },
        {
            "number": 57,
            "startPoint": "大分県大分市",
            "endPoint": "長崎県長崎市",
            "prefectures": ["44", "43", "42"],
            "length": 276.5,
            "tips": "九州中部を横断。阿蘇山を通過。阿蘇カルデラの絶景。"
        },
        {
            "number": 58,
            "startPoint": "鹿児島県鹿児島市",
            "endPoint": "沖縄県那覇市",
            "prefectures": ["46", "47"],
            "length": 879.9,
            "tips": "海上区間を含む唯一の国道。種子島・奄美大島を経由。沖縄のメインストリート。"
        },

        # ===== Selected important 3-digit routes =====
        {
            "number": 100,
            "startPoint": "東京都大島町",
            "endPoint": "東京都小笠原村",
            "prefectures": ["13"],
            "length": 0.0,
            "tips": "伊豆諸島・小笠原諸島を結ぶ。全線海上区間のため実延長0km。"
        },
        {
            "number": 101,
            "startPoint": "青森県青森市",
            "endPoint": "秋田県秋田市",
            "prefectures": ["02", "05"],
            "length": 178.4,
            "tips": "日本海沿いの五能線と並行。白神山地の西側。十二湖の近く。"
        },
        {
            "number": 103,
            "startPoint": "青森県青森市",
            "endPoint": "秋田県大館市",
            "prefectures": ["02", "05"],
            "length": 119.8,
            "tips": "八甲田山・十和田湖を経由。奥入瀬渓流の近く。紅葉の名所。"
        },
        {
            "number": 106,
            "startPoint": "岩手県盛岡市",
            "endPoint": "岩手県宮古市",
            "prefectures": ["03"],
            "length": 106.2,
            "tips": "北上山地を横断。区界峠を越える。三陸海岸へのアクセスルート。"
        },
        {
            "number": 112,
            "startPoint": "山形県山形市",
            "endPoint": "山形県鶴岡市",
            "prefectures": ["06"],
            "length": 113.4,
            "tips": "月山を越える。六十里越街道。月山スキー場の近く。"
        },
        {
            "number": 113,
            "startPoint": "新潟県新潟市",
            "endPoint": "福島県相馬市",
            "prefectures": ["15", "06", "04", "07"],
            "length": 228.3,
            "tips": "新潟から福島へ東西に横断。米沢を経由。飯豊山の近く。"
        },
        {
            "number": 116,
            "startPoint": "新潟県新潟市",
            "endPoint": "新潟県柏崎市",
            "prefectures": ["15"],
            "length": 90.2,
            "tips": "新潟県の日本海沿い。弥彦山の近く。海岸線の景色。"
        },
        {
            "number": 117,
            "startPoint": "長野県長野市",
            "endPoint": "新潟県小千谷市",
            "prefectures": ["20", "15"],
            "length": 78.9,
            "tips": "千曲川・信濃川沿い。野沢温泉の近く。スキー場が多い地域。"
        },
        {
            "number": 118,
            "startPoint": "茨城県水戸市",
            "endPoint": "福島県会津若松市",
            "prefectures": ["08", "09", "07"],
            "length": 193.9,
            "tips": "大子町・那須を経由。袋田の滝の近く。会津方面へ。"
        },
        {
            "number": 119,
            "startPoint": "栃木県日光市",
            "endPoint": "栃木県宇都宮市",
            "prefectures": ["09"],
            "length": 34.9,
            "tips": "日光杉並木街道。世界最長の並木道として有名。日光東照宮へのアクセス。"
        },
        {
            "number": 120,
            "startPoint": "栃木県日光市",
            "endPoint": "群馬県沼田市",
            "prefectures": ["09", "10"],
            "length": 66.5,
            "tips": "いろは坂・金精峠を越える。華厳の滝・中禅寺湖の近く。秋の紅葉が有名。"
        },
        {
            "number": 122,
            "startPoint": "栃木県日光市",
            "endPoint": "東京都豊島区",
            "prefectures": ["09", "10", "11", "13"],
            "length": 148.0,
            "tips": "日光から東京へ。足尾銅山の近く。渡良瀬渓谷を通過。"
        },
        {
            "number": 125,
            "startPoint": "埼玉県熊谷市",
            "endPoint": "千葉県香取市",
            "prefectures": ["11", "08", "12"],
            "length": 113.5,
            "tips": "北関東を東西に走る。利根川沿い。田園風景が広がる。"
        },
        {
            "number": 129,
            "startPoint": "神奈川県相模原市",
            "endPoint": "神奈川県平塚市",
            "prefectures": ["14"],
            "length": 23.8,
            "tips": "相模原から湘南方面へ。厚木市を経由。相模川を渡る。"
        },
        {
            "number": 131,
            "startPoint": "東京都大田区",
            "endPoint": "東京都大田区",
            "prefectures": ["13"],
            "length": 2.2,
            "tips": "羽田空港へのアクセス道路。非常に短い国道。"
        },
        {
            "number": 134,
            "startPoint": "神奈川県横須賀市",
            "endPoint": "神奈川県中郡大磯町",
            "prefectures": ["14"],
            "length": 55.6,
            "tips": "湘南海岸沿い。江ノ島・鎌倉を通過。サーファーが多い。ドライブコースとして人気。"
        },
        {
            "number": 135,
            "startPoint": "神奈川県小田原市",
            "endPoint": "静岡県下田市",
            "prefectures": ["14", "22"],
            "length": 92.8,
            "tips": "伊豆半島の東海岸沿い。熱海・伊東・下田を経由。リゾート地が多い。"
        },
        {
            "number": 139,
            "startPoint": "静岡県富士市",
            "endPoint": "東京都西多摩郡奥多摩町",
            "prefectures": ["22", "19", "13"],
            "length": 157.8,
            "tips": "富士山の西側を通過。富士五湖の近く。富士山麓の景色が特徴的。"
        },
        {
            "number": 141,
            "startPoint": "長野県佐久市",
            "endPoint": "山梨県韮崎市",
            "prefectures": ["20", "19"],
            "length": 70.2,
            "tips": "佐久平から清里高原を経由。八ヶ岳の東側。高原の爽やかな景色。"
        },
        {
            "number": 146,
            "startPoint": "長野県佐久市",
            "endPoint": "群馬県長野原町",
            "prefectures": ["20", "10"],
            "length": 44.7,
            "tips": "軽井沢を経由。浅間山の南側。避暑地・リゾートの雰囲気。"
        },
        {
            "number": 150,
            "startPoint": "静岡県静岡市",
            "endPoint": "静岡県浜松市",
            "prefectures": ["22"],
            "length": 110.5,
            "tips": "御前崎を経由する海岸沿いルート。茶畑が広がる牧之原台地の近く。"
        },
        {
            "number": 153,
            "startPoint": "愛知県名古屋市",
            "endPoint": "長野県塩尻市",
            "prefectures": ["23", "20"],
            "length": 192.4,
            "tips": "飯田街道。伊那谷を通る。南アルプスの西側。中央構造線沿い。"
        },
        {
            "number": 158,
            "startPoint": "福井県福井市",
            "endPoint": "長野県松本市",
            "prefectures": ["18", "21", "20"],
            "length": 181.8,
            "tips": "安房峠・油坂峠を越える。上高地へのアクセスルート。北アルプスの景色。"
        },
        {
            "number": 161,
            "startPoint": "滋賀県大津市",
            "endPoint": "福井県敦賀市",
            "prefectures": ["25", "18"],
            "length": 89.3,
            "tips": "琵琶湖の西岸を走る。湖西道路。比良山系の景色。"
        },
        {
            "number": 163,
            "startPoint": "三重県津市",
            "endPoint": "大阪府大阪市",
            "prefectures": ["24", "29", "26", "27"],
            "length": 103.2,
            "tips": "伊賀越えルート。忍者の里・伊賀上野を経由。名阪間の南側ルート。"
        },
        {
            "number": 166,
            "startPoint": "大阪府羽曳野市",
            "endPoint": "三重県松阪市",
            "prefectures": ["27", "29", "24"],
            "length": 148.5,
            "tips": "紀伊半島を東西に横断。吉野山を経由。桜の名所。"
        },
        {
            "number": 168,
            "startPoint": "奈良県生駒市",
            "endPoint": "和歌山県新宮市",
            "prefectures": ["29", "30"],
            "length": 186.4,
            "tips": "紀伊半島を南北に縦断。十津川村を経由。日本一長い路線バスのルート。"
        },
        {
            "number": 169,
            "startPoint": "奈良県奈良市",
            "endPoint": "和歌山県新宮市",
            "prefectures": ["29", "24", "30"],
            "length": 209.7,
            "tips": "熊野古道沿い。大台ケ原の近く。瀞峡を通過。山深い秘境ルート。"
        },
        {
            "number": 171,
            "startPoint": "京都府京都市",
            "endPoint": "兵庫県神戸市",
            "prefectures": ["26", "27", "28"],
            "length": 67.3,
            "tips": "西国街道ルート。京都から大阪北部を経由して神戸へ。都市部の幹線。"
        },
        {
            "number": 172,
            "startPoint": "大阪府大阪市",
            "endPoint": "大阪府堺市",
            "prefectures": ["27"],
            "length": 17.8,
            "tips": "大阪港エリアを通過。築港・天保山の近く。大阪湾岸の風景。"
        },
        {
            "number": 173,
            "startPoint": "大阪府池田市",
            "endPoint": "京都府綾部市",
            "prefectures": ["27", "28", "26"],
            "length": 88.1,
            "tips": "能勢を経由。丹波地方を北上。のどかな里山風景。"
        },
        {
            "number": 174,
            "startPoint": "兵庫県神戸市",
            "endPoint": "兵庫県神戸市",
            "prefectures": ["28"],
            "length": 0.2,
            "tips": "日本最短の国道（187.1m）。神戸港と国道2号を結ぶ。"
        },
        {
            "number": 175,
            "startPoint": "兵庫県明石市",
            "endPoint": "京都府舞鶴市",
            "prefectures": ["28", "26"],
            "length": 122.0,
            "tips": "播磨灘から日本海側へ。兵庫県中央部を縦断。丹波篠山の近く。"
        },
        {
            "number": 176,
            "startPoint": "大阪府大阪市",
            "endPoint": "京都府宮津市",
            "prefectures": ["27", "28", "26"],
            "length": 142.8,
            "tips": "大阪から天橋立方面へ。宝塚・三田を経由。丹後半島方面。"
        },
    ]

    # Add computed fields
    for r in routes:
        r["name"] = f"国道{r['number']}号"
        r["category"] = categorize(r["number"])

    return routes


def main():
    routes = build_routes()
    output = {
        "roads": routes,
        "prefectureNames": PREFECTURE_NAMES,
    }

    # Determine output path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_path = os.path.join(project_root, "src", "data", "roads.json")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    # Summary
    total = len(routes)
    main_routes = [r for r in routes if r["number"] <= 58]
    three_digit = [r for r in routes if r["number"] >= 100]

    print(f"Generated {output_path}")
    print(f"  Total routes:       {total}")
    print(f"  Main routes (1-58): {len(main_routes)}")
    print(f"  3-digit routes:     {len(three_digit)}")
    print(f"  Prefectures:        {len(PREFECTURE_NAMES)}")

    # Validate
    numbers = [r["number"] for r in routes]
    assert len(numbers) == len(set(numbers)), "Duplicate route numbers found!"

    # Check all 1-58 are present
    expected_1_58 = set(range(1, 59))
    actual_1_58 = {r["number"] for r in routes if r["number"] <= 58}
    missing = expected_1_58 - actual_1_58
    if missing:
        print(f"  WARNING: Missing routes 1-58: {sorted(missing)}")
    else:
        print(f"  All routes 1-58 present: YES")

    # Check all prefectures referenced exist
    all_pref_codes = set()
    for r in routes:
        all_pref_codes.update(r["prefectures"])
    unknown = all_pref_codes - set(PREFECTURE_NAMES.keys())
    if unknown:
        print(f"  WARNING: Unknown prefecture codes: {unknown}")
    else:
        print(f"  All prefecture codes valid: YES")

    print("Done.")


if __name__ == "__main__":
    main()
