'''
Created on 27 Aug 2010

@author: dev

solr configurations
'''

# solr_base_url = "http://solr:8983/solr/"
solr_base_url = "http://localhost:8983/solr/"

solr_urls = {
    'all': solr_base_url + 'all',
    'locations': solr_base_url + 'locations',
    'comments': solr_base_url + 'comments',
    'images': solr_base_url + 'images',
    'works': solr_base_url + 'works',
    'people': solr_base_url + 'people',
    'manifestations': solr_base_url + 'manifestations',
    'institutions': solr_base_url + 'institutions',
    'resources': solr_base_url + 'resources',
}

solr_urls_stage = {
    'all': solr_base_url + 'all_stage',
    'locations': solr_base_url + 'locations_stage',
    'comments': solr_base_url + 'comments_stage',
    'images': solr_base_url + 'images_stage',
    'works': solr_base_url + 'works_stage',
    'people': solr_base_url + 'people_stage',
    'manifestations': solr_base_url + 'manifestations_stage',
    'institutions': solr_base_url + 'institutions_stage',
    'resources': solr_base_url + 'resources_stage',
}
