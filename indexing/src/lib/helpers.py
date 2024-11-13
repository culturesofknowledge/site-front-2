# -*- coding: utf-8 -*-
"""Helper functions

Consists of functions to typically be used within templates, but also
available to Controllers. This module is available to templates as 'h'.
"""

import solr

import sys
if '../../workspace/indexing/src' not in sys.path:
    sys.path.insert(0, '../../workspace/indexing/src') # Add workspace files into path. TODO: Fix!
    
import solrconfig
# Import helpers as desired, or define your own, ie:
#from webhelpers.html.tags import checkbox, password

import feedparser, re
import urllib.request, urllib.parse, urllib.error


from fieldmap import *

#-----------------------------------------------------------------------------------------------------

def get_default_rows_per_page(): #{
  return 50
#}
##----------------------------------------------------------------------------------------

def get_defaults_for_advanced_search(): #{

  ##=========================================================================
  ## N.B. The names of form fields *must* be added to this list, 
  ## even if default value is blank, otherwise the field will NOT BE QUERIED.
  ##=========================================================================
  default_values = {
    "everything" : "all data",
    "aut" : "all senders",
    "aut_gend" : "all",
    "aut_org" : "false",
    "aut_mark" : "false",
    "aut_roles" : "all roles and titles",
    "rec" : "all recipients",
    "rec_gend" : "all",
    "rec_org" : "false",
    "rec_mark" : "false",
    "rec_roles" : "all roles and titles",
    "ment" : "all people mentioned",
    "ment_gend" : "all",
    "ment_org" : "false",
    "ment_roles" : "all roles and titles",
    "dat_comp" : "As Gregorian",
    "dat_sin_year" : "all years",
    "dat_sin_month" : "all months",
    "dat_sin_day" : "all dates",
    "dat_from_year" : "all years",
    "dat_from_month" : "all months",
    "dat_from_day" : "all dates",
    "dat_to_year" : "all years",
    "dat_to_month" : "all months",
    "dat_to_day" : "all dates",
    "dat_aro_year" : "all years",
    "dat_aro_month" : "all months",
    "dat_aro_day" : "all dates",
    "dat_aro_day_extend_by" : "0",
    "dat_aro_day_extend" : "years",
    "pla_ori_name" : "all origins",
    'pla_ori_mark' : "false",
    "pla_des_name" : "all destinations",
    'pla_des_mark' : "false",
    "pla_ment_name" : "all places mentioned",
    "repository" :"all repositories",
    "let_ima" : "false",
    "let_abst" : "false",
    "let_trans" : "false",
    "let_con" : "all content",
    'let_type': "all types",
    "let_lang" : "all languages",
    "let_shel" : "all shelfmarks",
    "let_pap_siz" : "false",
    "let_pap_siz_tex" : "all paper sizes",
    "let_pap_typ" : "false",
    "let_pap_typ_tex" : "all paper types",
    "let_page" : "false",
    "let_page_min" : "0",
    "let_seal" : "false",
    "let_seal_tex" :  "all seals", 
    "let_en" : "false",
    "let_with_en" : "false",
    "let_with_en_tex" : "all enclosures",
    "let_pe" : "false",
    "let_pe_tex" : "all printed editions",
    "let_pmark" : "false",
    "let_pmark_tex" : "all postage marks",
    "let_end" : "false",
    "let_end_tex" : "all endorsements",
    "col_cat" : "all catalogues",
    "cat_group" : "empty",
    "search_type" : "advanced",
    "people" : "all people",
    "people_gend" : "all",
    "people_roles" : "all roles and titles",
    "agent_org" : "false",
    "locations" : "all places",
    "rows" : str( get_default_rows_per_page() ),
    "start" : "0",
    "sort" : "date-a",
    get_author_uri_fieldname() : None,
    get_addressee_uri_fieldname() : None,
    get_origin_uri_fieldname(): None,
    get_destination_uri_fieldname(): None,
    get_relations_to_people_mentioned_fieldname(): None,
    get_relations_to_places_mentioned_fieldname(): None,
    get_shelfmark_fieldname(): None,
    get_catalogue_fieldname(): None
  }

  return default_values
#}
##---------------------------------------------------------------------------------------

def get_default_value_for_field( fieldname ): #{

  all_defaults = get_defaults_for_advanced_search()
  default_value = all_defaults.get( fieldname, None )
  return default_value
#}
##---------------------------------------------------------------------------------------

def get_single_date_fields(): #{

  single_date_fields = {
  }
  return single_date_fields
#}
##---------------------------------------------------------------------------------------

def get_simple_query_fields(): #{  # These are the fields where we can just add the value from the
                                   # request straight into the query without further manipulation.

  simple_query_fields = {}

  # People
  simple_query_fields[ 'aut_roles' ] = get_author_roles_fieldname() 
  simple_query_fields[ 'rec_roles' ] = get_addressee_roles_fieldname() 
  simple_query_fields[ 'ment'      ] = get_details_of_agent_mentioned_fieldname() 
  simple_query_fields[ 'ment_roles'] = get_agent_mentioned_roles_fieldname() 

  # Places
  simple_query_fields[ 'pla_ment_name' ] = get_placename_mentioned_fieldname() 

  # Languages
  simple_query_fields[ 'let_lang' ] = get_language_fieldname()

  # Manifestations
  simple_query_fields[ 'let_pe_tex'      ] = get_manif_printed_edition_fieldname()
  simple_query_fields[ 'let_pap_siz_tex' ] = get_manif_paper_size_fieldname()
  simple_query_fields[ 'let_pap_typ_tex' ] = get_manif_paper_type_fieldname()
  simple_query_fields[ 'let_seal_tex'    ] = get_manif_seal_fieldname()
  simple_query_fields[ 'let_pmark_tex'   ] = get_manif_postage_mark_fieldname()
  simple_query_fields[ 'let_end_tex'     ] = get_manif_endorsements_fieldname()
  simple_query_fields[ 'let_shel'        ] = get_manif_shelfmark_fieldname()

  return simple_query_fields
#}
##---------------------------------------------------------------------------------------

