MODEL_PRICING_PER_1M_TOKENS = {
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
}


def calculate_cost_usd(model: str, input_tokens: int, output_tokens: int) -> float | None:
    pricing = MODEL_PRICING_PER_1M_TOKENS.get(model)
    if pricing is None:
        return None

    return (
        input_tokens * pricing["input"] + output_tokens * pricing["output"]
    ) / 1_000_000
