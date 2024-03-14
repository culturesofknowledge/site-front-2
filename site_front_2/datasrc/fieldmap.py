"""Field-map functions

Consists of functions to map fields from the editing interface to RDF terms suitable for use in Solr.
"""

import sys
import inspect


# -----------------------------------------------------------------------------------------------------
def get_all_main_displayable_fields():
    # These are the fields that seem to really sum up a record in an easily-readable way,
    # and are used if there is only space to show one field's worth of data about a record.

    displayfields = {
        "work": {"display": "Description", "value": get_work_description_fieldname()},
        "manifestation": {"display": "Type", "value": get_manifestation_type_fieldname()},
        "person": {"display": 'Name', "value": get_person_name_fieldname()},
        "location": {"display": 'Name', "value": get_location_name_fieldname()},
        "institution": {"display": 'Name', "value": get_repository_name_fieldname()},
        "resource": {"display": "Name", "value": get_resource_title_fieldname()},
        "comment": {"display": 'Comment', "value": get_comments_fieldname()},
        "image": {"display": 'Image', "value": get_image_source_fieldname()}
    }
    return displayfields


# --------------------------------------------------------------------------------------------------

def get_core_id_fieldname():
    return 'dcterms_identifier'


# --------------------------------------------------------------------------------------------------

def get_id_fieldname(object_type='work', get_integer_version=False):
    # Returns the *name within Solr* of the unique key field within the editing interface
    suffix = get_normal_id_value_prefix()

    if object_type == 'work' or object_type == 'person':
        if get_integer_version:
            suffix = get_integer_id_value_prefix()

    return get_core_id_fieldname() + '-' + suffix


# --------------------------------------------------------------------------------------------------

def get_integer_id_fieldname(object_type='work'):
    # Returns the *name within Solr* of the unique integer key field within the editing interface
    return get_id_fieldname(object_type, True)


# --------------------------------------------------------------------------------------------------
def get_integer_id_value_prefix():
    # Gets prefixed to the actual value of the field, as well as being a suffix to the name.
    # For example the field 'dcterms_identifier-editi_' with a value from the editing
    # interface of '123456' would return the value 'editi_123456' from Solr.
    # Don't know why this is considered necessary but I suppose we'd better keep it for now.

    return 'editi_'


# --------------------------------------------------------------------------------------------------
def get_normal_id_value_prefix():
    # Gets prefixed to the actual value of the field, as well as being a suffix to the name.
    return 'edit_'


# --------------------------------------------------------------------------------------------------
def get_shelfmark_value_prefix():
    # Gets prefixed to the actual value of the field, as well as being a suffix to the name.
    return 'shelf_'


# --------------------------------------------------------------------------------------------------

def get_shelfmark_fieldname():
    # Gets prefixed to the actual value of the field, as well as being a suffix to the name.
    suffix = get_shelfmark_value_prefix()
    return get_core_id_fieldname() + '-' + suffix


# --------------------------------------------------------------------------------------------------

def get_uri_value_prefix():
    # Gets prefixed to the actual value of the field, as well as being a suffix to the name.
    return 'uri_'


# --------------------------------------------------------------------------------------------------

def get_uri_fieldname():
    # Gets prefixed to the actual value of the field, as well as being a suffix to the name.
    suffix = get_uri_value_prefix()
    return get_core_id_fieldname() + '-' + suffix  # 'dcterms_identifier-uri_'


# --------------------------------------------------------------------------------------------------

def get_uuid_value_prefix():
    # Gets prefixed to the actual value of the field, as well as being a suffix to the name.
    return 'uuid_'


# --------------------------------------------------------------------------------------------------

def get_uuid_fieldname():
    # Gets prefixed to the actual value of the field, as well as being a suffix to the name.
    suffix = get_uuid_value_prefix()
    return get_core_id_fieldname() + '-' + suffix


# --------------------------------------------------------------------------------------------------

def get_main_displayable_fieldname(object_type='work'):
    # Returns the *name within Solr* of the main descriptive/summary field
    # for a particular type of object, e.g. the 'description' field for a work.

    displayfields = get_all_main_displayable_fields()
    return displayfields[object_type]['value']


# --------------------------------------------------------------------------------------------------
def get_work_description_fieldname():
    return 'dcterms_description'


# --------------------------------------------------------------------------------------------------
def get_relations_to_work_fieldname():
    return 'frbr_Work-work'


# --------------------------------------------------------------------------------------------------
def get_relations_to_manifestation_fieldname():
    return 'frbr_Manifestation-manifestation'


# --------------------------------------------------------------------------------------------------
def get_relations_to_image_fieldname():
    return 'frbr_Image-image'


# --------------------------------------------------------------------------------------------------
def get_relations_to_resource_fieldname():
    return 'rdfs_seeAlso-resource'


# --------------------------------------------------------------------------------------------------
def get_work_related_to_resource_fieldname():
    return 'rdfs_seeAlso-work'


# --------------------------------------------------------------------------------------------------
def get_person_related_to_resource_fieldname():
    return 'rdfs_seeAlso-person'


