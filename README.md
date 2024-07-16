# SITE FRONT 2

## Setup

1. **Clone the repository:**

2. **Activate virtual env:**
    ```sh
    source site-front/bin/activate
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