def get_simple_boolean_checkboxes(): #{  # If these checkboxes are ticked, add 'true' to the query

  simple_boolean_checkboxes = {}

  # 'Is organisation' checkboxes
  simple_boolean_checkboxes[ 'aut_org'  ] = get_author_is_org_fieldname() 
  simple_boolean_checkboxes[ 'rec_org'  ] = get_addressee_is_org_fieldname() 
  simple_boolean_checkboxes[ 'ment_org' ] = get_agent_mentioned_is_org_fieldname() 

  return simple_boolean_checkboxes
#}
##---------------------------------------------------------------------------------------

def get_multi_search_fields(): #{ # Form fields like 'people' which search multiple Solr fields
                                  # using 'or', e.g. 'author = X or recipient = X'.
  multi_search_fields = {}

  # Letter contents
  multi_search_fields[ 'let_con' ] = [ get_abstract_fieldname(), 
                                       get_keywords_fieldname(),
                                       get_incipit_fieldname(),
                                       get_excipit_fieldname(),
                                       get_postscript_fieldname() ]

  # People: authors or senders
  multi_search_fields[ 'people' ] = [ get_person_with_author_role_fieldname(),
                                      get_person_with_addressee_role_fieldname(),
                                      get_details_of_agent_mentioned_fieldname() ]

  multi_search_fields[ 'people_gend' ] = [ get_author_gender_fieldname(),
                                           get_addressee_gender_fieldname(),
                                           get_person_mentioned_gender_fieldname() ]

  multi_search_fields[ 'people_roles' ] = [ get_author_roles_fieldname(),
                                            get_addressee_roles_fieldname(),
                                            get_agent_mentioned_roles_fieldname() ]

  multi_search_fields[ 'agent_org'  ] = [ get_author_is_org_fieldname(),
                                          get_addressee_is_org_fieldname(),
                                          get_agent_mentioned_is_org_fieldname() ]

  # Places: origins or destinations
  multi_search_fields[ 'locations' ] = [ get_placename_of_origin_fieldname(), 
                                         get_placename_of_destination_fieldname(),
                                         get_placename_mentioned_fieldname() ]

  # Manifestations with enclosures (letters and non-letters)
  multi_search_fields[ 'let_with_en_tex' ] = [ get_manif_with_enclosure_fieldname(), 
                                               get_manif_non_letter_enclosures_fieldname() ]

  # Single dates - can be START or END of date range
  multi_search_fields[ 'dat_sin_year'  ] = [ get_start_year_fieldname(),
                                             get_end_year_fieldname() ]

  multi_search_fields[ 'dat_sin_month' ] = [ get_start_month_fieldname(),
                                             get_end_month_fieldname() ]

  multi_search_fields[ 'dat_sin_day'   ] = [ get_start_day_fieldname(),
                                             get_end_day_fieldname() ]


  return multi_search_fields
#}
##---------------------------------------------------------------------------------------

def get_exact_match_fields(): #{  # These are the fields which are typically selected from a dropdown
                                  # list, so the capitalisation etc is already right. Enclose in quotes.

  exact_match_fields = {}

  # People
  exact_match_fields[ 'aut_gend' ] = get_author_gender_fieldname() 
  exact_match_fields[ 'rec_gend' ] = get_addressee_gender_fieldname()
  exact_match_fields[ 'ment_gend'] = get_person_mentioned_gender_fieldname()

  # Works
  exact_match_fields[ 'col_cat'  ] = get_catalogue_fieldname()

  # This version of the 'catalogue' search is needed for faceting.
  exact_match_fields[ get_catalogue_fieldname() ] = get_catalogue_fieldname()

  # Manifestations
  exact_match_fields[ 'let_type' ] = get_manif_doc_type_fieldname()
  exact_match_fields['repository'] = get_manif_repository_fieldname()

  return exact_match_fields
#}
##---------------------------------------------------------------------------------------

def get_anything_non_blank_fields(): #{  # These are checkboxes for queries like 'get any letters with
                                         # images' or 'any letters with postage marks'. Often they are
                                         # in a pair with another field, e.g. 'Text of specific postage
                                         # mark'. Only add 'get anything' to query if there is no value
                                         # in the 'get specific piece of text' field.

  anything_non_blank_fields = {}

  # Letters with images
  anything_non_blank_fields[ 'let_ima' ] =     { 'search': get_manif_has_image_fieldname(),
                                                 'replaced_by': '' }
  # Letters with abstracts
  anything_non_blank_fields[ 'let_abst'] =     { 'search': get_abstract_fieldname(),
                                                 'replaced_by': '' }
  # Letters with transcriptions
  anything_non_blank_fields[ 'let_trans']=     { 'search': get_transcription_url_fieldname(),
                                                 'replaced_by': '' }
  # Printed editions
  anything_non_blank_fields[ 'let_pe' ] =      { 'search': get_manif_printed_edition_fieldname(),
                                                 'replaced_by': 'let_pe_tex' }
  # Paper size
  anything_non_blank_fields[ 'let_pap_siz' ] = { 'search': get_manif_paper_size_fieldname(),
                                                 'replaced_by': 'let_pap_siz_tex' }
  # Paper type
  anything_non_blank_fields[ 'let_pap_typ' ] = { 'search': get_manif_paper_type_fieldname(),
                                                 'replaced_by': 'let_pap_typ_tex' }
  # Seal
  anything_non_blank_fields[ 'let_seal' ] =    { 'search': get_manif_seal_fieldname(),
                                                 'replaced_by': 'let_seal_tex' }
  # Postage marks
  anything_non_blank_fields[ 'let_pmark' ] =   { 'search': get_manif_postage_mark_fieldname(),
                                                 'replaced_by': 'let_pmark_tex' }
  # Endorsements
  anything_non_blank_fields[ 'let_end' ] =     { 'search': get_manif_endorsements_fieldname(),
                                                 'replaced_by': 'let_end_tex' }

  # Manifestations with enclosures (letters and non-letters)
  anything_non_blank_fields[ 'let_with_en' ] = { 'search': [ get_manif_with_enclosure_fieldname(), 
                                                             get_manif_non_letter_enclosures_fieldname() ],
                                                 'replaced_by': 'let_with_en_tex' }
  # Enclosed letters in another manifestation
  anything_non_blank_fields[ 'let_en' ] =      { 'search': get_manif_enclosed_fieldname(),
                                                 'replaced_by': '' }

  return anything_non_blank_fields
#}
##---------------------------------------------------------------------------------------

