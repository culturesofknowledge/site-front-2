# Index data in Solr

## Run the indexer using docker

### Setup the data
1. The indexer needs source csv files. 

   These need to be placed in the `CSV_FOLDER_IMPORT_PATH` defined in the .env file.

   These files are obtained from emlo-edit solr export.

2. Tell the indexer that it needs to run

   There needs to be a file named `need_index` within the `CSV_FOLDER_IMPORT_PATH` with the text `1`

   ```
   cd $CSV_FOLDER_IMPORT_PATH
   rm need_index
   touch need_index
   cat 1 >> need_index
   ```

### Run the indexer

Once the docker-containers are built for EMLO site-front-2 (see [Readme](https://github.com/culturesofknowledge/site-front-2/blob/feature/index_solr/README.md#run-using-docker) on how to), you just need to start the docker container `indexer`. 

```
docker-compose start indexer
```

It will then run the indexer.

You can look at the logs in either

* the docker logs `docker-compose logs -f indexer` 
* the log file in `CSV_FOLDER_IMPORT_PATH`/`indexer.log`

It may take a few hours to complete the indexing process.

## Run the indexer natively

### Setup the code

1. Clone the git repository:

2. Change to the indexer directory:

   ```
   cd site-front-2/indexer/src
   ```

3. Create and activate virtual env:

   ```sh
   python3 -m venv site-front-env
   source site-front-env/bin/activate
   ```

4. Install the dependencies:

   ```sh
   pip install -r requirements.txt
   ```

### Setup the data
1. The indexer needs source csv files. 

   These need to be placed in the directory `/data/csv_import_files`.

   Note: If the files are in a different location, change the path in``indexer/src/sourceconfig_base.py` 

   These files are obtained from emlo-edit solr export.

2. Tell the indexer that it needs to run

   There needs to be a file named `need_index` within the `/data/csv_import_files` with the text `1`

   ```
   cd /data/csv_import_files
   rm need_index
   touch need_index
   cat 1 >> need_index
   ```

### Run the indexer

5. Run the indexer:
   ```sh
   ./index.sh
   ```
