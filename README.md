# Emlo front (public site) 2



## Installation

### Requirements
* git 
* docker compose
* python3.12
* node (Optional)

### Files needed
* data-solr.tar.gz
* solr-emlo.tar.gz


```bash

EMLO_HOME=/emlo
EMFR_CODE=$EMLO_HOME/emfr
EMFR_VENV=$EMLO_HOME/emfr_venv

sudo mkdir -p $EMLO_HOME

git clone https://github.com/culturesofknowledge/site-front-2.git $EMFR_CODE

# run solr
cd $EMFR_CODE/docker/emfr
tar xvzf data-solr.tar.gz .
tar xvzf solr-emlo.tar.gz .

docker compose -f $EMFR_CODE/docker/emfr/docker-compose.yml up -d

# run flask app

python3.12 -m venv $EMFR_VENV

cd $EMFR_CODE

$EMFR_VENV/bin/pip install -r requirements.txt

$EMFR_VENV/bin/python $EMFR_CODE/site_front_2/flaskapp/emfr_app.py
```

```bash
# build javascript with node and npm (optional)

cd $EMFR_CODE
npm install
npm run dev-build
```
