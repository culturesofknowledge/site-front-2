# -*- coding: utf-8 -*-
import sys
import time

import solr
# import imp

# These two lines are hacks. They switch the default encoding to utf8 so that the command line will convert UTF8 + Ascii to UTF8
# imp.reload(sys)
# sys.setdefaultencoding("utf8")

import solrconfig

web_lib_path = 'lib'
sys.path.append( web_lib_path )
import fieldmap as f
from helpers import escape_colons

# We'll need the following strings again and again, so may as well make them global, I think.
# Convert ':' to '\:' for use in a Solr query
escaped_uri_fieldname = escape_colons( f.get_uri_fieldname())
escaped_uri_prefix = escape_colons( f.get_uri_value_prefix())
join_with_or = " OR " + escaped_uri_prefix

#================================================================

# Add sort terms to works
# - Get all the works.
# - Find the authors, recipients, origins and destinations of the work
# - Add each name to the work.

def find_uri( obj, uri ):
  uri_new = f.get_uri_value_prefix() + uri
  fn_uri = f.get_uri_fieldname()
  for item in obj :
    if item[fn_uri] == uri_new :
      return item

  return None
#}

#================================================================

def has_all_keys( dictionary, keys ):
  return set(keys).issubset(dictionary)
  #for key in keys:
  #  if key not in dictionary :
  #    return False

  #return True
#}
#================================================================

def add_additional( dict_to_be_expanded, key, value ): #{

  #===
  # The dictionary is keyed on fieldnames such as 'author_sort'.
  # If it does not already have a particular key, e.g. 'author_sort', then when you pass in a string,
  # the STRING can become the value of that key.

  # However, if the dictionary already has that key, then you must convert the value of the key
  # into a LIST, and append your string to that list.
  #===

  if key in dict_to_be_expanded : #{  # the fieldname is already in the dictionary

    # Get the value for this existing key from the dictionary
    currentitem = dict_to_be_expanded[ key ]

    # If the existing value is already a list, you can simply append your new value to it.
    if isinstance( currentitem, list) :
      dict_to_be_expanded[ key ].append( value )

    # If the existing value is a single string or something, convert to a list, then append the new value.
    else : #{
      dict_to_be_expanded[ key ] = [currentitem, value]
    #}
  #}

  else :
    # Fieldname is not yet in dictionary, so a simple value, e.g. a string, can become value of key.
    dict_to_be_expanded[ key ] = value
#}
#================================================================
    
def add_additional_with_check( lst_to, key_to, lst_from, key_from ): #{

  value = lst_from.get( key_from, '' )
  if value != '' : #{
    add_additional( lst_to, key_to, value )
    return True
  #}
  return False
#}
#================================================================
    
