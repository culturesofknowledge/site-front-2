# SITE FRONT 2

## Setup

1. **Clone the repository:**

2. **Create and Activate virtual env:**

   ```sh
   python3 -m venv site-front-env
   source site-front-env/bin/activate
   ```

3. **Install the dependencies:**

   ```sh
   pip install -r requirements.txt
   ```

4. **Set up the environment variables:**
   Create a `.env` file in the root directory and add the following:

   ```env
   PORT=5000 [you can choose some other port number too]
   ```

5. **Run the application:**
   ```sh
   python run.py
   ```

## Usage

- The application will be accessible at `http://localhost:5000`.
- Solr will be accessible at `http://localhost:8983`.

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