# --------------------------------------------------------------------------------------------------
def get_place_related_to_resource_fieldname():
    return 'rdfs_seeAlso-location'


# --------------------------------------------------------------------------------------------------
def get_insitution_related_to_resource_fieldname():
    return 'rdfs_seeAlso-institution'


# --------------------------------------------------------------------------------------------------
def get_relations_to_people_mentioned_fieldname():
    return 'dcterms_references-person'


# --------------------------------------------------------------------------------------------------
def get_relations_to_places_mentioned_fieldname():
    return 'dcterms_references-location'


# --------------------------------------------------------------------------------------------------
def get_relations_to_works_mentioned_fieldname():
    return 'dcterms_references-work'


# --------------------------------------------------------------------------------------------------
def get_relations_to_comments_fieldname():
    return 'ox_isAnnotatedBy-comment'


# --------------------------------------------------------------------------------------------------
def get_relations_to_comments_on_author_fieldname():
    return 'ox_authorAnnotate-comment'


# --------------------------------------------------------------------------------------------------
def get_relations_to_comments_on_addressee_fieldname():
    return 'ox_addresseeAnnotate-comment'


# --------------------------------------------------------------------------------------------------
def get_relations_to_comments_on_date_fieldname():
    return 'ox_dateAnnotate-comment'


def get_relations_to_comments_on_receipt_date_fieldname():
    return 'ox_dateReceiptAnnotate-comment'


def get_fieldname_comments_on_origin_of_work():
    return 'ox_originAnnotate-comment'


def get_fieldname_work_with_comment_on_origin():
    return 'ox_annotatesOrigin-work'


def get_fieldname_comments_on_destination_of_work():
    return 'ox_destinationAnnotate-comment'


def get_fieldname_work_with_comments_on_destination():
    return 'ox_annotatesDestination-work'


def get_fieldname_comments_on_route_of_work():
    return 'ox_routeAnnotate-comment'


def get_fieldname_work_with_comments_on_route():
    return 'ox_annotatesRoute-work'


# --------------------------------------------------------------------------------------------------
def get_catalogue_fieldname():
    return 'cito_Catalog'


# --------------------------------------------------------------------------------------------------
def get_as_marked_fieldname_end():
    return 'rdf_value'


# --------------------------------------------------------------------------------------------------
def get_type_fieldname():
    return 'rdf_type'


# --------------------------------------------------------------------------------------------------
def get_author_uri_fieldname():
    return 'frbr_creator-person'


# --------------------------------------------------------------------------------------------------
def get_person_with_author_role_fieldname():
    return 'person-author'  # this is used when copied into the 'works' core (see AdditionalSolr.py)


# --------------------------------------------------------------------------------------------------
def get_author_is_org_fieldname():
    return 'person-author-organisation'


# --------------------------------------------------------------------------------------------------
def get_author_gender_fieldname():
    return 'person-author-gender'


# --------------------------------------------------------------------------------------------------
def get_author_roles_fieldname():
    return 'person-author-roles'  # for use in the 'works' core (see AdditionalSolr.py)


# --------------------------------------------------------------------------------------------------
def get_authors_fieldname_start():
    return 'mail_authors'


# --------------------------------------------------------------------------------------------------
def get_author_as_marked_fieldname():
    return get_authors_fieldname_start() + '-' + get_as_marked_fieldname_end()


# --------------------------------------------------------------------------------------------------
def get_addressee_uri_fieldname():
    return 'mail_recipient-person'


# --------------------------------------------------------------------------------------------------
def get_person_with_addressee_role_fieldname():
    return 'person-recipient'  # this is used when copied into the 'works' core (see AdditionalSolr.py)


# --------------------------------------------------------------------------------------------------
def get_addressee_is_org_fieldname():
    return 'person-recipient-organisation'


# --------------------------------------------------------------------------------------------------
def get_addressee_gender_fieldname():
    return 'person-recipient-gender'


# --------------------------------------------------------------------------------------------------
def get_addressee_roles_fieldname():
    return 'person-addressee-roles'  # for use in the 'works' core (see AdditionalSolr.py)


# --------------------------------------------------------------------------------------------------
def get_addressees_fieldname_start():
    return 'mail_addressees'


# --------------------------------------------------------------------------------------------------
def get_addressee_as_marked_fieldname():
    return get_addressees_fieldname_start() + '-' + get_as_marked_fieldname_end()


# --------------------------------------------------------------------------------------------------
def get_details_of_agent_mentioned_fieldname():
    return 'person-mentioned'  # this is used when copied into the 'works' core (see AdditionalSolr.py)


# --------------------------------------------------------------------------------------------------
def get_agent_mentioned_is_org_fieldname():
    return 'person-mentioned-organisation'


# --------------------------------------------------------------------------------------------------
def get_person_mentioned_gender_fieldname():
    return 'person-mentioned-gender'


# --------------------------------------------------------------------------------------------------
def get_agent_mentioned_roles_fieldname():
    return 'person-mentioned-roles'  # for use in the 'works' core (see AdditionalSolr.py)


