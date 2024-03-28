def create_filter_values(row):
    results = []
    data_list = [
        ('gender', row.get('foaf_gender')),
    ]
    for tag, val in data_list:
        if val:
            results.append(f'{tag}:{val}')

    data_list = [
        ('written', row.get('ox_totalWorksByAgent')),
        ('received', row.get('ox_totalWorksAddressedToAgent')),
        ('mentioned', row.get('ox_totalWorksMentioningAgent')),
    ]
    for tag, val in data_list:
        if val:
            results.append(f'{tag}')

    return ' '.join(results)