def get_std_vs_as_marked_fields(): #{  # Fields where by default you search on the standardised name of
                                       # the author, destination, etc. However, if the 'As marked' checkbox
                                       # has been ticked, search the 'as marked' version of the name.

  std_vs_as_marked_fields = {}

  # Author
  std_vs_as_marked_fields[ 'aut' ] = { 'std_search': get_person_with_author_role_fieldname(),
                                       'as_marked_checkbox': 'aut_mark',
                                       'as_marked_search': get_author_as_marked_fieldname() }

  # Recipient/addressee
  std_vs_as_marked_fields[ 'rec' ] = { 'std_search': get_person_with_addressee_role_fieldname(),
                                       'as_marked_checkbox': 'rec_mark',
                                       'as_marked_search': get_addressee_as_marked_fieldname() }

  # Place of origin
  std_vs_as_marked_fields[ 'pla_ori_name' ] = { 'std_search': get_placename_of_origin_fieldname(),
                                                'as_marked_checkbox': 'pla_ori_mark',
                                                'as_marked_search': get_origin_as_marked_fieldname() }

  # Destination
  std_vs_as_marked_fields[ 'pla_des_name' ] = { 'std_search': get_placename_of_destination_fieldname(),
                                                'as_marked_checkbox': 'pla_des_mark',
                                                'as_marked_search': get_destination_as_marked_fieldname() }

  return std_vs_as_marked_fields
#}
##---------------------------------------------------------------------------------------

def get_date_range_fields(): #{  # Fields for searching 'from date to date'.
                                 # Use a list to keep them in the right order.
                                 # Supply defaults if the form on the field is blank.

  date_range_fields = [ ( 'dat_from_year' , 1 ),
                        ( 'dat_from_month', 1 ),
                        ( 'dat_from_day'  , 1 ),
          
                        ( 'dat_to_year' , 9999 ),
                        ( 'dat_to_month', 12   ),
                        ( 'dat_to_day'  , 31   ) ]
      
  return date_range_fields
#}
##---------------------------------------------------------------------------------------

def get_shopping_basket_fields(): #{ # Search multiple URI-based Solr fields using 'or', e.g.
                                     # 'author = X or author = Y or recipient = X or recipient = Y'.
  shopping_basket_fields = {}

  # People: authors or senders, or mentioned in letters
  shopping_basket_fields[ 'people' ] = [ get_author_uri_fieldname(),
                                         get_addressee_uri_fieldname(),
                                         get_relations_to_people_mentioned_fieldname() ]

  # Places: origins or destinations, or mentioned in letters
  shopping_basket_fields[ 'locations' ] = [ get_origin_uri_fieldname(), 
                                            get_destination_uri_fieldname(),
                                            get_relations_to_places_mentioned_fieldname() ]

  return shopping_basket_fields
#}
##---------------------------------------------------------------------------------------