# --------------------------------------------------------------------------------------------------
def get_origin_fieldname_start():
    return 'mail_origin'


# --------------------------------------------------------------------------------------------------
def get_origin_uri_fieldname():
    return get_origin_fieldname_start() + '-location'


# --------------------------------------------------------------------------------------------------
def get_placename_of_origin_fieldname():
    return 'location-origin'  # this is used when copied into 'works' core


# --------------------------------------------------------------------------------------------------
def get_alternate_placename_of_origin_fieldname():
    return 'location-alternate-origin'  # this is used when copied into 'works' core


# --------------------------------------------------------------------------------------------------
def get_origin_as_marked_fieldname():
    return get_origin_fieldname_start() + '-' + get_as_marked_fieldname_end()


# --------------------------------------------------------------------------------------------------
def get_destination_fieldname_start():
    return 'mail_destination'


# --------------------------------------------------------------------------------------------------
def get_destination_uri_fieldname():
    return get_destination_fieldname_start() + '-location'


# --------------------------------------------------------------------------------------------------
def get_placename_of_destination_fieldname():
    return 'location-destination'  # this is used when copied into 'works' core


# --------------------------------------------------------------------------------------------------
def get_alternate_placename_of_destination_fieldname():
    return 'alternate-location-destination'  # this is used when copied into 'works' core


# --------------------------------------------------------------------------------------------------
def get_destination_as_marked_fieldname():
    return get_destination_fieldname_start() + '-' + get_as_marked_fieldname_end()


# --------------------------------------------------------------------------------------------------
def get_placename_mentioned_fieldname():
    return 'location-mentioned'  # this is used when copied into the 'works' core (see AdditionalSolr.py)


# --------------------------------------------------------------------------------------------------
def get_alternate_placename_mentioned_fieldname():
    return 'alternate-location-mentioned'  # used when copied into the 'works' core (see AdditionalSolr.py)


# --------------------------------------------------------------------------------------------------
def get_day_fieldname():
    return 'ox_day'


# --------------------------------------------------------------------------------------------------
def get_month_fieldname():
    return 'ox_month'


# --------------------------------------------------------------------------------------------------
def get_year_fieldname():
    return 'ox_year'


# --------------------------------------------------------------------------------------------------
def get_period_start_fieldname():
    return 'ox_started'


# --------------------------------------------------------------------------------------------------
def get_period_end_fieldname():
    return 'ox_completed'


# --------------------------------------------------------------------------------------------------
def get_start_day_fieldname():
    return get_period_start_fieldname() + '-' + get_day_fieldname()


# --------------------------------------------------------------------------------------------------
def get_start_month_fieldname():
    return get_period_start_fieldname() + '-' + get_month_fieldname()


# --------------------------------------------------------------------------------------------------
def get_start_year_fieldname():
    return get_period_start_fieldname() + '-' + get_year_fieldname()


# --------------------------------------------------------------------------------------------------
def get_end_day_fieldname():
    return get_period_end_fieldname() + '-' + get_day_fieldname()


# --------------------------------------------------------------------------------------------------
def get_end_month_fieldname():
    return get_period_end_fieldname() + '-' + get_month_fieldname()


# --------------------------------------------------------------------------------------------------
def get_end_year_fieldname():
    return get_period_end_fieldname() + '-' + get_year_fieldname()


# --------------------------------------------------------------------------------------------------
def get_date_range_fieldname():
    return 'ox_dateIsRange'


# --------------------------------------------------------------------------------------------------
def get_original_calendar_fieldname():
    return 'ox_originalCalendar'


# --------------------------------------------------------------------------------------------------
def get_date_as_marked_fieldname():
    return 'ox_dateMarked'


# --------------------------------------------------------------------------------------------------
def get_incipit_fieldname():
    return 'ox_incipit'


# --------------------------------------------------------------------------------------------------
def get_excipit_fieldname():
    return 'ox_excipit'


# --------------------------------------------------------------------------------------------------
def get_postscript_fieldname():
    return 'mail_postScript'


# --------------------------------------------------------------------------------------------------
def get_editors_notes_fieldname():
    return 'ox_editorNotes'


# --------------------------------------------------------------------------------------------------
def get_date_added_fieldname():
    return 'ox_internalAdded'


# --------------------------------------------------------------------------------------------------
def get_date_created_fieldname():
    return 'ox_internalCreated'


# --------------------------------------------------------------------------------------------------
def get_created_by_user_fieldname():
    return 'ox_internalCreatedByUser'


# --------------------------------------------------------------------------------------------------
def get_date_changed_fieldname():
    return 'ox_internalModified'


# --------------------------------------------------------------------------------------------------
def get_changed_by_user_fieldname():
    return 'ox_internalModifiedByUser'


# --------------------------------------------------------------------------------------------------
def get_language_fieldname():
    return 'dcterms_language'


# --------------------------------------------------------------------------------------------------
def get_keywords_fieldname():
    return 'ox_keywords'


# --------------------------------------------------------------------------------------------------
def get_edit_status_fieldname():
    return 'ox_editStatus'


