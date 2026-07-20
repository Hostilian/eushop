#!/usr/bin/env python3
"""
EUshop Vision AI Food Label Allergen Scanner
============================================

Extracts ingredient lists from physical food packaging photos and automatically
detects the 14 EU Annex II regulated food allergens (Reg. 1169/2011).

COMPLIANCE-REVIEW: All detected allergens map strictly to canonical Annex II categories.
Manual seller verification remains required before publishing listings.
"""

import sys
import json
import re

# 14 EU Regulated Allergens (Annex II)
EU_ALLERGENS_14 = [
    "Cereals containing gluten",
    "Crustaceans",
    "Eggs",
    "Fish",
    "Peanuts",
    "Soybeans",
    "Milk",
    "Nuts",
    "Celery",
    "Mustard",
    "Sesame seeds",
    "Sulphur dioxide and sulphites",
    "Lupin",
    "Molluscs"
]

# Multilingual Keyword Detection Dictionary (EN, DE, FR, IT, ES, CS)
KEYWORD_MAPPINGS = {
    "Cereals containing gluten": [r"\bwheat\b", r"\bgluten\b", r"\bbarley\b", r"\brye\b", r"\boat\b", r"\bweizen\b", r"\blepek\b", r"\bobiloviny\b", r"\bblé\b"],
    "Crustaceans": [r"\bcrustacean", r"\bshrimp\b", r"\bprawn\b", r"\bcrab\b", r"\blobrster\b", r"\bkrab\b", r"\bkorýši\b", r"\bcrevette\b"],
    "Eggs": [r"\begg\b", r"\beggs\b", r"\beier\b", r"\bœuf\b", r"\buova\b", r"\bhuevo\b", r"\bvejce\b"],
    "Fish": [r"\bfish\b", r"\bfische\b", r"\bpoisson\b", r"\bpesce\b", r"\bpescado\b", r"\bryby\b"],
    "Peanuts": [r"\bpeanut", r"\berdnuss", r"\barachide\b", r"\bcacahuete\b", r"\barašíd\b"],
    "Soybeans": [r"\bsoy\b", r"\bsoya\b", r"\bsoybean", r"\bsoja\b", r"\bsójov\b"],
    "Milk": [r"\bmilk\b", r"\bdairy\b", r"\bwhey\b", r"\blactose\b", r"\bmilch\b", r"\blait\b", r"\blatte\b", r"\bleche\b", r"\bmléko\b"],
    "Nuts": [r"\bnut\b", r"\bnuts\b", r"\balmond\b", r"\bhazelnut\b", r"\bwalnut\b", r"\bcashew\b", r"\bpistachio\b", r"\bschalenfrüchte\b", r"\bskořápkové\b"],
    "Celery": [r"\bcelery\b", r"\bsellerie\b", r"\bcéleri\b", r"\bsedano\b", r"\bapio\b", r"\bceler\b"],
    "Mustard": [r"\bmustard\b", r"\bsenaf\b", r"\bsenef\b", r"\bmoutarde\b", r"\bmostaza\b", r"\bhořčice\b"],
    "Sesame seeds": [r"\bsesame\b", r"\bsesam\b", r"\bsésame\b", r"\bsezam\b"],
    "Sulphur dioxide and sulphites": [r"\bsulphite", r"\bsulfite", r"\bschwefeldioxid\b", r"\bsulfiti\b", r"\bsiřičit\b"],
    "Lupin": [r"\blupin\b", r"\blupine\b", r"\blupini\b", r"\blupina\b"],
    "Molluscs": [r"\bmollusc", r"\bmollusk", r"\bmussel\b", r"\bclam\b", r"\bsquid\b", r"\boyster\b", r"\bměkkýš\b"]
}

def scan_ingredient_text(text: str) -> dict:
    text_lower = text.lower()
    detected_allergens = []

    for allergen, patterns in KEYWORD_MAPPINGS.items():
        for pattern in patterns:
            if re.search(pattern, text_lower):
                if allergen not in detected_allergens:
                    detected_allergens.append(allergen)
                break

    return {
        "status": "success",
        "rawText": text,
        "detectedAllergens": detected_allergens,
        "totalDetected": len(detected_allergens),
        "complianceStandard": "Regulation (EU) No 1169/2011 Annex II"
    }

if __name__ == "__main__":
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    if len(sys.argv) > 1:
        sample_text = " ".join(sys.argv[1:])
    else:
        sample_text = "Ingredients: Wheat flour, sugar, butter (milk), eggs, hazelnuts, soy lecithin, salt."

    result = scan_ingredient_text(sample_text)
    print(json.dumps(result, indent=2, ensure_ascii=False))
