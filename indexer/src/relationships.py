# -*- coding: utf-8 -*-
'''
Created on 25 Aug 2010

@author: Matthew Wilcoxson

This file stores relationships needed to convert CSV data to RDF.
Also see "csvtordf.py"

01 Feb 2011, Sushila Burgess: added http://purl.org/vocab/relationship/ to namespaces
and the following relationship types: parent of, spouse of, sibling of; was born in location;
(work) mentions place; (work) mentions work; (comment on work) refers to people mentioned in work. 

18 Jul 2011, SB, replace hard-coded predicate names with calls to fieldmap.
'''

# ---------------------------------------------------------------------------------------------------
# The 'fieldmap' module passes back the fieldname as a string.
# By using functions from 'fieldmap', we can restrict fieldnames to being hard-coded in only 
# ONE place, allowing much easier changes if a better ontology is found. (SB, 18 July 2011)
# ---------------------------------------------------------------------------------------------------

import sys
fieldmap_path = 'lib' 
sys.path.append( fieldmap_path )
from fieldmap import *

# ---------------------------------------------------------------------------------------------------
#
# This table is used when creating RDF data to link one object to another. The links
# are extracted from the relations.csv file.
#
# Relationships work both ways.
# e.g. for "type-created", A "person" has a predicate "Frbr:creatorOf" with object "work" but
#                        also a "work" has a predicate "frbr:creator" with object "person"
#
# The same relationship type can be used between multiple types
# e.g. "relationship_type-is_related_to" is used between "work" and "resource" but also "person" and "resource"
#
# If a relation is between the same types of objects (e.g person to person) then additional information is needed
# to determine which way around the relation should be - left-to-right or right-to-left
#
# This table has:
#     the type, followed by the two objects which are related and then the relations from 1st to 2nd and then 2nd to 1st
#     e.g. : 
#  ['relationship_type-created','person','work','frbr:creatorOf','frbr:creator'],
# here the type is 'relationship_type-created', the relation is between "person" and "work"
#
# When these are added to Solr they are appeneded with the object they link to
#  e.g. In the people Core: "frbr:creatorOf-work" is the field name for a creator of a work.
# ---------------------------------------------------------------------------------------------------

def set_rel_cfg( type_on_left, get_left_side, type_on_right, get_right_side ):

	ending_on_left  = '-' + type_on_left
	ending_on_right = '-' + type_on_right

	if get_right_side.endswith( ending_on_right ):
		chop = 0 - len( ending_on_right )
		get_right_side = get_right_side[ 0 : chop ]

	if get_left_side.endswith( ending_on_left ):
		chop = 0 - len( ending_on_left )
		get_left_side = get_left_side[ 0 : chop ]

	element_tuple = ( type_on_left, type_on_right, get_right_side, get_left_side )

	return element_tuple

# ---------------------------------------------------------------------------------------------------