# --------------------------------------------------------------------------------------------------
def get_uncertainty_flag():
    return 'indef_'


# --------------------------------------------------------------------------------------------------
def get_uncertainty_flag_uncertain():
    return get_uncertainty_flag() + 'uncertain'


# --------------------------------------------------------------------------------------------------
def get_uncertainty_flag_inferred():
    return get_uncertainty_flag() + 'inferred'


# --------------------------------------------------------------------------------------------------
def get_uncertainty_flag_approx():
    return get_uncertainty_flag() + 'approximate'


# --------------------------------------------------------------------------------------------------
def get_author_flags_fieldname_root():
    return get_authors_fieldname_start() + '-' + get_uncertainty_flag()


# --------------------------------------------------------------------------------------------------
def get_author_uncertain_fieldname():
    return get_authors_fieldname_start() + '-' + get_uncertainty_flag_uncertain()


# --------------------------------------------------------------------------------------------------
def get_author_inferred_fieldname():
    return get_authors_fieldname_start() + '-' + get_uncertainty_flag_inferred()


# --------------------------------------------------------------------------------------------------
def get_addressee_flags_fieldname_root():
    return get_addressees_fieldname_start() + '-' + get_uncertainty_flag()


# --------------------------------------------------------------------------------------------------
def get_addressee_uncertain_fieldname():
    return get_addressees_fieldname_start() + '-' + get_uncertainty_flag_uncertain()


# --------------------------------------------------------------------------------------------------
def get_addressee_inferred_fieldname():
    return get_addressees_fieldname_start() + '-' + get_uncertainty_flag_inferred()


# --------------------------------------------------------------------------------------------------
def get_origin_flags_fieldname_root():
    return get_origin_fieldname_start() + '-' + get_uncertainty_flag()


# --------------------------------------------------------------------------------------------------
def get_origin_uncertain_fieldname():
    return get_origin_fieldname_start() + '-' + get_uncertainty_flag_uncertain()


# --------------------------------------------------------------------------------------------------
def get_origin_inferred_fieldname():
    return get_origin_fieldname_start() + '-' + get_uncertainty_flag_inferred()


# --------------------------------------------------------------------------------------------------
def get_destination_flags_fieldname_root():
    return get_destination_fieldname_start() + '-' + get_uncertainty_flag()


# --------------------------------------------------------------------------------------------------
def get_destination_uncertain_fieldname():
    return get_destination_fieldname_start() + '-' + get_uncertainty_flag_uncertain()


# --------------------------------------------------------------------------------------------------
def get_destination_inferred_fieldname():
    return get_destination_fieldname_start() + '-' + get_uncertainty_flag_inferred()


# --------------------------------------------------------------------------------------------------
def get_date_flags_fieldname_root():
    return get_period_start_fieldname() + '-' + get_uncertainty_flag()


# --------------------------------------------------------------------------------------------------
def get_date_uncertain_fieldname():
    return get_period_start_fieldname() + '-' + get_uncertainty_flag_uncertain()


# --------------------------------------------------------------------------------------------------
def get_date_inferred_fieldname():
    return get_period_start_fieldname() + '-' + get_uncertainty_flag_inferred()


# --------------------------------------------------------------------------------------------------
def get_date_approx_fieldname():
    return get_period_start_fieldname() + '-' + get_uncertainty_flag_approx()


# --------------------------------------------------------------------------------------------------
def get_creation_date_fieldname():
    return 'dcterms_created'


# --------------------------------------------------------------------------------------------------
def get_creation_date_year_fieldname():
    return get_creation_date_fieldname() + '-' + get_year_fieldname()


# --------------------------------------------------------------------------------------------------
def get_creation_date_month_fieldname():
    return get_creation_date_fieldname() + '-' + get_month_fieldname()


# --------------------------------------------------------------------------------------------------
def get_creation_date_day_fieldname():
    return get_creation_date_fieldname() + '-' + get_day_fieldname()


# --------------------------------------------------------------------------------------------------
def get_creation_date_flags_fieldname_root():
    return get_creation_date_fieldname() + '-' + get_uncertainty_flag()


# --------------------------------------------------------------------------------------------------
def get_creation_date_uncertain_fieldname():
    return get_creation_date_fieldname() + '-' + get_uncertainty_flag_uncertain()


# --------------------------------------------------------------------------------------------------
def get_creation_date_inferred_fieldname():
    return get_creation_date_fieldname() + '-' + get_uncertainty_flag_inferred()


# --------------------------------------------------------------------------------------------------
def get_creation_date_approx_fieldname():
    return get_creation_date_fieldname() + '-' + get_uncertainty_flag_approx()


# --------------------------------------------------------------------------------------------------
def get_manifestation_address_fieldname():
    return 'mail_destination'


# --------------------------------------------------------------------------------------------------
def get_image_source_fieldname():
    return 'dcterms_source'


# --------------------------------------------------------------------------------------------------
def get_image_credits_fieldname():
    return 'ox_imageCredits'


