# This holds which of the links should be fetched when a single record is wanted in the profile
#---------------------------------------------------------------------------------------------------
# The 'fieldmap' module imported below consists of a series of functions that map the fieldnames 
# from the editing interface (i.e. SQL database column names) to an RDF equivalent for use in Solr.

from fieldmap import *
#---------------------------------------------------------------------------------------------------

# First lever relations
# if we have one of these objects, then also get these related objects
# current_object : [ related_objects ]

object_relation_fields = {
   'work' : [
        get_author_uri_fieldname(),
        get_relations_to_manifestation_fieldname(),
        get_relations_to_resource_fieldname(),
        get_relations_to_comments_fieldname(), 
        get_relations_to_comments_on_addressee_fieldname(),
        get_relations_to_comments_on_author_fieldname(),
        get_relations_to_comments_on_date_fieldname(),
        get_relations_to_comments_on_receipt_date_fieldname(),
        get_addressee_uri_fieldname(),
        get_intended_uri_fn(),
        get_origin_uri_fieldname(),
        get_destination_uri_fieldname(),
        get_reply_to_fieldname(),
        get_answered_by_fieldname(),
        get_matches_fieldname(),
        get_relations_to_people_mentioned_fieldname(),
        get_comments_on_people_mentioned_in_work_fieldname(),
        get_relations_to_places_mentioned_fieldname(),
        get_relations_to_works_mentioned_fieldname(),
        get_works_in_which_mentioned_fieldname(),
        get_fieldname_comments_on_origin_of_work(),
        get_fieldname_comments_on_destination_of_work(),
        get_fieldname_comments_on_route_of_work()
      ],
      
   'person' : [
      ## -- may need to show only totals by year -- get_works_created_fieldname(),
      get_relations_to_resource_fieldname(),
      get_orgs_of_which_member_fieldname(),
      get_members_of_org_fieldname(),
      get_relations_to_comments_fieldname(),
      ## -- may need to show only totals by year -- get_letters_received_fieldname(),
      ## -- may need to show only totals by year -- get_works_in_which_mentioned_fieldname(),
       get_letters_intended_fn(),
      get_place_where_born_fieldname(),
      get_place_where_died_fieldname(),
      get_place_visited_fieldname(),
      get_is_parent_of_fieldname(),
      get_is_child_of_fieldname(),
      get_is_spouse_of_fieldname(),
      get_is_sibling_of_fieldname(),
      get_is_relative_of_fieldname(),
      get_unspecified_relationship_with_fieldname(),
   ],
   
   'image' : [
      get_relations_to_manifestation_fieldname()
   ],
   
   'comment' : [
      get_work_commented_on_fieldname(),
      get_person_commented_on_fieldname(),
      get_place_commented_on_fieldname(),
      get_work_with_comment_on_addressee_fieldname(),
      get_work_with_comment_on_author_fieldname(),
      get_work_with_comment_on_date_fieldname(),
   ],
   
   'institution' : [
      get_repository_contents_fieldname(),
   ],
   
   'location' : [
      ## -- may need to show only totals by year -- get_works_with_origin_fieldname(),
      ## -- may need to show only totals by year -- get_works_with_destination_fieldname(),
      ## -- may need to show only totals by year -- get_works_in_which_mentioned_fieldname(),
      get_people_born_at_place_fieldname(),
      get_people_who_died_at_place_fieldname(),
      get_people_who_visited_place_fieldname(),
      get_relations_to_comments_fieldname(),
      get_relations_to_resource_fieldname()
   ],
   
   'manifestation' : [
      get_enclosing_fieldname(),
      get_enclosed_fieldname(),
      get_relations_to_image_fieldname(),
      get_relations_to_work_fieldname(),
      get_repository_fieldname()
   ],
   
   'resource' : [
      get_work_related_to_resource_fieldname(),
      get_person_related_to_resource_fieldname(),
      get_place_related_to_resource_fieldname(),
   ]
 }

 # 2nd level relations (i.e. relations of the 1st level relations)
 # object_type : [ second_level_related_objects ]

further_relation_fields = {
   'work' : [
        get_relations_to_image_fieldname(),
        get_relations_to_comments_on_date_fieldname(),
        get_relations_to_comments_on_receipt_date_fieldname(),
      ],
      
   'image' : [
         get_relations_to_work_fieldname(),
         get_relations_to_image_fieldname(),
      ],
}

#----------------------------------------------------------------------------------------------

if __name__ == '__main__':
  print '---'
  print 'Settings from relations.py:'
  print '---'
  print 'Object relation fields: ' + unicode( object_relation_fields )
  print '---'
  print 'Further relation fields: ' + unicode( further_relation_fields )
  print '---'