def build_advanced_query( requests ): #{

  global queries
  queries = []

  #=============================================================
  # Different types of form fields handled slightly differently:
  #=============================================================
  #
  # Queries on URIs (selected in Browse)
  #
  uri_fields = [ get_author_uri_fieldname(),
                 get_addressee_uri_fieldname(),
                 get_relations_to_people_mentioned_fieldname(),
                 get_origin_uri_fieldname(),
                 get_destination_uri_fieldname(),
                 get_relations_to_places_mentioned_fieldname() ]
  for uri_fieldname in uri_fields: #{
    if uri_fieldname in requests: #{
      uri_value = requests[ uri_fieldname ]
      add_q( uri_fieldname, strip_value_prefix( uri_value, get_uri_value_prefix() ), queries ) 
    #}
  #}

  #===========================================
  #
  # Queries on simple text fields, where the values need no further manipulation
  #
  simple_query_fields = get_simple_query_fields()
  for form_field, solr_field in list(simple_query_fields.items()): #{
    if form_field in requests:
      add_q( solr_field, requests[ form_field ], queries ) 
  #}

  #===========================================
  #
  # Queries on simple Boolean checkboxes, where the value is 'true' if the checkbox is ticked.
  #
  simple_boolean_checkboxes = get_simple_boolean_checkboxes()
  for form_field, solr_field in list(simple_boolean_checkboxes.items()): #{
    if form_field in requests:
      add_q( solr_field, 'true', queries ) 
  #}

  #===========================================
  #
  # Form fields like 'people' which search multiple Solr fields using 'or', 
  # e.g. the user enters X in the 'people' field on the form, 
  # and we search for 'author = X or recipient = X'.
  #
  multi_search_fields = get_multi_search_fields() 
  for form_field, solr_fields in list(multi_search_fields.items()): #{
    if form_field in requests: #{
      values = [ requests[ form_field ] ] * len( solr_fields )
      add_q_multi( solr_fields, values, queries, " OR " )
    #}
  #}

  #===========================================
  #
  # 'Shopping basket' queries which search multiple Solr fields in a similar way to the 'people' field,
  # but with multiple values for each Solr field. E.g. if the user has selected person X and person Y,
  # then we search for 'author = X or author = Y or recipient = X or recipient = Y'.
  #
  if 'shopping_basket' in requests and 'browsing' in requests: #{
    shopping_basket = requests[ 'shopping_basket' ]
    browsing = requests[ 'browsing' ] # browsing = object type such as people or locations.
    if browsing == 'organisations':   # has same fields as people
      browsing = 'people'
    shopping_basket_fields = get_shopping_basket_fields() 
    if browsing in shopping_basket_fields: #{  # we can do a search based on this object type
      uuids = shopping_basket.split( ',' ) # shopping basket is a comma-separated list of UUIDs
      num_uuids = len( uuids )
      num_shopping_basket_fields = len( shopping_basket_fields[ browsing ] )
      values = []
      for uuid in uuids: #{
        uri = uri_from_uuid( uuid )  # TODO: 2017-10-25 ("Hi Mat!) - WTF is this doing? Why is it hitting solr multiple times??
        one_uri_values = [ uri ] * num_shopping_basket_fields
        values.extend( one_uri_values )
      #}
      solr_fields = shopping_basket_fields[ browsing ] * num_uuids
      add_q_multi( solr_fields, values, queries, " OR " )
    #}
  #}

  #===========================================
  #
  # Queries on string fields, where the value from the form must exactly match the value in Solr.
  # Typically values are selected from a dropdown list so will be right. Enclose these in double quotes.
  #
  exact_match_fields = get_exact_match_fields()
  for form_field, solr_field in list(exact_match_fields.items()): #{
    if form_field in requests: #{
      request_value = requests[ form_field ]
      if request_value.startswith( '"' ) and request_value.endswith( '"' ): #{
        pass  # already enclosed in double quotes, so leave it as it is
      else:
        request_value = '"' + request_value.strip() + '"'
      #}
      add_q( solr_field, request_value, queries ) 
    #}
  #}

  #===========================================
  #
  # Checkboxes for queries like 'get any letters with images' or 'any letters with postage marks'. 
  # Often they are in a pair with another field, e.g. 'Text of specific postage mark'. 
  # Only add 'get anything' to query if there is no value in the 'get specific piece of text' field.
  #
  anything_non_blank_fields = get_anything_non_blank_fields()
  for form_field, fieldinfo in list(anything_non_blank_fields.items()): #{
    if form_field in requests: #{

      solr_field = fieldinfo[ 'search' ]
      replaced_by = fieldinfo[ 'replaced_by' ]

      find_anything = False
      if len( replaced_by ) == 0:
        find_anything = True
      elif not replaced_by in requests:
        find_anything = True

      if find_anything: #{
        if type( solr_field ) == str or type( solr_field ) == str: #{
          add_q( solr_field, '*', queries ) 
        #}
        elif type( solr_field ) == list: #{
          values = [ '*' ] * len( solr_fields )
          add_q_multi( solr_field, values, queries, " OR " )
        #}
      #}
    #}
  #}

  #===========================================
  #
  # Fields where by default you search on the standardised name of the author, destination, etc. 
  # However, if the 'As marked' checkbox has been ticked, search the 'as marked' version of the name.
  #
  std_vs_as_marked_fields = get_std_vs_as_marked_fields()
  for form_field, fieldinfo in list(std_vs_as_marked_fields.items()): #{
    if form_field in requests: #{

      std_search         = fieldinfo[ 'std_search' ]
      as_marked_search   = fieldinfo[ 'as_marked_search' ]
      as_marked_checkbox = fieldinfo[ 'as_marked_checkbox' ]

      if as_marked_checkbox in requests:
        add_q( as_marked_search, requests[ form_field ], queries ) 
      else:
        add_q( std_search, requests[ form_field ], queries ) 
    #}
  #}

  #===========================================
  #
  # Date ranges
  #
  date_range_fields = get_date_range_fields()
  date_range_query_entered = False
  for form_field, default_value in date_range_fields: #{
    if form_field in requests: #{
      date_range_query_entered = True
      break
    #}
  #}

  if date_range_query_entered: #{
    date_values = []

    for form_field, default_value in date_range_fields: #{
      date_value = requests.get( form_field, default_value )
      date_values.append( date_value )
    #}

    from_year  = date_values[ 0 ]
    from_month = date_values[ 1 ]
    from_day   = date_values[ 2 ]

    to_year  = date_values[ 3 ]
    to_month = date_values[ 4 ]
    to_day   = date_values[ 5 ]

    # Tidy up the data a bit more, 
    # as we could have defaulted to 31 days in a 30-day month or February.
    short_months = [ 2, 4, 6, 9, 11 ]
    if to_month in short_months: #{
      max_day = 30
      if to_month == 2: #{
        max_day = 28 # I just am not going to care about leap years, so there.
      #}
      if to_day > max_day: #{
        to_day = max_day
      #}
    #}
    
    q = "[%s-%s-%sT00:00:00Z TO %s-%s-%sT00:00:00Z]" % \
       ( from_year, from_month, from_day, to_year, to_month, to_day )

    add_q( "started_date_sort", q , queries ) 
  #}

  #===========================================
  #
  # Bits and bobs of manifestation stuff that
  # don't fit the standard patterns.
  #
    
  # Page count
  if 'let_page' in requests or 'let_page_min' in requests :
    if 'let_page_min' in requests :
      fieldname = escape_colons( get_manif_numpages_fieldname())
      value = requests[ 'let_page_min' ]
      queries.append( fieldname + ':[' + value + ' TO *]'  ) # range query
    else :
      add_q( get_manif_numpages_fieldname(), '*', queries )
    #endif
  #endif
  
  if 'cat_group' in requests :

    cat_field = escape_colons( get_catalogue_fieldname() )  

    cat_group_q = cat_field + ': ("' + '" OR "'.join(requests['cat_group'].split("|")) + '")' 
    queries.append( cat_group_q )
  
  #========================
  # Put full query together
  #========================
  query_full = ''
  
  first = True
  for query in queries :
    if query != '' :
      if not first:
        query_full += " AND "
      #endif
      query_full += "(" + query + ")"
      first = False
    #endif
  #endfor

  if not query_full or query_full == '':
    query_full = "*:*"
  else :
    query_full = "{!q.op=AND}" + query_full
  #endif

  ##print query_full  # N.B. KEEP THIS COMMENTED OUT ON THE LIVE SYSTEM!
  return query_full
#}
##----------------------------------------------------------------------------------------

def build_quick_query( everything, object_type = None, catalogue = None ): #{
  
  q_list = []
  fields = {}

  if everything and everything != '':
    q_list.append( "default_search_field: (" + escape_colons( everything.strip()) + ")" )
    fields['everything'] = { 'value' : everything, 'name' : "Text" }
  #endif
    
  if object_type :
    q_list.append( "object_type: (" + object_type.strip().lower() + ")" )
    fields['object_type'] = { 'value' : object_type, 'name' : "Object Type" } 
  #endif
  
  if catalogue :
    catg_fieldname = get_catalogue_fieldname()
    q_list.append( escape_colons( catg_fieldname ) + ': ("' + escape_colons( catalogue.strip()) + '")' )
    fields[ catg_fieldname ] = { 'value' : catalogue, 'name' : "Catalogue" } 
  #endif
    
  if len(q_list) == 0:
    q = "*:*"
  else :
    q = " AND ".join( q_list )
  #endif
    
  retvals = { 'the_query': q, 'fields': fields }
  return retvals
#}
##----------------------------------------------------------------------------------------
    
def join_field_and_value_to_q(  field, value ) : #{
  return "".join(  (field.replace(":", "\:"), ":(", escape_colons( value ), ")") )
#}
##----------------------------------------------------------------------------------------
  