# --------------------------------------------------------------------------------------------------
def get_image_display_order_fieldname():
    return 'ox_imageDisplayOrder'


# --------------------------------------------------------------------------------------------------
def get_thumbnail_fieldname():
    return 'foaf_thumbnail'


# --------------------------------------------------------------------------------------------------
def get_comments_fieldname():
    return 'bibo_Note'


# ----------------------------------------------------------------------------------------------
def get_work_commented_on_fieldname():
    return 'bibo_annotates-work'


# ----------------------------------------------------------------------------------------------
def get_work_with_comment_on_date_fieldname():
    return 'ox_annotatesDate-work'


# ----------------------------------------------------------------------------------------------
def get_manif_with_comment_on_date_fieldname():
    return 'ox_annotatesDate-manifestation'


# ----------------------------------------------------------------------------------------------
def get_manif_with_comment_on_receipt_date_fieldname():
    return 'ox_annotatesReceiptDate-manifestation'


# ----------------------------------------------------------------------------------------------
def get_work_with_comment_on_author_fieldname():
    return 'ox_annotatesAuthor-work'


# ----------------------------------------------------------------------------------------------
def get_work_with_comment_on_addressee_fieldname():
    return 'ox_annotatesAddressee-work'


# ----------------------------------------------------------------------------------------------
def get_person_commented_on_fieldname():
    return 'bibo_annotates-person'


# ----------------------------------------------------------------------------------------------
def get_manifestation_commented_on_fieldname():
    return 'bibo_annotates-manifestation'


# ----------------------------------------------------------------------------------------------
def get_place_commented_on_fieldname():
    return 'bibo_annotates-location'


# ----------------------------------------------------------------------------------------------
def get_person_name_fieldname():
    return 'foaf_name'


# ----------------------------------------------------------------------------------------------
def get_person_further_reading_fieldname():
    return 'ox_furtherReading'


# ----------------------------------------------------------------------------------------------
def get_person_name_first_letter_fieldname():
    return get_person_name_fieldname() + '-firstletter'


# ----------------------------------------------------------------------------------------------
def get_location_name_fieldname():
    return 'geonames_name'


# ----------------------------------------------------------------------------------------------
def get_location_synonyms_fieldname():
    # return 'geonames_alternateName' -- Unfortunately this is already in use for repository
    return 'ox_locationAlternateName'


# ----------------------------------------------------------------------------------------------
def get_repository_fieldname():
    return 'ox_resourceAt-institution'


# --------------------------------------------------------------------------------------------------
def get_repository_contents_fieldname():
    return 'ox_hasResource-manifestation'


# --------------------------------------------------------------------------------------------------
def get_repository_name_fieldname():
    return 'geonames_officialName'


# ----------------------------------------------------------------------------------------------
def get_repository_alternate_name_fieldname():
    return 'geonames_alternateName'


# --------------------------------------------------------------------------------------------------
def get_repository_city_fieldname():
    return 'geonames_locatedIn'


# --------------------------------------------------------------------------------------------------
def get_repository_alternate_city_fieldname():
    return 'ox_locatedInAlternate'


# --------------------------------------------------------------------------------------------------
def get_repository_country_fieldname():
    return 'geonames_inCountry'


# --------------------------------------------------------------------------------------------------
def get_repository_alternate_country_fieldname():
    return 'ox_inCountryAlternate'


# --------------------------------------------------------------------------------------------------
def get_manifestation_type_fieldname():
    return 'dcterms_type'


# ----------------------------------------------------------------------------------------------
def get_resource_title_fieldname():
    # return 'dcterms_title'  # we will reserve this for Work title (used by IMPAcT)
    return 'ox_titleOfResource'


# ----------------------------------------------------------------------------------------------
def get_resource_details_fieldname():
    # return 'dcterms_description'  # we will reserve this for Work description (used by CofK)
    return 'ox_detailsOfResource'


# ----------------------------------------------------------------------------------------------
def get_resource_url_fieldname():
    return 'dcterms_relation'


# ----------------------------------------------------------------------------------------------
def get_abstract_fieldname():
    return 'dcterms_abstract'


# ----------------------------------------------------------------------------------------------
def get_alias_fieldname():
    return 'skos_altLabel'


# ----------------------------------------------------------------------------------------------
def get_birth_fieldname():
    return 'bio_Birth'


# ----------------------------------------------------------------------------------------------
def get_birth_year_fieldname():
    return get_birth_fieldname() + '-' + get_year_fieldname()


# ----------------------------------------------------------------------------------------------
def get_birth_month_fieldname():
    return get_birth_fieldname() + '-' + get_month_fieldname()


# --------------------------------------------------------------------------------------------------
def get_birth_day_fieldname():
    return get_birth_fieldname() + '-' + get_day_fieldname()


# --------------------------------------------------------------------------------------------------
def get_birth_date_flags_fieldname_root():
    return get_birth_fieldname() + '-' + get_uncertainty_flag()


# --------------------------------------------------------------------------------------------------
def get_birth_date_uncertain_fieldname():
    return get_birth_fieldname() + '-' + get_uncertainty_flag_uncertain()


