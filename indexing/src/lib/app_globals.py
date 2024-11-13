"""The application's Globals object"""

from beaker.cache import CacheManager
from beaker.util import parse_cache_config_options

class Globals(object):
    """Globals acts as a container for objects available throughout the
    life of the application

    """

    def __init__(self, config):
        """One instance of Globals is created during application
        initialization and is available during requests via the
        'app_globals' variable

        """
        self.cache = CacheManager(**parse_cache_config_options(config))
        self.nav = [
             {'id':"home",        'display':"Home",          'url':"/home",            'accesskey': "1" },
             {'id':"search",      'display':"Search+",       'url':"/advanced",        'accesskey': "2" },
             {'id':"browse",      'display':"Browse",        'url':"/browse/people",   'accesskey': "3" },
             #{'id':"emlo_collections",'display':"Catalogues",'url':"/emlo_collections",'accesskey': "4" },
			 {'id':"emlo_collections",'display':"Collections",'url':"http://emlo-portal.bodleian.ox.ac.uk/collections/?page_id=480",'accesskey': "4" },
             {'id':"contribute",  'display':"Contribute",    'url':"http://emlo-portal.bodleian.ox.ac.uk/collections/?page_id=913",      'accesskey': "5" },
             {'id':"about",       'display':"About",         'url':"http://emlo-portal.bodleian.ox.ac.uk/collections/?page_id=907",           'accesskey': "6" }
        ]
        self.title = "Early Modern Letters Online"

