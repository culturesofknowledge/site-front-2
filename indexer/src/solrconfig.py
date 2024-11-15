import os
from urllib.parse import urljoin

solr_base_url = os.getenv('SOLR_URL')

solr_urls = {
    'all' : urljoin(solr_base_url, 'all'),
    'locations' : urljoin(solr_base_url,  'locations'),
    'comments' : urljoin(solr_base_url,  'comments'),
    'images' : urljoin(solr_base_url,  'images'),
    'works' : urljoin(solr_base_url,  'works'),
    'people' : urljoin(solr_base_url,  'people'),
    'manifestations' : urljoin(solr_base_url,  'manifestations'),
    'institutions' : urljoin(solr_base_url,  'institutions'),
    'resources' : urljoin(solr_base_url,  'resources'),
}

solr_urls_stage = {
    'all' : urljoin(solr_base_url,  'all_stage'),
    'locations' : urljoin(solr_base_url,  'locations_stage'),
    'comments' : urljoin(solr_base_url,  'comments_stage'),
    'images' : urljoin(solr_base_url,  'images_stage'),
    'works' : urljoin(solr_base_url,  'works_stage'),
    'people' : urljoin(solr_base_url,  'people_stage'),
    'manifestations' : urljoin(solr_base_url,  'manifestations_stage'),
    'institutions' : urljoin(solr_base_url,  'institutions_stage'),
    'resources' : urljoin(solr_base_url,  'resources_stage'),
}