# --------------------------------------------------------------------------------------------------
def get_birth_date_inferred_fieldname():
    return get_birth_fieldname() + '-' + get_uncertainty_flag_inferred()


# --------------------------------------------------------------------------------------------------
def get_birth_date_approx_fieldname():
    return get_birth_fieldname() + '-' + get_uncertainty_flag_approx()


# --------------------------------------------------------------------------------------------------
def get_death_fieldname():
    return 'bio_Death'


# ----------------------------------------------------------------------------------------------
def get_death_year_fieldname():
    return get_death_fieldname() + '-' + get_year_fieldname()


# ----------------------------------------------------------------------------------------------
def get_death_month_fieldname():
    return get_death_fieldname() + '-' + get_month_fieldname()


# --------------------------------------------------------------------------------------------------
def get_death_day_fieldname():
    return get_death_fieldname() + '-' + get_day_fieldname()


# --------------------------------------------------------------------------------------------------
def get_death_date_flags_fieldname_root():
    return get_death_fieldname() + '-' + get_uncertainty_flag()


# --------------------------------------------------------------------------------------------------
def get_death_date_uncertain_fieldname():
    return get_death_fieldname() + '-' + get_uncertainty_flag_uncertain()


# --------------------------------------------------------------------------------------------------
def get_death_date_inferred_fieldname():
    return get_death_fieldname() + '-' + get_uncertainty_flag_inferred()


# --------------------------------------------------------------------------------------------------
def get_death_date_approx_fieldname():
    return get_death_fieldname() + '-' + get_uncertainty_flag_approx()


# --------------------------------------------------------------------------------------------------
def get_latitude_fieldname():
    return 'geo_lat'


# ----------------------------------------------------------------------------------------------
def get_longitude_fieldname():
    return 'geo_long'


# ----------------------------------------------------------------------------------------------
def get_works_created_fieldname():
    return 'frbr_creatorOf-work'


# ----------------------------------------------------------------------------------------------
def get_letters_received_fieldname():
    return 'mail_recipientOf-work'


# ----------------------------------------------------------------------------------------------
def get_letters_intended_fn():
    return 'mail_intendedFor-work'


# --------------------------------------------------------------------------------------------------
def get_intended_uri_fn():
    return 'mail_intended-person'


# ----------------------------------------------------------------------------------------------
def get_works_in_which_mentioned_fieldname():
    return 'dcterms_isReferencedBy-work'


# ----------------------------------------------------------------------------------------------
def get_is_organisation_fieldname():
    return 'ox_isOrganisation'


# ----------------------------------------------------------------------------------------------
def get_orgs_of_which_member_fieldname():
    return 'ox_memberOf-person'


# ----------------------------------------------------------------------------------------------
def get_members_of_org_fieldname():
    return 'foaf_member-person'


# ----------------------------------------------------------------------------------------------
def get_gender_fieldname():
    return 'foaf_gender'


# ----------------------------------------------------------------------------------------------
def get_paper_size_fieldname():
    return 'mail_paperSize'


# ----------------------------------------------------------------------------------------------
def get_manif_paper_size_fieldname():  # fieldname when copied into the 'work' core
    return 'manifestation-paper_size'


# ----------------------------------------------------------------------------------------------
def get_paper_type_fieldname():
    return 'mail_paper'


# ----------------------------------------------------------------------------------------------
def get_manif_paper_type_fieldname():  # fieldname when copied into the 'work' core
    return 'manifestation-paper_type'


# ----------------------------------------------------------------------------------------------
def get_number_of_pages_of_document_fieldname():
    return 'bibo_numPages'


# ----------------------------------------------------------------------------------------------
def get_number_of_pages_of_text_fieldname():
    return 'ox_numPageText'


# ----------------------------------------------------------------------------------------------
def get_manif_numpages_fieldname():  # fieldname when copied into the 'work' core
    return 'manifestation-pages_number'


# ----------------------------------------------------------------------------------------------
def get_seal_fieldname():
    return 'mail_seal'


# ----------------------------------------------------------------------------------------------
def get_manif_seal_fieldname():  # fieldname when copied into the 'work' core
    return 'manifestation-seal'


# ----------------------------------------------------------------------------------------------
def get_endorsements_fieldname():
    return 'ox_endorsements'


# ----------------------------------------------------------------------------------------------
def get_manif_endorsements_fieldname():  # fieldname when copied into the 'work' core
    return 'manifestation-endorsements'


# ----------------------------------------------------------------------------------------------
def get_non_letter_enclosures_fieldname():
    return 'ox_nonLetterEnclosures'


# ----------------------------------------------------------------------------------------------
def get_manif_non_letter_enclosures_fieldname():  # fieldname when copied into the 'work' core
    return 'manifestation-non_letter_enclosures'


# ----------------------------------------------------------------------------------------------
def get_postage_mark_fieldname():
    return 'mail_postageMark'


