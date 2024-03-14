from importlib import resources
from pathlib import Path


def path_data() -> Path:
    # KTODO to be extract to environment variable
    return resources.files('site_front_2') / '../data'