def AdditionalWorksData( use_staging=True ) : #{

  uri_fieldname = f.get_uri_fieldname()

  people_author_additional = [ f.get_person_with_author_role_fieldname(),
                               f.get_author_gender_fieldname(),
                               f.get_author_is_org_fieldname(), 
                               f.get_author_roles_fieldname(),
                             ]

  people_recipient_additional = [ f.get_person_with_addressee_role_fieldname(),
                                  f.get_addressee_gender_fieldname(),
                                  f.get_addressee_is_org_fieldname(), 
                                  f.get_addressee_roles_fieldname(),
                                ]

  people_mentioned_additional = [ f.get_details_of_agent_mentioned_fieldname(),
                                  f.get_person_mentioned_gender_fieldname(),
                                  f.get_agent_mentioned_is_org_fieldname(), 
                                  f.get_agent_mentioned_roles_fieldname(),
                                ]

  location_origin_additional = [ f.get_placename_of_origin_fieldname(),
                                 f.get_alternate_placename_of_origin_fieldname() ]

  location_destination_additional = [ f.get_placename_of_destination_fieldname(),
                                      f.get_alternate_placename_of_destination_fieldname() ]

  location_mentioned_additional = [ f.get_placename_mentioned_fieldname(),
                                    f.get_alternate_placename_mentioned_fieldname() ]
  
  resource_additional = [ f.get_resource_url_fieldname(),
                          f.get_resource_title_fieldname() ]

  start = 0
  batch = 200

  if use_staging :
    solr_works = solr.SolrConnection( solrconfig.solr_urls_stage['works'], persistent=True )
    solr_people = solr.SolrConnection( solrconfig.solr_urls_stage['people'],         persistent=True )
    solr_locations = solr.SolrConnection( solrconfig.solr_urls_stage['locations'],      persistent=True )
    solr_manifestations = solr.SolrConnection( solrconfig.solr_urls_stage['manifestations'], persistent=True )
    solr_institutions = solr.SolrConnection( solrconfig.solr_urls_stage['institutions'],   persistent=True )
    solr_resources = solr.SolrConnection( solrconfig.solr_urls_stage['resources'],      persistent=True )
  else :
    solr_works = solr.SolrConnection( solrconfig.solr_urls['works'], persistent=True )
    solr_people = solr.SolrConnection( solrconfig.solr_urls['people'],         persistent=True )
    solr_locations = solr.SolrConnection( solrconfig.solr_urls['locations'],      persistent=True )
    solr_manifestations = solr.SolrConnection( solrconfig.solr_urls['manifestations'], persistent=True )
    solr_institutions = solr.SolrConnection( solrconfig.solr_urls['institutions'],   persistent=True )
    solr_resources = solr.SolrConnection( solrconfig.solr_urls['resources'],      persistent=True )

  works = solr_works.query( "*:*", fields="*", start=start, rows=batch, score=False)
  total = works.numFound

  print("Updating " + str(total) + " works with data from other objects")
  print("Working . ", end=' ')

  updated_count = 0
  error_count = 0

  fn_author_uri = f.get_author_uri_fieldname()
  fn_addressee_uri = f.get_addressee_uri_fieldname()
  fn_mentioned_uris = f.get_relations_to_people_mentioned_fieldname()
  fn_origin_uri = f.get_origin_uri_fieldname()
  fn_destination_uri = f.get_destination_uri_fieldname()
  fn_places_mentioned = f.get_relations_to_places_mentioned_fieldname()
  fn_resource_relations = f.get_relations_to_resource_fieldname()
  fn_manifestation_relations = f.get_relations_to_manifestation_fieldname()

  locations_field_list = [ uri_fieldname,
                           f.get_location_synonyms_fieldname(),
                           f.get_location_name_fieldname() ]

  people_field_list = [ uri_fieldname,
                        f.get_person_name_fieldname(),
                        f.get_alias_fieldname(),
                        f.get_person_titles_or_roles_fieldname(),
                        f.get_gender_fieldname(),
                        f.get_is_organisation_fieldname() ]

  resources_field_list = [ uri_fieldname,
                           f.get_resource_url_fieldname(),
                           f.get_resource_title_fieldname() ]

  manifestations_field_list = [ uri_fieldname,
                                f.get_relations_to_image_fieldname(),
                                f.get_manifestation_type_fieldname(),
                                f.get_shelfmark_fieldname(),
                                f.get_printed_edition_details_fieldname(),
                                f.get_non_letter_enclosures_fieldname(),
                                f.get_enclosing_fieldname(),
                                f.get_enclosed_fieldname(),
                                f.get_paper_size_fieldname(),
                                f.get_paper_type_fieldname(),
                                f.get_seal_fieldname(),
                                f.get_number_of_pages_of_document_fieldname(),
                                f.get_postage_mark_fieldname(),
                                f.get_endorsements_fieldname(),
                                f.get_repository_fieldname(),
                                f.get_id_fieldname( object_type='manifestation' )
                                ]

  institutions_field_list = [ uri_fieldname,
                              f.get_repository_name_fieldname(),
                              f.get_repository_alternate_name_fieldname(),
                              f.get_repository_city_fieldname(),
                              f.get_repository_alternate_city_fieldname(),
                              f.get_repository_country_fieldname(),
                              f.get_repository_alternate_country_fieldname(),
                              ]

  while start < total :
    
    print(str(updated_count) + ":" + str(start), end=' ')
    time.sleep(0.01)  # 0.01 * (100'000/200) = 10 seconds...
    
    people = set()
    locations = set()
    manifestations = set()
    institutions = set()
    resources = set()

    #---- Loop through details of one work skimming off the URIs of authors, destinations, etc.
    for result in works.results :

      if fn_author_uri in result :
        
        if not has_all_keys( result, people_author_additional ) :
          for person in result[ fn_author_uri ] :
            people.add( person )

        
      if fn_addressee_uri in result :
        
        if not has_all_keys( result, people_recipient_additional ) :
          for person in result[ fn_addressee_uri ] :
            people.add( person )

        
      if fn_mentioned_uris in result :
        
        if not has_all_keys( result, people_mentioned_additional ) :
          for person in result[ fn_mentioned_uris ] :
            people.add( person )

        
      if fn_origin_uri in result :
        
        if not has_all_keys( result, location_origin_additional ) :
          for location in result[ fn_origin_uri ] :
            locations.add( location )

        elif 'origin_sort' not in result :
          locations.add( result[fn_origin_uri][0] )

   
      if fn_destination_uri in result :
        
        if not has_all_keys( result, location_destination_additional ) :
          for location in result[ fn_destination_uri ] :
            locations.add( location )

        elif 'destination_sort' not in result :
          locations.add( result[ fn_destination_uri ][0] )

   
      if fn_places_mentioned in result :
        
        if not has_all_keys( result, location_mentioned_additional ) :
          for location in result[fn_places_mentioned] :
            locations.add( location )

   
      if fn_resource_relations in result :
        
        if not has_all_keys( result, resource_additional ) :
          for resource in result[ fn_resource_relations ] :
            resources.add( resource )

        
      if fn_manifestation_relations in result :
        for man in result[ fn_manifestation_relations ] :
          manifestations.add( man )


    # End loop through details of one work, skimming off URIs of authors etc.

    #------------------------------------------------------------------------------------
    # Get further details of people, places, resources, manifestations and repositories

    if people : #{
      people = get_details_from_uri_list( solr_people, people, people_field_list )
    #}
       
    if locations : #{
      locations = get_details_from_uri_list( solr_locations, locations, locations_field_list )
    #}
       
    if resources : #{
      resources = get_details_from_uri_list( solr_resources, resources, resources_field_list )
    #}
       
    if manifestations : #{
      manifestations = get_details_from_uri_list( solr_manifestations, manifestations, manifestations_field_list )
    
      for man in manifestations : #{
        if f.get_repository_fieldname() in man : #{
          for ins in man[ f.get_repository_fieldname() ]: #{
            institutions.add( ins )

      if institutions : #{
        institutions = get_details_from_uri_list( solr_institutions, institutions, institutions_field_list )
      #}
    #}

    # Finished getting further details of people, places, resources, manifestations and repositories
    #------------------------------------------------------------------------------------
    # Now add the details gathered into 'works' data  
    #------------------------------------------------------------------------------------
    
    works_update = []
    for result in works.results : #{
      updated = {}
      changed = False
      
      # Add manifestation additionals
      if f.get_relations_to_manifestation_fieldname() in result : #{
        for man_uri in result[ f.get_relations_to_manifestation_fieldname() ] : #{
          man = find_uri( manifestations.results, man_uri )

          if man is None :
            error_count += 1

          else : #{
            # Find if this has an image. N.B. Don't count scanned Selden End cards as true images.
            if f.get_relations_to_image_fieldname() in man : #{
              if f.get_id_fieldname( object_type='manifestation' ) in man: #{ # it jolly well should have!
                id_from_editing_interface = man[ f.get_id_fieldname( object_type='manifestation' ) ]
                if 'cofk_import_ead-ead_c01_id' not in id_from_editing_interface: #{
                  add_additional( updated, f.get_manif_has_image_fieldname(), 'true' )
                  changed = True
                #}
              #}
            #}
  
            if add_additional_with_check( updated, f.get_manif_doc_type_fieldname(), man,
                                          f.get_manifestation_type_fieldname() ) : #{
              changed = True
            #}

            if add_additional_with_check( updated, f.get_manif_shelfmark_fieldname(), man,
                                          f.get_shelfmark_fieldname() ) : #{
              changed = True
            #}

            if add_additional_with_check( updated, f.get_manif_printed_edition_fieldname(), man,
                                          f.get_printed_edition_details_fieldname() ) : #{
              changed = True
            #}

            if add_additional_with_check( updated, f.get_manif_non_letter_enclosures_fieldname(), man,
                                          f.get_non_letter_enclosures_fieldname() ) : #{
              changed = True
            #}
  
            #---------------------------------------------------------------------------------
            # This maybe looks counter-intuitive but works as follows:
            # The manifestation had an enclos*ING* manifestation around it,
            # so *this* manifestation was on the INSIDE, i.e. it was itself enclosed.
            #---------------------------------------------------------------------------------
            if f.get_enclosing_fieldname() in man : #{
              add_additional( updated, f.get_manif_enclosed_fieldname(), 'true' )
              changed = True
            #}
  
            #---------------------------------------------------------------------------------
            # Once again, this looks counter-intuitive but works as follows:
            # The manifestation had an enclos*ED* manifestation inside it,
            # so *this* manifestation was on the OUTSIDE, i.e. it had an enclosure.
            #---------------------------------------------------------------------------------
            if f.get_enclosed_fieldname() in man  : #{
              add_additional( updated, f.get_manif_with_enclosure_fieldname(), 'true' )
              changed = True
            #}
  
            if add_additional_with_check( updated, f.get_manif_paper_size_fieldname(), man,
                                          f.get_paper_size_fieldname() ) : #{
              changed = True
            #}

            if add_additional_with_check( updated, f.get_manif_paper_type_fieldname(), man,
                                          f.get_paper_type_fieldname() ) : #{
              changed = True
            #}

            if add_additional_with_check( updated, f.get_manif_seal_fieldname(), man,
                                          f.get_seal_fieldname() ) : #{
              changed = True
            #}

            if add_additional_with_check( updated, f.get_manif_numpages_fieldname(), man,
                                          f.get_number_of_pages_of_document_fieldname() ) : #{
              changed = True
            #}

            if add_additional_with_check( updated, f.get_manif_postage_mark_fieldname(), man,
                                          f.get_postage_mark_fieldname() ) : #{
              changed = True
            #}

            if add_additional_with_check( updated, f.get_manif_endorsements_fieldname(), man,
                                          f.get_endorsements_fieldname() ) : #{
              changed = True
            #}

              
            if f.get_repository_fieldname() in man :  #{
              for ins_uri in man[ f.get_repository_fieldname() ] : #{
                inst = find_uri( institutions.results, ins_uri )

                if inst is None :
                  error_count += 1
                else : #{
                  if add_additional_with_check( updated, f.get_manif_repository_fieldname(), inst,
                                                f.get_repository_name_fieldname() ) : #{
                    changed = True  
                  #}

                  if add_additional_with_check( updated, f.get_manif_repository_fieldname(), inst,
                                                f.get_repository_alternate_name_fieldname() ) : #{
                    changed = True  
                  #}

                  if add_additional_with_check( updated, f.get_manif_repository_fieldname(), inst,
                                                f.get_repository_city_fieldname() ) : #{
                    changed = True  
                  #}

                  if add_additional_with_check( updated, f.get_manif_repository_fieldname(), inst,
                                                f.get_repository_alternate_city_fieldname() ) : #{
                    changed = True  
                  #}

                  if add_additional_with_check( updated, f.get_manif_repository_fieldname(), inst,
                                                f.get_repository_country_fieldname() ) : #{
                    changed = True  
                  #}

                  if add_additional_with_check( updated, f.get_manif_repository_fieldname(), inst,
                                                f.get_repository_alternate_country_fieldname() ) :
                    changed = True                


      #}  # end of manifestation additionals
      #---------------------------------------------
      
      # Add author additionals
      if f.get_author_uri_fieldname() in result :  #{

        sortlist = []
            
        for person_uri in result[ f.get_author_uri_fieldname() ]: #{
          person = find_uri( people.results, person_uri )
          
          if person is None :
            error_count += 1
          else : #{
            if f.get_person_name_fieldname() in person: #{
              sortlist.append( person[ f.get_person_name_fieldname() ] )
            #}

            if add_additional_with_check( updated, f.get_person_with_author_role_fieldname(), person,
                                          f.get_person_name_fieldname() ) : #{
              changed = True
            #}
            if add_additional_with_check( updated, f.get_person_with_author_role_fieldname(), person,
                                          f.get_alias_fieldname() ) : #{
              changed = True
            #}
            if add_additional_with_check( updated, f.get_author_roles_fieldname(), person,
                                          f.get_person_titles_or_roles_fieldname()): #{
              changed = True
            #}
            if add_additional_with_check( updated, f.get_author_gender_fieldname(), person,
                                          f.get_gender_fieldname() ) : #{
              changed = True
            #}
            if add_additional_with_check( updated, f.get_author_is_org_fieldname(), person,
                                          f.get_is_organisation_fieldname() ) : #{
              changed = True
            #}
          #}
        #}

        if changed and len( sortlist ) > 0: #{
          sortlist.sort()
          add_additional( updated, 'author_sort', "; ".join( sortlist ) )
        #}
      #}  # end of author additionals
      #---------------------------------------------
      
      # Add recipient additionals        
      if f.get_addressee_uri_fieldname() in result  : #{

        sortlist = []
            
        for person_uri in result[ f.get_addressee_uri_fieldname() ]: #{
          person = find_uri( people.results, person_uri )
          
          if person is None :
            error_count += 1
          else : #{
            if f.get_person_name_fieldname() in person: #{
              sortlist.append( person[ f.get_person_name_fieldname() ] )
            #}

            if add_additional_with_check( updated, f.get_person_with_addressee_role_fieldname(), person,
                                          f.get_person_name_fieldname() ) : #{
              changed = True
            #}
            if add_additional_with_check( updated, f.get_person_with_addressee_role_fieldname(), person,
                                          f.get_alias_fieldname() ) : #{
              changed = True
            #}
            if add_additional_with_check( updated, f.get_addressee_roles_fieldname(), person,
                                          f.get_person_titles_or_roles_fieldname() ) : #{
              changed = True
            #}
            if add_additional_with_check( updated, f.get_addressee_gender_fieldname(), person,
                                          f.get_gender_fieldname() ) : #{
              changed = True
            #}
            if add_additional_with_check( updated, f.get_addressee_is_org_fieldname(), person,
                                          f.get_is_organisation_fieldname() ) : #{
              changed = True
            #}
          #}
        #}

        if changed and len( sortlist ) > 0: #{
          sortlist.sort()
          add_additional( updated, 'recipient_sort', "; ".join( sortlist ) )
        #}
      #}  # end of recipient additionals
      #---------------------------------------------
      
      # Add additionals for people mentioned
      if f.get_relations_to_people_mentioned_fieldname() in result  : #{
        person = find_uri( people.results, result[ f.get_relations_to_people_mentioned_fieldname() ][0] )
        
        if person is None :
          error_count += 1
            
        for person_uri in result[ f.get_relations_to_people_mentioned_fieldname() ]: #{
          person = find_uri( people.results, person_uri )
          
          if person is None :
            error_count += 1
          else : #{
            if add_additional_with_check( updated, f.get_details_of_agent_mentioned_fieldname(), person,
                                          f.get_person_name_fieldname() ) : #{
              changed = True
            #}
            if add_additional_with_check( updated, f.get_details_of_agent_mentioned_fieldname(), person,
                                          f.get_alias_fieldname() ) : #{
              changed = True
            #}
            if add_additional_with_check( updated, f.get_agent_mentioned_roles_fieldname(), person,
                                          f.get_person_titles_or_roles_fieldname() ) : #{
              changed = True
            #}
            if add_additional_with_check( updated, f.get_person_mentioned_gender_fieldname(), person,
                                          f.get_gender_fieldname() ) : #{
              changed = True
            #}
            if add_additional_with_check( updated, f.get_agent_mentioned_is_org_fieldname(), person,
                                          f.get_is_organisation_fieldname() ) : #{
              changed = True
            #}
          #}
        #}
      #}  # end of additionals for people mentioned
      #---------------------------------------------
              
        
      # Add origin additionals
      if f.get_origin_uri_fieldname() in result  : #{
        location = find_uri( locations.results, result[ f.get_origin_uri_fieldname() ][0] )
        if location is None :
          error_count += 1
        else : #{
          if add_additional_with_check(updated, 'origin_sort', location, f.get_location_name_fieldname() ): #{
            changed = True
          #}
        #}
            
        for location_uri in result[ f.get_origin_uri_fieldname() ]: #{
          location = find_uri( locations.results, location_uri )
          
          if location is None : #{
            error_count += 1
          else : 
            if add_additional_with_check( updated, f.get_placename_of_origin_fieldname(),
                                          location, f.get_location_name_fieldname() ): #{
              changed = True  
            #}
            if add_additional_with_check( updated, f.get_placename_of_origin_fieldname(),
                                          location, f.get_location_synonyms_fieldname() ): #{
              changed = True  
            #}
          #}
        #}
      #}  # end of origin additionals
      #---------------------------------------------
              
      # Add destination additionals           
      if f.get_destination_uri_fieldname() in result : #{
        location = find_uri( locations.results, result[ f.get_destination_uri_fieldname() ][0] )
        if location is None :
          error_count += 1
        else : #{
          if add_additional_with_check(updated, 'destination_sort', location, f.get_location_name_fieldname() ): #{
            changed = True
          #}
        #}
            
        for location_uri in result[ f.get_destination_uri_fieldname() ]: #{
          location = find_uri( locations.results, location_uri )
          
          if location is None :
            error_count += 1
          else :  #{
            if add_additional_with_check( updated, f.get_placename_of_destination_fieldname(), location,
                                          f.get_location_name_fieldname() ) : #{
              changed = True  
            #}
            if add_additional_with_check( updated, f.get_placename_of_destination_fieldname(),
                                          location, f.get_location_synonyms_fieldname() ) : #{
              changed = True  
            #}
          #}
        #}
      #} # end of destination additionals
      #---------------------------------------------
              
      # Add place mentioned additionals           
      if f.get_relations_to_places_mentioned_fieldname() in result : #{
        for location_uri in result[ f.get_relations_to_places_mentioned_fieldname() ]: #{
          location = find_uri( locations.results, location_uri )
          
          if location is None :
            error_count += 1
          else :  #{
            if add_additional_with_check( updated, f.get_placename_mentioned_fieldname(), location,
                                          f.get_location_name_fieldname() ) : #{
              changed = True  
            #}
            if add_additional_with_check( updated, f.get_placename_mentioned_fieldname(),
                                          location, f.get_location_synonyms_fieldname() ) : #{
              changed = True  
            #}
          #}
        #}
      #} # end of place mentioned additionals
      #---------------------------------------------
        
      # Add resource additionals
      if f.get_relations_to_resource_fieldname() in result : #{
        for res_uri in result[ f.get_relations_to_resource_fieldname() ] : #{
          res = find_uri( resources.results, res_uri )

          if res is None :
            error_count += 1

          else : #{
            # Find if this resource is a transcript (currently just on the basis of resource title and URL)
            resource_url = ''
            resource_title = ''
            if f.get_resource_title_fieldname() in res : #{
              resource_title = res[ f.get_resource_title_fieldname() ]

            if f.get_resource_url_fieldname() in res : #{
              resource_url = res[ f.get_resource_url_fieldname() ]

            if resource_title.startswith( 'Transcript' ) and resource_url.startswith( 'http' ): #{
              add_additional( updated, f.get_transcription_url_fieldname(), resource_url )
              changed = True



      # end of resource additionals
      #---------------------------------------------
    
      #=============================================
      # See if there have been changes for this work
      #=============================================
      if changed : #{
        for key, value in result.items():
          # These keys are solr copy-fields and shouldn't be indexed directly.
          if key not in [ 'id', 'people', 'locations', 'comments', 'manifestations', 'resources', 'default_search_field' ] :
            updated[key] = value
        
        works_update.append( updated )
        updated_count += 1
      #}
    #}  # end of loop through works results

    #===============================================
    # Write any changes for this work back into Solr
    #===============================================
    if len( works_update ) > 0 :
      solr_works.add_many( works_update, False )
      
    start += batch
    works = solr_works.query( "*:*", fields="*", start=start, rows=batch, score=False)
  #}
  
  print("")  
  print("Committing " + str( updated_count ) + " works...")

  solr_works.commit()
  solr_works.close()

  solr_people.close()
  solr_locations.close()
  solr_manifestations.close()
  solr_institutions.close()
  solr_resources.close()

  return error_count
#}
#================================================================

def get_details_from_uri_list( solr_instance, uri_list, field_list ): #{

  if uri_list : #{
    uri_list = [ escaped_uri_prefix + escape_colons(one_uri) for one_uri in uri_list ]

    query_str = escaped_uri_fieldname + ":(" + " ".join( uri_list ) + ")"

    # field_str = ','.join( field_list )

    further_details = solr_instance.query( query_str, fields=field_list,
                                           start=0, rows=len( uri_list ), score=False )
    return further_details
  #}
  else:
    return uri_list
#}
#================================================================


if __name__ == '__main__':
  timeStart = time.time()

  print("- Updating works")

  additional_error_count = AdditionalWorksData( use_staging=False )

  timeEnd = time.time()
  print("  Done (in %0.1f seconds)." % (timeEnd-timeStart))

  if additional_error_count:
    print("Error count " + str(additional_error_count))
  
  
#================================================================

