#! /bin/bash
timestamp=$(date +%m-%d-%y_%H-%M-%S)
python -u ./index.py | tee /data/csv_import_files/indexer_$timestamp.log