relationships = {

	'relationship_type-created': [
		# Author on left, works created on right
		set_rel_cfg( type_on_left   = 'person',
					get_left_side  = get_author_uri_fieldname(),
					type_on_right  = 'work',
					get_right_side = get_works_created_fieldname()),
	],

	'relationship_type-enclosed_in': [
		# Inner (enclosed) letter on left, outer (enclosing) on right
		set_rel_cfg( type_on_left   = 'manifestation',
					get_left_side  = get_enclosed_fieldname(),
					type_on_right  = 'manifestation',
					get_right_side = get_enclosing_fieldname() ),
	],

	'relationship_type-formerly_owned': [  # count 8
		# Owner on left, manifestation owned on right
		set_rel_cfg( type_on_left   = 'person',
					get_left_side  = get_former_owner_fieldname(),
					type_on_right  = 'manifestation',
					get_right_side = get_manifs_owned_fieldname() ),
	],

	'relationship_type-handwrote': [
		# Writer on left, thing written on right
		set_rel_cfg( type_on_left   = 'person',
					get_left_side  = get_handwritten_by_fieldname(),
					type_on_right  = 'manifestation',
					get_right_side = get_handwrote_fieldname() ),
	],


	'relationship_type-image_of': [
		# Image (left) is an image of a manifestation (right)
		set_rel_cfg( type_on_left   = 'image',
					get_left_side  = get_relations_to_image_fieldname(),
					type_on_right  = 'manifestation',
					get_right_side = get_relations_to_manifestation_fieldname()),
	],

	'relationship_type-intended_for': [
		# Work (left) was addressed to person (right)
		set_rel_cfg( type_on_left   = 'work',
					get_left_side  = get_letters_intended_fn(),
					type_on_right  = 'person',
					get_right_side = get_intended_uri_fn() ),

	],

	'relationship_type-is_manifestation_of': [
		# Manifestation (left) is manifestation of work (right)
		set_rel_cfg( type_on_left   = 'manifestation',
					get_left_side  = get_relations_to_manifestation_fieldname(),
					type_on_right  = 'work',
					get_right_side = get_relations_to_work_fieldname()),
	],

	'relationship_type-is_related_to': [
		# Work (on left) has related resource (on right)
		set_rel_cfg( type_on_left   = 'work',
					get_left_side  = get_work_related_to_resource_fieldname(),
					type_on_right  = 'resource',
					get_right_side = get_relations_to_resource_fieldname()),

		# Person (on left) has related resource (on right)
		set_rel_cfg( type_on_left   = 'person',
					get_left_side  = get_person_related_to_resource_fieldname(),
					type_on_right  = 'resource',
					get_right_side = get_relations_to_resource_fieldname()),

		# Place (on left) has related resource (on right)
		set_rel_cfg( type_on_left   = 'location',
					get_left_side  = get_place_related_to_resource_fieldname(),
					type_on_right  = 'resource',
					get_right_side = get_relations_to_resource_fieldname()),


		# Place (on left) has related resource (on right)
		set_rel_cfg( type_on_left   = 'institution',
					get_left_side  = get_insitution_related_to_resource_fieldname(),
					type_on_right  = 'resource',
					get_right_side = get_relations_to_resource_fieldname()),
	],

	'relationship_type-is_reply_to': [
		# Later letter (on left) is reply to earlier letter (on right)
		set_rel_cfg( type_on_left   = 'work',
					get_left_side  = get_answered_by_fieldname(),
					type_on_right  = 'work',
					get_right_side = get_reply_to_fieldname()),
	],

	'relationship_type-matches': [
		# Spouse on left, spouse on right
		set_rel_cfg( type_on_left   = 'work',
					get_left_side  = get_matches_fieldname(),
					type_on_right  = 'work',
					get_right_side = get_matches_fieldname()),
	],

	'relationship_type-member_of': [
		# Person (on left) is member of organisation (on right)
		set_rel_cfg( type_on_left   = 'person',
					get_left_side  = get_members_of_org_fieldname(),
					type_on_right  = 'person',
					get_right_side = get_orgs_of_which_member_fieldname()),
	],

	'relationship_type-parent_of': [
		# Parent (on left) is parent of child (on right)
		set_rel_cfg( type_on_left   = 'person',
					get_left_side  = get_is_child_of_fieldname(),
					type_on_right  = 'person',
					get_right_side = get_is_parent_of_fieldname()),
	],

	'relationship_type-spouse_of':  [
		# Spouse on left, spouse on right
		set_rel_cfg( type_on_left   = 'person',
					get_left_side  = get_is_spouse_of_fieldname(),
					type_on_right  = 'person',
					get_right_side = get_is_spouse_of_fieldname()),
	],

	'relationship_type-sibling_of': [
		# Sibling on left, sibling on right
		set_rel_cfg( type_on_left   = 'person',
					get_left_side  = get_is_sibling_of_fieldname(),
					type_on_right  = 'person',
					get_right_side = get_is_sibling_of_fieldname()),
	],

	'relationship_type-relative_of': [
		# Person (on left) is a relative of person (on right)
		set_rel_cfg( type_on_left   = 'person',
					get_left_side  = get_is_relative_of_fieldname(),
					type_on_right  = 'person',
					get_right_side = get_is_relative_of_fieldname()),
	],

	'relationship_type-unspecified_relationship_with':  [
		# unspecified on left, unspecified on right
		set_rel_cfg( type_on_left   = 'person',
					get_left_side  = get_unspecified_relationship_with_fieldname(),
					type_on_right  = 'person',
					get_right_side = get_unspecified_relationship_with_fieldname()),
	],

	'relationship_type-was_born_in_location': [
		# Person (on left) was born in place (on right)
		set_rel_cfg( type_on_left   = 'person',
					get_left_side  = get_people_born_at_place_fieldname(),
					type_on_right  = 'location',
					get_right_side = get_place_where_born_fieldname()),
	],

	'relationship_type-died_at_location': [
		# Person (on left) died in place (on right)
		set_rel_cfg( type_on_left   = 'person',
					get_left_side  = get_people_who_died_at_place_fieldname(),
					type_on_right  = 'location',
					get_right_side = get_place_where_died_fieldname()),
	],

	'relationship_type-was_in_location': [
		# Person (on left) visited or lived in place (on right)
		set_rel_cfg( type_on_left   = 'person',
					get_left_side  = get_people_who_visited_place_fieldname(),
					type_on_right  = 'location',
					get_right_side = get_place_visited_fieldname()),
	],

	'relationship_type-mentions': [
		# Work (on left) mentions person (on right)
		set_rel_cfg( type_on_left   = 'work',
					get_left_side  = get_works_in_which_mentioned_fieldname(),
					type_on_right  = 'person',
					get_right_side = get_relations_to_people_mentioned_fieldname()),
	],

	'relationship_type-mentions_place': [
		# Work (on left) mentions place (on right)
		set_rel_cfg( type_on_left   = 'work',
					get_left_side  = get_works_in_which_mentioned_fieldname(),
					type_on_right  = 'location',
					get_right_side = get_relations_to_places_mentioned_fieldname()),
	],

	'relationship_type-mentions_work': [
		# Work (on left) mentions work (on right)
		set_rel_cfg( type_on_left   = 'work',
					get_left_side  = get_works_in_which_mentioned_fieldname(),
					type_on_right  = 'work',
					get_right_side = get_relations_to_works_mentioned_fieldname()),
	],


	'relationship_type-refers_to': [
		# Comment (on left) refers to work (on right)
		set_rel_cfg( type_on_left   = 'comment',
					get_left_side  = get_relations_to_comments_fieldname(),
					type_on_right  = 'work',
					get_right_side = get_work_commented_on_fieldname()),


		# Comment (on left) refers to person (on right)
		set_rel_cfg( type_on_left   = 'comment',
					get_left_side  = get_relations_to_comments_fieldname(),
					type_on_right  = 'person',
					get_right_side = get_person_commented_on_fieldname()),


		# Comment (on left) refers to manifestation (on right)
		set_rel_cfg( type_on_left   = 'comment',
					get_left_side  = get_relations_to_comments_fieldname(),
					type_on_right  = 'manifestation',
					get_right_side = get_manifestation_commented_on_fieldname()),

		# Comment (on left) refers to location (on right)
		set_rel_cfg( type_on_left   = 'comment',
					get_left_side  = get_relations_to_comments_fieldname(),
					type_on_right  = 'location',
					get_right_side = get_place_commented_on_fieldname()),
	],

	'relationship_type-refers_to_addressee': [
		# Comment (on left) refers to addressee of work (on right)
		set_rel_cfg( type_on_left   = 'comment',
					get_left_side  = get_relations_to_comments_on_addressee_fieldname(),
					type_on_right  = 'work',
					get_right_side = get_work_with_comment_on_addressee_fieldname()),
	],

	'relationship_type-refers_to_author': [
		# Comment (on left) refers to author of work (on right)
		set_rel_cfg( type_on_left   = 'comment',
					get_left_side  = get_relations_to_comments_on_author_fieldname(),
					type_on_right  = 'work',
					get_right_side = get_work_with_comment_on_author_fieldname()),
	],

	'relationship_type-refers_to_date': [
		# Comment (on left) refers to date of work (on right)
		set_rel_cfg( type_on_left   = 'comment',
					get_left_side  = get_relations_to_comments_on_date_fieldname(),
					type_on_right  = 'work',
					get_right_side = get_work_with_comment_on_date_fieldname()),

		# Comment (on left) refers to date of manifestation (on right)
		set_rel_cfg( type_on_left   = 'comment',
					get_left_side  = get_relations_to_comments_on_date_fieldname(),
					type_on_right  = 'manifestation',
					get_right_side = get_manif_with_comment_on_date_fieldname()),
	],

	'relationship_type-refers_to_receipt_date': [
		# Comment (on left) refers to date of manifestation (on right)
		set_rel_cfg( type_on_left   = 'comment',
					get_left_side  = get_relations_to_comments_on_receipt_date_fieldname(),
					type_on_right  = 'manifestation',
					get_right_side = get_manif_with_comment_on_receipt_date_fieldname()),
	],

	'relationship_type-refers_to_people_mentioned_in_work': [
		# Comment (on left) refers to people mentioned in work (on right)
		set_rel_cfg( type_on_left   = 'comment',
					get_left_side  = get_comments_on_people_mentioned_in_work_fieldname(),
					type_on_right  = 'work',
					get_right_side = get_works_with_comments_on_people_mentioned_fieldname()),
	],

	'relationship_type-stored_in':           [
		# Manifestation (left) is stored in repository (right)
		set_rel_cfg( type_on_left   = 'manifestation',
					get_left_side  = get_repository_contents_fieldname(),
					type_on_right  = 'institution',
					get_right_side = get_repository_fieldname()),
	],

	'relationship_type-was_addressed_to':    [
		# Work (left) was addressed to person (right)
		set_rel_cfg( type_on_left   = 'work',
					get_left_side  = get_letters_received_fieldname(),
					type_on_right  = 'person',
					get_right_side = get_addressee_uri_fieldname() ),
	],

	'relationship_type-was_sent_from':       [
		# Letter (left) was sent from place (right)
		set_rel_cfg( type_on_left   = 'work',
					get_left_side  = get_works_with_origin_fieldname(),
					type_on_right  = 'location',
					get_right_side = get_origin_uri_fieldname() ),
	],

	'relationship_type-was_sent_to':         [
		# Letter (left) was sent to place (right)
		set_rel_cfg( type_on_left   = 'work',
					get_left_side  = get_works_with_destination_fieldname(),
					type_on_right  = 'location',
					get_right_side = get_destination_uri_fieldname()),
	],

	'relationship_type-refers_to_origin': [
		# Comment (on left) refers to work's origin (on right)
		set_rel_cfg( type_on_left   = 'comment',
					get_left_side  = get_fieldname_comments_on_origin_of_work(),
					type_on_right  = 'work',
					get_right_side = get_fieldname_work_with_comment_on_origin()),
	],

	'relationship_type-refers_to_destination': [
		# Comment (on left) refers to work's destination (on right)
		set_rel_cfg( type_on_left   = 'comment',
					get_left_side  = get_fieldname_comments_on_destination_of_work(),
					type_on_right  = 'work',
					get_right_side = get_fieldname_work_with_comments_on_destination()),
	],

	'relationship_type-route': [
		# Comment (on left) refers to work's destination (on right)
		set_rel_cfg( type_on_left   = 'comment',
					get_left_side  = get_fieldname_comments_on_route_of_work(),
					type_on_right  = 'work',
					get_right_side = get_fieldname_work_with_comments_on_route()),
	],

	'relationship_type-taught': [
		set_rel_cfg(
			type_on_left   = 'person',
			get_left_side  = get_taught_fn(),
			type_on_right  = 'person',
			get_right_side = get_taught_by_fn()
		),
	],  # 29

	'relationship_type-employed': [
		set_rel_cfg(
			type_on_left   = 'person',
			get_left_side  = get_employed_fn(),
			type_on_right  = 'person',
			get_right_side = get_employed_by_fn()
		),
	],  # 26
	'relationship_type-friend_of': [
		set_rel_cfg(
			type_on_left   = 'person',
			get_left_side  = get_friend_fn(),
			type_on_right  = 'person',
			get_right_side = get_friend_fn()
		),
	],  # 18

	'relationship_type-acquaintance_of': [],  # 2
	'relationship_type-collaborated_with': [],  # 1
	'relationship_type-copied': [],  # none yet
	'relationship_type-deals_with': [],  # 1
	'relationship_type-edited': [],  # none yet
	'relationship_type-has_flag': [],
	'relationship_type-is_finding_aid_for': [],
	'relationship_type-is_in_or_near': [],
	'relationship_type-is_rightsholder_of': [],
	'relationship_type-is_transcription_of': [],
	'relationship_type-is_translation_of': [],
	'relationship_type-paper_reused_for': [],
	'relationship_type-partly_handwrote': [],  # 1
	'relationship_type-quotes_from': [],
	'relationship_type-sent': [],
	'relationship_type-signed': [],
	'relationship_type-transcribed': [],
	'relationship_type-was_involved_in': [],
	'relationship_type-was_patron_of': [],  # 7
}

