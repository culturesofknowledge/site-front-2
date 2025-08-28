#! /bin/bash
rm -f /data/csv_import_files/indexer.log
python -u ./index.py | tee /data/csv_import_files/indexer.log