def add_q(  field, value, list ): #{

  if value.strip(): #{ # avoid adding a blank value to the query, it causes a server error
    list.append( join_field_and_value_to_q( field, value ) )
  #}
#}
##----------------------------------------------------------------------------------------
 
def add_q_multi(  fields, values, list, connect ): #{

  q = []
  for i in range( len( fields ) ):
    if values[i].strip(): #{ # avoid adding a blank value to the query, it causes a server error
      q.append( join_field_and_value_to_q( fields[i], values[i] ) )
    #}
  #endfor

  if len( q ) > 0:
    list.append( connect.join( q ) )
#}
##----------------------------------------------------------------------------------------

def query_url(baseurl,fields_list,add='',remove=''): #{
   ## Create url for querying, add and remove specific items (useful in facet code)
   ## e.g. url( "/forms/quick", { "everything" : { value : "hello" } }, add=['year','1664'], remove='everything' )

   fields = []
   
   afterfirst = False  
   for field,details in fields_list.items() :
      if field != remove :
         fields.append( field.replace(':','%3A') + "=" + details['value'] )

   if add != '' : #{  # if non-blank, will be a list which may contain integers as well as strings
      addfield = add[0]
      addval = add[1]
      if type( addval ) != str and type( addval ) != str:
        addval = str( addval )
      fields.append( addfield + "=" + addval )
   #}

   if len(fields) :
      return baseurl + "?" + "&".join(fields)
   else :
      return baseurl

#}
#-----------------------------------------------------------------------------------------------------
      
def uuid_from_uri( uri, full=False ): #{
   if full:
      return "uuid_" + uri.split("/")[-1]
   else:
      return uri.split("/")[-1]
#}
#-----------------------------------------------------------------------------------------------------
      
def uuid_from_id( id ): #{
   return id.split('_')[-1]
#}
#-----------------------------------------------------------------------------------------------------

def strip_value_prefix( full_string, prefix = '' ): #{  # could be used for UUID, URI, shelfmark etc.

  retval = full_string
  plength = len( prefix )

  # Either strip off a specified prefix
  if plength > 0: #{
    if full_string.startswith( prefix ): #{
      retval = full_string[ plength : ]
    #}
  #}

  # Or strip off everything up to and including the first colon
  else: #{
    if '_' in full_string: #{
      parts = full_string.split( '_' )
      plength = len( parts[ 0 ] ) + 1
      retval = full_string[ plength : ]
    #}
  #}
    
  return retval
#}
#-----------------------------------------------------------------------------------------------------

def get_item_from_uri( uri ): #{  # gets all the fields for the record

  item = {}
  uuid = uuid_from_uri( uri, True )
  item_dict = get_records_from_solr( [ uuid ] )
  #for keyfield, datafields in item_dict.iteritems():
  #  item = datafields
  #  break
  #endfor
  if uuid in item_dict:
    return item_dict[uuid]

  return item
#}
##----------------------------------------------------------------------------------------------
   
def image_url( current_url ): #{

   # Images that are on our OWN server will be under /scans from the web-server's point of view.
   # Then there is a catalogue-related subdirectory, e.g. lister. The filenames will be passed from 
   # the editing interface starting with /lister etc, which will be converted to /scans/lister.
   # But DON'T prefix the URL with /scans if it is actually is a link to another server such as the NHM.

   if current_url.startswith( 'http' ):
     new_url = current_url
   else:
     new_url = "/scans" + current_url

   return new_url
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


def get_related_records_from_solr( uuids_ids, selected_fields='*' ): #{

    # You must pass in the 'uids' parameter as a list of uuids only.

    # By default this function returns all fields, but optionally you can pass in 'selected_fields'
    # as a comma-separated string or a list.

    # Results come back as two dictionaries nested inside each other.
    # The outer dictionary is keyed on uuid, the inner one on fieldname.

    results = {}

    total = len( uuids_ids )
    if total > 0 :

        # Make sure that list of selected fields includes 'id', which is essential.
        if selected_fields != '*':
            selected_fields.append( 'id' )

        sol = solr.SolrConnection( solrconfig.solr_urls["all"] )

        limit = 100
        count = 0
        q = "uuid_related:("

        while total > count :

            res = sol.query( q + " ".join(uuids_ids[count:count+limit]) + ")",
                             score=False, rows=999999, start=0, fields=selected_fields )  # Note: This can theoretically return a LOT of results - use it wisely...

            for result in res.results:
                results[result['id']] = result

            count += limit

        sol.close()

    return results
#}
#-----------------------------------------------------------------------------------------------------


def profile_url_from_uri( uri_profile ): #{

   uri = uri_profile.replace( "uri_http://localhost", "/profile" )
   uri = uri.replace( "http://localhost", "/profile" )
   
   return uri
#}
#-----------------------------------------------------------------------------------------------------

def uri_from_uuid( uuid ): #{

  uri = ''
  results = get_records_from_solr( [uuid], ['object_type'] )

  # 'Get records from solr' returns 2 dictionaries nested inside each other:
  # (1) keyed on UUID (2) keyed on fieldname

  if len( results ) == 1:  #{ # it should be!
    for keyval, field_dict in list(results.items()): #{
      object_type = field_dict[ 'object_type' ]
      stripped_uuid = strip_value_prefix( uuid, get_uuid_value_prefix() )
      uri = 'http://localhost/' + object_type + '/' + stripped_uuid
    #}
  #}
  return uri
#}
#-----------------------------------------------------------------------------------------------------