# person manifestation relationship_type-partly_handwrote
# person role_category relationship_type-member_of
# work person relationship_type-intended_for
# image person relationship_type-image_of
# person person relationship_type-was_patron_of
# person person relationship_type-colleague_of
# person person relationship_type-acquaintance_of
# work subject relationship_type-deals_with
# person person relationship_type-collaborated_with
# work person relationship_type-was_addressed_to

# ---------------------------------------------------------------------------------------------------

def getRdfRelationshipsLeftRight( thing1, rel_type, thing2 ):
	for rel in relationships[rel_type]:
		if rel[0] == thing1 and rel[1] == thing2 :
			return rel[2], rel[3]

	return None

# ---------------------------------------------------------------------------------------------------
# def getRdfRelationship( thing1, rel_type, thing2, forcedDirection ):
#    for rel in relationships:
#        if rel_type.find(rel[0]) != -1:
#            if rel[1] == rel[2] :
#               if forcedDirection == True :
#                  return rel[3] # Left
#               else :
#                  return rel[4] # Right
#               
#            elif rel[1] == thing1 and rel[2] == thing2:
#                return rel[3]
#                
#            elif rel[1] == thing2 and rel[2] == thing1:
#                return rel[4]
#            
#    return None
# ---------------------------------------------------------------------------------------------------

if __name__ == '__main__':
	for key, value in list(relationships.items()):
		print((key + ': ' + str( value )))

# ---------------------------------------------------------------------------------------------------
