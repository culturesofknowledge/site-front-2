# -*- coding: utf-8 -*-
"""Helper functions

Consists of functions to typically be used within templates, but also
available to Controllers. This module is available to templates as 'h'.
"""

import solr

import sys
if '..' not in sys.path:
    sys.path.insert(0, '..') # Add workspace files into path. TODO: Fix!
    
import solrconfig
# Import helpers as desired, or define your own, ie:
#from webhelpers.html.tags import checkbox, password

import urllib.request, urllib.parse, urllib.error


from fieldmap import *

##---------------------------------------------------------------------------------------
      
def uuid_from_uri( uri, full=False ): #{
   if full:
      return "uuid_" + uri.split("/")[-1]
   else:
      return uri.split("/")[-1]
#}
#-----------------------------------------------------------------------------------------------------

def get_records_from_solr( uids, selected_fields='*' ): #{

   # You must pass in the 'uids' parameter as a list.

   # By default this function returns all fields, but optionally you can pass in 'selected_fields' 
   # as a comma-separated string or a list.

   # Results come back as two dictionaries nested inside each other.
   # The outer dictionary is keyed on uuid, the inner one on fieldname.

   results = {}

   uuids_ids = []
   for uid in uids:
      if uid != '':
         uuids_ids.append( uid.split("/")[-1].split("_")[-1] ) # Divide up either http://localhost/person/{UUID} or uuid_{UUID}

   uuids_ids = list({}.fromkeys(uuids_ids).keys())

   total = len( uuids_ids )
   if total > 0 :
      # print "I'm hitting solr for " + str(total) + " records..."

      # Make sure that list of selected fields includes 'id', which is essential.
      if selected_fields != '*':
         selected_fields.append( 'id' )

      sol = solr.SolrConnection( solrconfig.solr_urls["all"] )

      limit = 100
      count = 0
      q = "uuid:("

      while total > count :

        res = sol.query( q + " ".join(uuids_ids[count:count+limit]) + ")",
                         score=False, rows=limit, start=0, fields=selected_fields )

        for result in res.results:
           results[result['id']] = result

        count += limit
      
      sol.close()

   return results
#}
#-----------------------------------------------------------------------------------------------------

def escape_colons( value ): #{

  # Put a backslash in front of every colon.
  # But make sure we don't end up with backslashes getting doubled and tripled
  value = unescape_colons( value )

  return value.replace( ':', '\:' )
#}
#-----------------------------------------------------------------------------------------------------

def unescape_colons( value ): #{
  return value.replace( '\:', ':' )
#}
##----------------------------------------------------------------------------------------------
