import warnings
from contextlib import contextmanager

import pysolr
import solr

from site_front_2.datasrc import solrconfig


@contextmanager
def conn__OLD(object):
    warnings.warn("This function is deprecated. Use conn instead.", DeprecationWarning)
    sol = solr.SolrConnection(solrconfig.solr_urls[object])
    yield sol
    sol.close()


def conn(object):
    sol = pysolr.Solr(solrconfig.solr_urls[object])
    yield sol
