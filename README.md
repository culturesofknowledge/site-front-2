# SITE FRONT 2

This project is a rewrite of [EMLO front](https://github.com/culturesofknowledge/site-front) using Solr, flask and edges. 

* The data structure of the input csv files used to index data in solr, the UI design and the webiste functionality are to remain the same.
* The indexer code has been copied from [EMLO front](https://github.com/culturesofknowledge/site-front) and upgraded to Python 3.

The data in SOLR

* Data is exported from EMLO edit / EMLO Edit new into csv files, for indexing in SOLR. 
* The indexer container indexes the data in Solr, to be used by edges throught flask.
* The export and import is scheduled to run once a week (or overnight) and is triggered from EMLO edit / EMLO edit new. 

## Setup the repository

1. Clone the repository:

2. Initialise the edges submodule:

   ```sh
   git submodule update --init
   ```
3. Set up the environment variables:
   Create a `.env` file in the root directory. Copy the .env.template file and set the values for solr and redis 


## Run using docker 

1. Build the `web`, `solr`, `redis` and `indexer` containers using docker

   ```
   docker-compose build
   ```

2. Run the application

   ```
   docker-compose up -d
   ```

Note: For the indexer container to run successfully and to index data in SOLR, see the [indexer readme](https://github.com/culturesofknowledge/site-front-2/blob/dev/indexer/README.md).

## Run natively

1. Create and activate virtual env:

   ```sh
   python3 -m venv site-front-env
   source site-front-env/bin/activate
   ```

2. Install the dependencies:

   ```sh
   pip install -r requirements.txt
   ```

3. Run the application:
   ```sh
   python run.py
   ```

## Usage

- The application will be accessible at `http://localhost:5000`.
- Note: You need to have data in your Solr container. Look for instructions on indexing data in solr below.

### Indexing data in Solr

The indexer container can be used to index data in Solr. See the [indexer readme](https://github.com/culturesofknowledge/site-front-2/blob/dev/indexer/README.md).

## File Structure

- `views/`: Contains the view functions for different routes.
- `templates/`: Contains the HTML templates.
- `static/`: Contains static files like CSS and JS.
- `config.py`: Contains configuration settings.
- `run.py`: The entry point to run the Flask application.
- `setup.py`: Setup script for packaging.
- `requirements.txt`: Python dependencies.
- `.env`: Environment variables.

## How to use edges

The edges code lies under the static/lib directory. In order to use this code smoothly we have created the files

1. **\_edges_common_js.jinja2** : This file includes all the components and edges you simply need to call this file in your jinja2 files.
2. **static/js/edges.js** : This file has basic structure for you to access edges so the dependencies can be avoided and a better code maintainability can be achieved.
   1. You can update the variable **emloEdges.searchUrl** in such a way that it points to the server which will be helping us to fetch data from solr.
3. Rules:
   1. Logic related to the pages will be written in js files we will be using the file format `<route>.edges.js`.
   2. Inside each file you need to follow the same pattern where you will provide
      1. selector: HTML element ID (without #)
      2. collection: Solr collection name.
      3. Components: Array all the components that are to be used by you.
   3. You will then import this js file inside your jinja2 file using the syntax ` <script type="module" src="../static/js/<route>.edges.js">`
