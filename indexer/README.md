# How to run the indexer code :

`cd site-front-2/indexing/src`

Install a python venv and install needed libraries

```bash
python -m venv solr_reindexing
source solr_reindexing/bin/activate
pip install --upgrade pip
pip install solrpy pysolr redis feedparser
```

Import the csv files to be indexed.

```bash
mkdir solr_csv_export
cd solr_csv_export
cp <SomeWhere>/*.csv .

# Tell the indexer that it needs to run
rm need_index
touch need_index
cat 1 >> need_index
```
>  Note the directory ("solr_csv_export") can be anything you prefer. It is referenced in the file `sourceconfig_base.py`

Then, run the actual indexing

```bash
# Get back into the indexing directory : site-front-2/indexing/src
cd ..
./index.sh
```
