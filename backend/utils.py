def estimate_tokens(text: str) -> int:
    words = len(text.strip().split())
    return int(words * 1.33)  # Rough estimate

def estimate_emissions(tokens: int) -> float:
    return tokens * 0.0002  # grams of CO2