# ----------------------------------------------------------------------------------------------
def get_manif_postage_mark_fieldname():  # fieldname when copied into the 'work' core
    return 'manifestation-postage_mark'


# ----------------------------------------------------------------------------------------------
def get_printed_edition_details_fieldname():
    return 'ox_printedEditionDetails'


# ----------------------------------------------------------------------------------------------
def get_enclosing_fieldname():
    return 'mail_enclosedBy-manifestation'


# ----------------------------------------------------------------------------------------------
def get_enclosed_fieldname():
    return 'mail_enclosureOf-manifestation'


# ----------------------------------------------------------------------------------------------
def get_manif_enclosed_fieldname():  # fieldname when copied into the 'work' core
    return 'manifestation-enclosed'


# ----------------------------------------------------------------------------------------------
def get_manif_with_enclosure_fieldname():  # fieldname when copied into the 'work' core
    return 'manifestation-enclosure'


# ----------------------------------------------------------------------------------------------
def get_works_with_origin_fieldname():
    return 'mail_originOf-work'


# ----------------------------------------------------------------------------------------------
def get_works_with_destination_fieldname():
    return 'mail_destinationOf-work'


# ----------------------------------------------------------------------------------------------
def get_related_works_fieldname():
    # Duplicates get_work_related_to_resource_fieldname() so no need to hard-code twice
    return get_work_related_to_resource_fieldname()


# ----------------------------------------------------------------------------------------------
def get_related_people_fieldname():
    # Duplicates get_person_related_to_resource_fieldname() so no need to hard-code twice
    return get_person_related_to_resource_fieldname()


# ----------------------------------------------------------------------------------------------
def get_related_places_fieldname():
    # Duplicates get_place_related_to_resource_fieldname() so no need to hard-code twice
    return get_place_related_to_resource_fieldname()


# ----------------------------------------------------------------------------------------------
def get_person_titles_or_roles_fieldname():
    return 'ox_titlesRolesOccupations'


# ----------------------------------------------------------------------------------------------
def get_reply_to_fieldname():
    return 'mail_replyTo-work'


# ----------------------------------------------------------------------------------------------
def get_answered_by_fieldname():
    return 'mail_hasReply-work'


# ----------------------------------------------------------------------------------------------
def get_matches_fieldname():
    return 'owl_sameAs-work'


# ----------------------------------------------------------------------------------------------
def get_manif_has_image_fieldname():
    return 'manifestation-has_image'


# ----------------------------------------------------------------------------------------------
def get_manif_repository_fieldname():
    return 'manifestation-institution-place'


# ----------------------------------------------------------------------------------------------
def get_manif_doc_type_fieldname():
    return 'manifestation-doc_type'


# ----------------------------------------------------------------------------------------------
def get_manif_shelfmark_fieldname():  # fieldname when copied into the 'work' core
    return 'manifestation-shelfmark'


# ----------------------------------------------------------------------------------------------
def get_manif_printed_edition_fieldname():
    return 'manifestation-printed_edition'


# ----------------------------------------------------------------------------------------------
def get_is_translation_fieldname():
    return 'ox_isTranslation'


# ----------------------------------------------------------------------------------------------
def get_manifs_owned_fieldname():
    return 'ox_previouslyOwned-manifestation'


# ----------------------------------------------------------------------------------------------
def get_former_owner_fieldname():
    return 'ox_previouslyOwnedBy-person'


# ----------------------------------------------------------------------------------------------
def get_handwrote_fieldname():
    return 'mail_handwrote-manifestation'


# ----------------------------------------------------------------------------------------------
def get_handwritten_by_fieldname():
    return 'mail_handwroteBy-person'


# ----------------------------------------------------------------------------------------------
def get_is_parent_of_fieldname():
    return 'rel_parentOf-person'


# ----------------------------------------------------------------------------------------------
def get_is_child_of_fieldname():
    return 'rel_childOf-person'


# ----------------------------------------------------------------------------------------------
def get_is_spouse_of_fieldname():
    return 'rel_spouseOf-person'


# ----------------------------------------------------------------------------------------------
def get_is_sibling_of_fieldname():
    return 'rel_siblingOf-person'


# ----------------------------------------------------------------------------------------------
def get_is_relative_of_fieldname():
    return 'rel_relativeOf-person'


# ----------------------------------------------------------------------------------------------
def get_unspecified_relationship_with_fieldname():
    return 'ox_unspecifiedRelationshipWith-person'


# ----------------------------------------------------------------------------------------------
def get_place_where_born_fieldname():
    return 'ox_wasBornIn-location'


# ----------------------------------------------------------------------------------------------
def get_people_born_at_place_fieldname():
    return 'rel_wasBirthplaceOf-person'


# ----------------------------------------------------------------------------------------------
def get_place_where_died_fieldname():
    return 'ox_diedAt-location'


# ----------------------------------------------------------------------------------------------
def get_people_who_died_at_place_fieldname():
    return 'rel_wasPlaceOfDeathOf-person'


# ----------------------------------------------------------------------------------------------
def get_place_visited_fieldname():
    return 'ox_wasAt-location'