def get_news_feed(): #{
   feed_details = {}
   default = {}
   default['link'] = "http://cofk.history.ox.ac.uk/cultures-of-knowledge-receives-further-grant/"
   default['title'] = "Cultures of Knowledge Receives Further Grant"
   default['summary'] = "We are delighted to report that Cultures of Knowledge has been awarded a further grant of $758,000 from the Scholarly Communications and Information Technology program of The Andrew W. Mellon Foundation, for the period from 1 January 2013 to 31 December 2014."
   default['date'] = '14 September 2012'
   default['image'] = "http://cofk.history.ox.ac.uk/wp-content/uploads/2011/12/emlo_logo_infrastructure.png"
   return default # Just return the defaults, getting the remote records is reallyy slow....

   new=False
   try:
      cofk_news_feed = "http://cofk.history.ox.ac.uk/tag/union-catalogue-news/"
      feed = feedparser.parse( cofk_news_feed )
      item = feed['entries'][0]
      if feed['bozo'] == 1:
         feed_details = default
      elif item.link.strip() and item.title.strip():
         feed_details['link'] = item.link.strip()
         feed_details['title'] = item.title.strip()
         feed_details['summary'] = item.summary.strip() 
         month=['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
         feed_details['date'] = "%2d-%s-%4d"%(item.updated_parsed.tm_mday, month[item.updated_parsed.tm_mon], item.updated_parsed.tm_year)
         new=True
      else:
         feed_details = default
   except:
      feed_details = default
   if new:
      try:
         img_str = re.findall('<img.*?\>', item.content[0].value)
         if img_str:
            src_str = re.findall('src="(.*?)"', img_str[0])
         if src_str:
            feed_details['image'] = src_str[0].strip()
      except:
         feed_details['image'] = default['image']
   return feed_details
#}
#-----------------------------------------------------------------------------------------------------

def get_rotw(): #{
   feed_details = {}
   default = {}
   default['link'] = "http://cofk.history.ox.ac.uk/record-of-the-week-things-that-go-bump-in-the-night/"
   default['title'] = "Letters in Focus: Things That Go Bump in the Night"
   default['summary'] = "So, the evenings draw in, All Hallows’ Eve is upon us, and I find myself creeping through autumnal mists to the Bodleian’s Special Collections in search of ghosts."
   default['date'] = '29 October 2012'
   default['image'] = "http://cofk.history.ox.ac.uk/wp-content/uploads/2012/11/Ghost.png"

   return default # Just return the default - getting the other records is really slow....

   new=False
   try:
      cofk_news_feed = "http://cofk.history.ox.ac.uk/tag/letters-in-focus/"
      feed = feedparser.parse( cofk_news_feed )
      item = feed['entries'][0]
      if feed['bozo'] == 1:
         feed_details = default
      elif item.link.strip() and item.title.strip():
         feed_details['link'] = item.link.strip()
         feed_details['title'] = item.title.strip()
         feed_details['summary'] = item.summary.strip() 
         month=['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
         feed_details['date'] = "%2d-%s-%4d"%(item.updated_parsed.tm_mday, month[item.updated_parsed.tm_mon], item.updated_parsed.tm_year)
         new=True
      else:
         feed_details = default
   except:
      feed_details = default
   if new:
      try:
         img_str = re.findall('<img.*?\>', item.content[0].value)
         if img_str:
            src_str = re.findall('src="(.*?)"', img_str[0])
         if src_str:
            feed_details['image'] = src_str[0].strip()
      except:
         feed_details['image'] = default['image']
   return feed_details
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
#-----------------------------------------------------------------------------------------------------

def remember_orig_query( the_query, new_start_row = None, total_found = None ): #{
  #--------------------------------------------------------------------------------------------------
  # The parameter 'the query' is passed in from c.query in result.mako.
  #--------------------------------------------------------------------------------------------------
  # The query is a dictionary, with other nested dictionaries inside it (nested to 3 levels), 
  # e.g. the following is a query in advanced mode, where we have asked for the Comenius catalogue
  # and letters sent from Leszno. The data is sorted by date (ascending), there are 25 rows per page,
  # and we have already jumped to the 4th page, so to row 100 (remember this is an index starting 0).
  #--------------------------------------------------------------------------------------------------
  # N.B. The 'sort' parameter appears as a free-standing parameter AND can appear in 'fields'.
  #--------------------------------------------------------------------------------------------------
  # {
  #   'sort'   : 'date-a', 
  #   'rows'   : '25', 
  #   'fields' : { 'start'       : {'name': 'Start', 'value': u'100'}, 
  #                'pla_ori_name': {'name': 'Pla_ori_name', 'value': u'leszno'}, 
  #                'col_cat'     : {'name': 'Col_cat', 'value': u'Comenius catalogue'} },
  #   'baseurl': '/forms/advanced', 
  #   'start'  : u'100', 
  #   'type'   : 'advanced' 
  # }
  #--------------------------------------------------------------------------------------------------


  query_string = ''
  already_got_sort = False

  for key, val in list(the_query.items()): #{

    if type( val ) == str or type( val ) == str:  #{ # simple key-value pairs
      if query_string > '':
        query_string = query_string + '&'

      if key.lower() == 'start' and new_start_row != None:
        val = str( new_start_row )

      if key.lower() == 'sort' and val != '':
        already_got_sort = True

      query_string = query_string + key + '=' + minimal_urlencode( val )
    #}

    elif key == 'fields': #{ # Fields seem to consist of 2 levels of nested dictionary 
                             # WITH TWO TUPLES INSIDE THAT! First tuple=name, 2nd tuple=value 
      for fieldname, fielddict in list(val.items()): #{
        if fieldname.lower() == 'start': # probably want to avoid duplication?
          continue

        if fieldname.lower() == 'sort' and already_got_sort: # avoid duplication
          continue

        for name_or_value, queryval in list(fielddict.items()): #{  
          if name_or_value == 'value': #{
            if query_string > '':
              query_string = query_string + '&'
            query_string = query_string + fieldname + '=' + minimal_urlencode( queryval )
            break
          #}
        #}
      #}
    #}
  #}

  if total_found != None: #{
    if query_string > '':
      query_string = query_string + '&'
    query_string = query_string + 'numFound=' + total_found

    if not '&start=' in query_string and not '?start=' in query_string: #{
      if new_start_row == None:
        new_start_row = '0'
      query_string = query_string + '&start=' + new_start_row
    #}
  #}

  if query_string > '': #{
    query_string = '?' + query_string
  #}

  return query_string

#}  # end remember_orig_query()
#-----------------------------------------------------------------------------------------------------

def get_field_to_sort_by( sort_selected ): #{

  if sort_selected != False :
    if sort_selected == 'date-a' :
      sort = "started_date_sort asc,score desc"
    elif sort_selected == 'date-d' :
      sort = "started_date_sort desc,score desc"
    elif sort_selected == 'author-a' :
      sort = "author_sort asc,score desc"
    elif sort_selected == 'author-d' :
      sort = "author_sort desc,score desc"
    elif sort_selected == 'recipient-a' :
      sort = "recipient_sort asc,score desc"
    elif sort_selected == 'recipient-d' :
      sort = "recipient_sort desc,score desc"
    elif sort_selected == 'origin-a' :
      sort = "origin_sort asc,score desc"
    elif sort_selected == 'origin-d' :
      sort = "origin_sort desc,score desc"
    elif sort_selected == 'destination-a' :
      sort = "destination_sort asc,score desc"
    elif sort_selected == 'destination-d' :
      sort = "destination_sort desc,score desc"
    #endif

  else :
    sort = "started_date_sort asc,score desc"
    sort_selected = 'date-a'
  #endif
    
  return sort_selected, sort
#}
##----------------------------------------------------------------------------------------

def get_parm_value_from_request( request, required_parm ): #{  

  # Note: mako files can get request as: from pylons import request
  for parm_tuple in request.params.items(): #{
    parm_name  = parm_tuple[0]
    parm_value = parm_tuple[1]
    if parm_name == required_parm: #{
      return parm_value
    #}
  #}

  # If you've reached this point, required parameter was not found in GET.
  if required_parm == 'start':  # use default
    parm_value = '0'
  else:
    parm_value = ''

  return parm_value
#}
##----------------------------------------------------------------------------------------

def link_to_another_record( request, jump = 1 ): #{

  link_to_record = ''
  query_string = ''

  # Let's get our request parameters into a simple dictionary that we can access more easily
  parms = get_request_params_as_dict( request )

  if 'type' not in parms:
    parms['type'] = ''

  # Different Solr core and sorting for 'quick' vs. 'advanced' search
  if parms[ 'type' ] == 'quick': #{
    solr_core = 'all'
    order_by = "score desc"
    parms['sort'] = 'score-d'  
  #}
  else: #{
    solr_core = 'works'
    parms['sort'], order_by = get_field_to_sort_by( parms[ 'sort' ] )
  #}

  # Note down the values from the original query, including the row you are currently on ('start').
  if 'start' in parms:
    start_index = int( parms[ 'start' ] )
  else: #{
    start_index = 0
    parms['start'] = '0'
  #}

  total_records_found = int( parms[ 'numFound' ] )
  rows_per_page = get_default_rows_per_page()

  #-------------------------------------------
  # Work out which row you want to go to next.
  #-------------------------------------------
  new_start_index = start_index + jump

  if new_start_index >= total_records_found:
    new_start_index = total_records_found
  elif new_start_index < 0:
    new_start_index = 0

  new_start_index = str( new_start_index )

  #----------------------------------------------------------
  # Connect to Solr and retrieve the data for the next record
  #----------------------------------------------------------
  sol = solr.SolrConnection( solrconfig.solr_urls[ solr_core ] )

  if parms[ 'type' ] == 'quick': #{
    query_retvals = build_quick_query( parms.get('everything') ) # TODO: This correction might be allowing bots to get at other parts of the site which are causing numerous errors and overwhelming the machine... parms.get('everything') )
    q_statement = query_retvals[ 'the_query' ]
  #}
  else:
    q_statement = build_advanced_query( parms )

  fields_to_return = [ get_uuid_fieldname(), 'object_type' ]

  sol_response = sol.query( q_statement.encode( 'utf-8' ), fields = fields_to_return, \
                            start=new_start_index, rows=1, sort=order_by, facet='false' )

  #-------------------------------------------
  # Construct a URL linking to the next record
  #-------------------------------------------
  if len( sol_response.results ) > 0: #{
    item = sol_response.results[0]
    if get_uuid_fieldname() in item and 'object_type' in item: #{
      uuid = item[ get_uuid_fieldname() ]  # value may be prefixed with 'uuid:' so strip off
      object_type = item[ 'object_type' ]
      uuid_plus_prefix = uuid
      uuid = strip_value_prefix( uuid, get_uuid_value_prefix() )
      link_to_record = '/profile/' + object_type + '/' + uuid 

      #-----------------------------------------------------------
      # If it's a comment or a related resource, drill down 
      # into the work or person being commented on etc.
      #-----------------------------------------------------------
      if object_type == 'comment' or object_type == 'resource' : #{

        #------------------------------------------------------------------------------------
        # Will need to re-get the data, as we need to know lots more info in this case,
        # i.e. in order to link from the comment or resource to the work, person or whatever.
        # So don't restrict our field selection to UUID and object type any more.
        #------------------------------------------------------------------------------------
        q_statement = ''
        q_statement = join_field_and_value_to_q( get_uuid_fieldname(), uuid_plus_prefix )

        sol_response = sol.query( q_statement.encode( 'utf-8' ), start=0, rows=1, facet='false' )
        item = sol_response.results[0]

        related_object_dict = get_related_obj_from_comment_or_resource( item )

        if 'uri' in related_object_dict: #{
          related_object_uri = related_object_dict[ 'uri' ]

          ## Overwrite the original 'link to record' variable
          if related_object_uri != '':
            link_to_record = profile_url_from_uri( related_object_uri )
        #}
      #}

      #---------------------------------------------
      # Now add the query string for the next record
      #---------------------------------------------
      parms[ 'start' ] = new_start_index

      query_string = '?'
      for parmkey, parmvalue in list(parms.items()): #{
        if query_string != '?':
          query_string = query_string + '&'
        query_string = query_string + parmkey + '=' + minimal_urlencode( parmvalue )
      #}
    #}
  #}

  sol.close()
  return link_to_record + query_string
#}
#-----------------------------------------------------------------------------------------------------

def get_request_params_as_dict( request ): #{

  # Let's get our request parameters into a simple dictionary that we can access more easily
  parms = {}
  for parm_tuple in request.params.items(): #{
    parm_name  = parm_tuple[0]
    parm_value = parm_tuple[1]
    parms[ parm_name ] = parm_value
  #}
  return parms
#}
#-----------------------------------------------------------------------------------------------------

def get_related_obj_from_comment_or_resource( item ): #{

  # The variable 'item' is a dictionary of field name/value pairs
  object_type = item[ 'object_type' ]

  related_object_dict = {}
  related_object_uri = ''
  rel = ''

  if object_type == 'comment': #{

    possible_relations = { 'work'  : [ get_work_commented_on_fieldname(),
                                       get_work_with_comment_on_date_fieldname(),
                                       get_work_with_comment_on_author_fieldname(),
                                       get_work_with_comment_on_addressee_fieldname(),
                                       get_works_with_comments_on_people_mentioned_fieldname() ],

                           'person': [ get_person_commented_on_fieldname() ],

                           'location': [ get_place_commented_on_fieldname() ],

                           'manifestation': [ get_manifestation_commented_on_fieldname() ],
                         }

  else:
    possible_relations = { 'work'  : [ get_work_related_to_resource_fieldname() ],
                           'person': [ get_person_related_to_resource_fieldname() ] }
  #}

  for check_obj_type in possible_relations:
    for rel in possible_relations[ check_obj_type ]:
      found_key = False
      if rel in item and len( item[ rel ] ) > 0:
        found_key = True
        related_object_uri = item[ rel ][0]
        break
      #endif
    #endif
    if found_key == True:
      break
    #endif
  #endfor

  if found_key == False:
    rel = ''

  related_object_dict = { 'uri': related_object_uri, 'relationship': rel }
  return related_object_dict
#}
##----------------------------------------------------------------------------------------------

def minimal_urlencode( the_string ): #{

  replace_these = [ ':', '/', '.', '?', '&', '#' ]
  for replace_this in replace_these: #{
    if replace_this in the_string: #{
      replacement = urllib.parse.quote( replace_this )
      the_string = the_string.replace( replace_this, replacement )
    #}
  #}
  return the_string
#}
##----------------------------------------------------------------------------------------------
   
def get_repository_name_list(): #{

  sol = solr.SolrConnection( solrconfig.solr_urls["institutions"] )

  q = '*:*'
  res = sol.query( q, fields=get_repository_name_fieldname(), \
                   start=0, rows=1000, score=False )

  repos_list = []
  for result in res:
    repos_list.append( result[ get_repository_name_fieldname() ] )
  sol.close()

  repos_list.sort()
  return repos_list
#}
#-----------------------------------------------------------------------------------------------------

def get_max_relations_for_profile( object_type = '' ): #{

  if object_type == 'institution':
    return 10000
  else:
    return 10000
#}
##----------------------------------------------------------------------------------------

def get_uri_field_to_form_field(): #{

  uri_field_to_form_field = {

    get_author_uri_fieldname()                   : ( "aut",  "person" ),
    get_addressee_uri_fieldname()                : ( "rec",  "person" ),
    get_relations_to_people_mentioned_fieldname(): ( "ment", "person" ),

    get_origin_uri_fieldname()                   : ( "pla_ori_name", "location" ),
    get_destination_uri_fieldname()              : ( "pla_des_name", "location" ),
    get_relations_to_places_mentioned_fieldname(): ( "pla_ment_name","location" ),
  }

  return uri_field_to_form_field
#}
##----------------------------------------------------------------------------------------

def get_list_of_catalogues(): #{

  cats = []

  sol_connection = solr.SolrConnection( solrconfig.solr_urls[ "works" ] )

  catalogue_fieldname = get_catalogue_fieldname()
  sol_response = sol_connection.query( "*:*", rows=0,  fl="-", score=False,
                                       facet='true', facet_limit=1000, facet_field=catalogue_fieldname )
  sol_connection.close()

  for catname, num in sol_response.facet_counts['facet_fields'][catalogue_fieldname].items(): #{
    cats.append( catname )
  #}

  cats.sort()

  # Put 'No catalogue specified' at the end of the list
  no_cat = 'No catalogue specified'
  if no_cat in cats: #{
    cats.remove( no_cat )
    cats.append( no_cat )
  #}

  return cats
#}
##----------------------------------------------------------------------------------------

def get_default_year_for_browse(): #{

  return '1600'
#}
##----------------------------------------------------------------------------------------

def sort_manifs_by_type( manif_uri_list ): #{

  # Check you've got the right sort of input: convert single string to list if necessary.
  if type( manif_uri_list ) == str or type( manif_uri_list ) == str: #{
    manif_uri_list = [ manif_uri_list ]
  #}
  if not type( manif_uri_list ) == list: #{
    print('Invalid input to sort_manifs_by_type()')
    return []
  #}

  # Initialise some variables
  manif_type_fieldname = get_manifestation_type_fieldname()
  uri_fieldname = get_uri_fieldname()
  fields_to_get = [manif_type_fieldname, uri_fieldname]

  manif_uuid_list = []
  sorted_list = []
  unsorted_list = []

  # Search by UUID because this is what the function "get_records_from_solr()" expects.
  for manif_uri in manif_uri_list: #{
    manif_uuid = uuid_from_uri( manif_uri, full=True )
    manif_uuid_list.append( manif_uuid )
  #}

  # The results come back as a dictionary of fieldnames within a dictionary of Solr IDs
  result_dict = get_records_from_solr( manif_uuid_list, fields_to_get )
  if len( result_dict ) == 0:
    return []

  # Transfer the results into a list of tuples, which we can sort on in a moment
  for one_record_dict in list(result_dict.values()): #{

    # Generate a sort column from manifestation type
    if manif_type_fieldname in one_record_dict :
      manif_type = one_record_dict[ manif_type_fieldname ]
      sortcol = manif_type
      if sortcol == 'Letter': # always put 'Letter' first, then the rest in alphabetic order
        sortcol = "AA%s" % sortcol
    else:
      sortcol = manif_type = "Letter"

    # All these ID fields such as URI, UUID etc tend to have a prefix *in the data*
    # showing what type of ID they are. Will strip this off so that it matches the value
    # found in the image further relations

    manif_uri = one_record_dict[ uri_fieldname ]
    manif_uri = strip_value_prefix( manif_uri, get_uri_value_prefix() )
    unsorted_list.append( (manif_uri, manif_type, sortcol) )
  #}

  # Sort the list
  sorted_list = sorted( unsorted_list, key = lambda manif : manif[ 2 ] )

  # Return a list of tuples, i.e. (manifestion URI, manifestion type, sort column)
  # The sort column corresponds to manifestation type but with 'Letter' coming first.
  return sorted_list
#}
##----------------------------------------------------------------------------------------

def get_content_fields(): #{ # e.g. abstract, incipit

  content_fields = []
  multi_search_fields = get_multi_search_fields()
  if 'let_con' in multi_search_fields:
    content_fields = multi_search_fields[ 'let_con' ]
  return content_fields
#}
##----------------------------------------------------------------------------------------

