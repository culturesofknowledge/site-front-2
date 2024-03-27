def hide_zero(value):
    # TOBEREMOVE
    try:
        value = int(value)
        if value == 0:
            return '-'
        return value
    except (ValueError, TypeError):
        return '-'