# ----------------------------------------------------------------------------------------------
def get_people_who_visited_place_fieldname():
    return 'rel_wasVisitedBy-person'


# ----------------------------------------------------------------------------------------------
def get_works_with_comments_on_people_mentioned_fieldname():
    return 'ox_annotatesAgentsReferenced-work'


# ----------------------------------------------------------------------------------------------
def get_comments_on_people_mentioned_in_work_fieldname():
    return 'ox_agentsReferencedAnnotatedBy-comment'


# ----------------------------------------------------------------------------------------------
def get_source_of_data_fieldname():
    return 'ox_sourceOfData'


# ----------------------------------------------------------------------------------------------
def get_total_works_written_by_agent_fieldname():
    return 'ox_totalWorksByAgent'


# ----------------------------------------------------------------------------------------------
def get_total_works_recd_by_agent_fieldname():
    return 'ox_totalWorksAddressedToAgent'


# ----------------------------------------------------------------------------------------------
def get_total_works_mentioning_agent_fieldname():
    return 'ox_totalWorksMentioningAgent'


# ----------------------------------------------------------------------------------------------
def get_total_works_sent_from_place_fieldname():
    return 'ox_totalWorksSentFromPlace'


# ----------------------------------------------------------------------------------------------
def get_total_works_sent_to_place_fieldname():
    return 'ox_totalWorksSentToPlace'


# ----------------------------------------------------------------------------------------------
def get_total_works_mentioning_place_fieldname():
    return 'ox_totalWorksMentioningPlace'


# ----------------------------------------------------------------------------------------------
def get_total_docs_in_repos_fieldname():
    return 'ox_totalDocsInRepository'


# ----------------------------------------------------------------------------------------------
def get_transcription_url_fieldname():
    return 'ox_urlOfTranscription'


# ----------------------------------------------------------------------------------------------

def get_opened_fn():
    return 'ox_opened'


def get_routing_mark_stamp_fn():
    return 'ox_routing_mark_stamp'


def get_routing_mark_ms_fn():
    return 'ox_routing_mark_ms'


def get_handling_instructions_fn():
    return 'ox_handling_instructions'


def get_stored_folded_fn():
    return 'ox_stored_folded'


def get_postage_costs_as_marked_fn():
    return 'ox_postage_costs_as_marked'


def get_postage_costs_fn():
    return 'ox_postage_costs'


def get_non_delivery_reason_fn():
    return 'ox_non_delivery_reason'


def get_date_of_receipt_as_marked_fn():
    return 'ox_date_of_receipt_as_marked'


def get_manifestation_receipt_calendar_fn():
    return 'ox_manifestation_receipt_calendar'


def get_manifestation_receipt_date_fn():
    return 'ox_manifestation_receipt_date'


def get_manifestation_receipt_date_gregorian_fn():
    return 'ox_manifestation_receipt_date_gregorian'


def get_fieldname_manifestation_receipt_date_year():
    return 'ox_manifestation_receipt_date_year'


def get_fieldname_manifestation_receipt_date_month():
    return 'ox_manifestation_receipt_date_month'


def get_fieldname_manifestation_receipt_date_day():
    return 'ox_manifestation_receipt_date_day'


def get_manifestation_receipt_date_inferred_fn():
    return 'ox_manifestation_receipt_date_inferred'


def get_manifestation_receipt_date_uncertain_fn():
    return 'ox_manifestation_receipt_date_uncertain'


def get_manifestation_receipt_date_approx_fn():
    return 'ox_manifestation_receipt_date_approx'


def get_manifestation_receipt_date2_year_fn():
    return 'ox_manifestation_receipt_date2_year'


def get_manifestation_receipt_date2_month_fn():
    return 'ox_manifestation_receipt_date2_month'


def get_manifestation_receipt_date2_day_fn():
    return 'ox_manifestation_receipt_date2_day'


def get_manifestation_receipt_date_is_range_fn():
    return 'ox_manifestation_receipt_date_is_range'


def get_accompaniments_fn():
    return 'ox_accompaniments'


def get_taught_fn():
    return 'taught-person'


def get_taught_by_fn():
    return 'was_taught_by-person'


def get_employed_fn():
    return 'employed-person'


def get_employed_by_fn():
    return 'was_employed_by-person'


def get_friend_fn():
    return 'friend-person'


if __name__ == '__main__':
    print('\nFieldmap.py: settings:')
    print('=====================\n')

    current_module = sys.modules[__name__]
    module_items = current_module.__dict__.items()
    funcnames = []

    for it in module_items:
        item_name = it[0]
        obj = getattr(current_module, item_name)
        if inspect.isfunction(obj):
            funcnames.append(item_name)

    sortedfuncs = sorted(funcnames, key=lambda funcstring: funcstring)

    for funcname in sortedfuncs:
        obj = getattr(current_module, funcname)
        if inspect.isfunction(obj):
            retval = obj()
            print(funcname)
            print('  ' + str(retval) + '\n')

    print('*** End of fieldmap settings ***')

# ----------------------------------------------------------------------------------------------
