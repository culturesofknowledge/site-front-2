# How to run the indexer code :

`cd site-front-2/indexing/src`

Install a python venv and install needed libraries

```bash
python -m venv solr_reindexing
source solr_reindexing/bin/activate
pip install --upgrade pip
pip install solrpy pysolr redis feedparser
```

Import the csv files into a proper location. e.g.
`mkdir solr_csv_export`

>  Note the above directory should be referenced in the file `sourceconfig_base.py`

```bash
cp <SomeWhere>/*.csv .
cd solr_csv_export
```



In the same directory, we need a file (`need_index`) to say that we need the indexing to be run

```bash
touch need_index
cat 1 >> need_index
```



Then, run the actual indexing

```bash
cd ..
./index.sh
```
