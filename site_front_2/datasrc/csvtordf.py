# -*- coding: utf-8 -*-
'''
Created on 25 Aug 2010

@author: Matthew Wilcoxson

This file converts the CSV data into valid RDF and importds it into SOlr.
Also see "relationships.py"
'''

# sys.path.append( '../../../pylons/web/web/lib' )
from site_front_2 import fieldmap
# The 'fieldmap' module passes back the fieldname as a string.
# By using functions from 'fieldmap', we can restrict fieldnames to being hard-coded in only
# ONE place, allowing much easier changes if a better ontology is found. (SB, 13 July 2011)
from .conversionhelper import *  # For converter functions (e.g. convert to date)

# The list of lists of csv files. (You can comment out lines to only debug specific ones)
csv_files = {
    'relationships': ['relationship.csv'],
    'locations': ['location.csv'],
    'comments': ['comment.csv'],
    'images': ['image.csv'],
    'people': ['person.csv'],
    'works': ['work.csv'],
    'manifestations': ['manifestation.csv'],
    'institutions': ['institution.csv'],
    'resources': ['resource.csv']
}

# The list of lists of csv files. (You can comment out lines to only debug specific ones)
test_csv_files = {
    'relationships': ['small/cofk_lister_relationship.csv'],
    'locations': ['small/cofk_lister_location.csv'],
    'comments': ['small/cofk_lister_comment.csv'],
    'images': ['small/cofk_lister_image.csv'],
    'people': ['small/cofk_lister_person.csv'],
    'works': ['small/cofk_lister_work.csv'],
    'manifestations': ['small/cofk_lister_manifestation.csv'],
    'institutions': ['small/cofk_lister_institution.csv'],
    'resources': ['small/cofk_lister_resource.csv']
}

#
# The long conversion array below is now a pointless annoyance...
# The original idea was to output RDF in the front end, but it doesn't do that.
# So this just changes fieldnames to something else...

# The conversion array has the following settings:
title_singular = 'title_singular'  # title_singular - for addition to base uri
title_plural = 'title_plural'  # title plural - for name of entity store
translations = 'translations'  # translations - the list of rdf values for each csv column name
# with following settings:
predicate = 'predicate'  # predicate - what rdf to replace CSV column  name (e.g. predicate: "dcterms:identifier" )
prefix = 'prefix'  # prefix - what to add to the front of the data (e.g. prefix:"uuri:" )
store = 'store'  # store - mark if useful to store in redis, used to store ID field at moment ( store:"id" )
converter = 'converter'  # converter - this is a function that will be called to change the data into a valid format. (e.g. converter: convert_to_rdf_date)

transient = 'transient'  # transient - this predicate is to be stored in a sub resource
#     with following settings:
#         transient - id to append to main URI (e.g. transient:"_authors")
#         predicate - predicate to use for new URI (e.g. predicate "mail:authors"
ignoreIfEqual = 'ignoreIfEqual'  # ignoreIfEqual - ignore this piece of data if set to this value (post converter)
additional = 'additional'  # additional - a list of additional values to add which are not in the csv file
solr = 'solr'  # solr - an alternative name to use in solr (currently only for fields not translated to RDF)

type_fieldname = fieldmap.get_type_fieldname()

conversions = [
    ############
    #
    # locations
    #
    {
        title_singular: "location",
        title_plural: "locations",

        translations: {

            'location_id':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_normal_id_value_prefix(),
                    store: "id"
                },

            'latitude':
                {
                    predicate: fieldmap.get_latitude_fieldname()
                },

            'longitude':
                {
                    predicate: fieldmap.get_longitude_fieldname(),
                },

            'location_name':
                {
                    predicate: fieldmap.get_location_name_fieldname()
                },

            'location_synonyms':
                {
                    predicate: fieldmap.get_location_synonyms_fieldname()
                },

            'creation_timestamp':
                {
                    predicate: fieldmap.get_date_created_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'change_timestamp':
                {
                    predicate: fieldmap.get_date_changed_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'creation_user': None,  # ignore
            'published': None,  # ignore

            'change_user':
                {
                    predicate: fieldmap.get_changed_by_user_fieldname(),
                },

            'sent_count':
                {
                    predicate: fieldmap.get_total_works_sent_from_place_fieldname(),
                },

            'recd_count':
                {
                    predicate: fieldmap.get_total_works_sent_to_place_fieldname(),
                },

            'mentioned_count':
                {
                    predicate: fieldmap.get_total_works_mentioning_place_fieldname(),
                },
            'uuid':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_uuid_value_prefix()
                    # store: "uuid"
                },
            'element_1_eg_room':
                {
                    predicate: "level_room",
                },
            'element_2_eg_building':
                {
                    predicate: 'level_building',
                },
            'element_3_eg_parish':
                {
                    predicate: "level_parish",
                },
            'element_4_eg_city':
                {
                    predicate: "level_city",
                },
            'element_5_eg_county':
                {
                    predicate: "level_county",
                },
            'element_6_eg_country':
                {
                    predicate: "level_country",
                },
            'element_7_eg_empire':
                {
                    predicate: "level_empire",
                },
        },

        additional: {
            type_fieldname: 'http://purl.org/dc/terms/Location'
        }
    },

    #########
    #
    # comments
    #
    {
        title_singular: "comment",
        title_plural: "comments",

        translations: {

            'comment_id':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_normal_id_value_prefix(),
                    store: "id"
                },

            'comment':
                {
                    predicate: fieldmap.get_comments_fieldname()
                },

            'creation_timestamp':
                {
                    predicate: fieldmap.get_date_created_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'change_timestamp':
                {
                    predicate: fieldmap.get_date_changed_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'creation_user': None,  # ignore
            'published': None,  # ignore

            'change_user':
                {
                    predicate: fieldmap.get_changed_by_user_fieldname(),
                },
            'uuid':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_uuid_value_prefix()
                    # store: "uuid"
                }
        },

        additional: {
            type_fieldname: 'http://purl.org/ontology/bibo/Note'
        }
    },

    ##########
    #
    # images
    #
    {
        title_singular: "image",
        title_plural: "images",

        translations: {

            'image_id':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_normal_id_value_prefix(),
                    store: "id"
                },

            'image_filename':
                {
                    predicate: fieldmap.get_image_source_fieldname(),
                },

            'thumbnail':
                {
                    predicate: fieldmap.get_thumbnail_fieldname(),
                },

            'display_order':
                {
                    predicate: fieldmap.get_image_display_order_fieldname(),
                },

            'credits':
                {
                    predicate: fieldmap.get_image_credits_fieldname(),
                },

            'creation_timestamp':
                {
                    predicate: fieldmap.get_date_created_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'change_timestamp':
                {
                    predicate: fieldmap.get_date_changed_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'creation_user': None,  # ignore
            'published': None,  # ignore

            'change_user':
                {
                    predicate: fieldmap.get_changed_by_user_fieldname(),
                },
            'uuid':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_uuid_value_prefix()
                    # store: "uuid"
                }
        },

        additional: {
            type_fieldname: 'http://purl.org/dc/dcmitype/Image'
        }
    },
    #########
    #
    # works
    #
    {
        title_singular: "work",
        title_plural: "works",

        translations: {

            'work_id':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_normal_id_value_prefix(),
                    store: "id"
                },

            'iwork_id':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_integer_id_value_prefix(),
                },

            'original_catalogue':
                {
                    predicate: fieldmap.get_catalogue_fieldname(),
                },

            'abstract':
                {
                    predicate: fieldmap.get_abstract_fieldname(),
                },

            'description':
                {
                    predicate: fieldmap.get_work_description_fieldname(),
                },

            'authors_as_marked':
                {
                    predicate: fieldmap.get_as_marked_fieldname_end(),
                    transient: {
                        transient: "_authors",
                        predicate: fieldmap.get_authors_fieldname_start()
                    },
                },

            'authors_uncertain':
                {
                    predicate: fieldmap.get_uncertainty_flag_uncertain(),
                    transient: {
                        transient: "_authors",
                        predicate: fieldmap.get_authors_fieldname_start()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'authors_inferred':
                {
                    predicate: fieldmap.get_uncertainty_flag_inferred(),
                    transient: {
                        transient: "_authors",
                        predicate: fieldmap.get_authors_fieldname_start()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'destination_as_marked':
                {
                    predicate: fieldmap.get_as_marked_fieldname_end(),
                    transient: {
                        transient: "_destination",
                        predicate: fieldmap.get_destination_fieldname_start()
                    },
                },

            'destination_uncertain':
                {
                    predicate: fieldmap.get_uncertainty_flag_uncertain(),
                    transient: {
                        transient: "_destination",
                        predicate: fieldmap.get_destination_fieldname_start()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'destination_inferred':
                {
                    predicate: fieldmap.get_uncertainty_flag_inferred(),
                    transient: {
                        transient: "_destination",
                        predicate: fieldmap.get_destination_fieldname_start()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'origin_as_marked':
                {
                    predicate: fieldmap.get_as_marked_fieldname_end(),
                    transient: {
                        transient: "_origin",
                        predicate: fieldmap.get_origin_fieldname_start()
                    },
                },

            'origin_inferred':
                {
                    predicate: fieldmap.get_uncertainty_flag_inferred(),
                    transient: {
                        transient: "_origin",
                        predicate: fieldmap.get_origin_fieldname_start()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'origin_uncertain':
                {
                    predicate: fieldmap.get_uncertainty_flag_uncertain(),
                    transient: {
                        transient: "_origin",
                        predicate: fieldmap.get_origin_fieldname_start()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'original_calendar':
                {
                    predicate: fieldmap.get_original_calendar_fieldname(),
                },

            'addressees_as_marked':
                {
                    predicate: fieldmap.get_as_marked_fieldname_end(),
                    transient: {
                        transient: "_addressees",
                        predicate: fieldmap.get_addressees_fieldname_start()
                    },
                },

            'addressees_uncertain':
                {
                    predicate: fieldmap.get_uncertainty_flag_uncertain(),
                    transient: {
                        transient: "_addressees",
                        predicate: fieldmap.get_addressees_fieldname_start()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'addressees_inferred':
                {
                    predicate: fieldmap.get_uncertainty_flag_inferred(),
                    transient: {
                        transient: "_addressees",
                        predicate: fieldmap.get_addressees_fieldname_start()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'date_of_work_std_year':
                {
                    predicate: fieldmap.get_year_fieldname(),
                    transient: {
                        transient: "_started",
                        predicate: fieldmap.get_period_start_fieldname()
                    },
                },

            'date_of_work_std_month':
                {
                    predicate: fieldmap.get_month_fieldname(),
                    transient: {
                        transient: "_started",
                        predicate: fieldmap.get_period_start_fieldname()
                    },
                },

            'date_of_work_std_day':
                {
                    predicate: fieldmap.get_day_fieldname(),
                    transient: {
                        transient: "_started",
                        predicate: fieldmap.get_period_start_fieldname()
                    },
                },

            'date_of_work_uncertain':
                {
                    predicate: fieldmap.get_uncertainty_flag_uncertain(),
                    transient: {
                        transient: "_started",
                        predicate: fieldmap.get_period_start_fieldname()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'date_of_work_inferred':
                {
                    predicate: fieldmap.get_uncertainty_flag_inferred(),
                    transient: {
                        transient: "_started",
                        predicate: fieldmap.get_period_start_fieldname()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'date_of_work_approx':
                {
                    predicate: fieldmap.get_uncertainty_flag_approx(),
                    transient: {
                        transient: "_started",
                        predicate: fieldmap.get_period_start_fieldname()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'date_of_work2_std_year':
                {
                    predicate: fieldmap.get_year_fieldname(),
                    transient: {
                        transient: "_completed",
                        predicate: fieldmap.get_period_end_fieldname()
                    },
                },

            'date_of_work2_std_month':
                {
                    predicate: fieldmap.get_month_fieldname(),
                    transient: {
                        transient: "_completed",
                        predicate: fieldmap.get_period_end_fieldname()
                    },
                },

            'date_of_work2_std_day':
                {
                    predicate: fieldmap.get_day_fieldname(),
                    transient: {
                        transient: "_completed",
                        predicate: fieldmap.get_period_end_fieldname()
                    },
                },

            'date_of_work_std_is_range':
                {
                    predicate: fieldmap.get_date_range_fieldname(),
                    converter: convert_to_rdf_boolean,
                },

            'date_of_work_as_marked':
                {
                    predicate: fieldmap.get_date_as_marked_fieldname(),
                },

            'language_of_work':
                {
                    predicate: fieldmap.get_language_fieldname(),
                },

            'work_is_translation':
                {
                    predicate: fieldmap.get_is_translation_fieldname(),
                    converter: convert_to_rdf_boolean,
                },

            'ps':
                {
                    predicate: fieldmap.get_postscript_fieldname(),
                },

            'explicit':
                {
                    predicate: fieldmap.get_excipit_fieldname(),  # Should this be called "explicit"?? (No, I don't
                },  # think so. Some researchers seem to like
            # 'excipit', some like 'explicit', can't please
            # them all. But they've now gone for 'excipit'.)
            'incipit':
                {
                    predicate: fieldmap.get_incipit_fieldname(),
                },

            'keywords':
                {
                    predicate: fieldmap.get_keywords_fieldname(),
                },

            'editors_notes': None,  # ignore, as on CofK this field is for private notes
            'edit_status': None,  # ignore, as on CofK this field is not currently used

            'creation_timestamp':
                {
                    predicate: fieldmap.get_date_created_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'change_timestamp':
                {
                    predicate: fieldmap.get_date_changed_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'date_of_work_std':
                {
                    predicate: None,
                    solr: 'started_date_sort',
                    converter: convert_to_solr_date,
                },

            'date_of_work_std_gregorian':
                {
                    predicate: None,
                    solr: 'started_date_gregorian_sort',
                    converter: convert_to_solr_date,
                },

            'accession_code':
                {
                    predicate: fieldmap.get_source_of_data_fieldname(),
                },

            'work_to_be_deleted': None,  # ignore
            'relevant_to_cofk': None,  # ignore
            'creation_user': None,  # ignore
            'published': None,  # ignore

            'change_user':
                {
                    predicate: fieldmap.get_changed_by_user_fieldname(),
                },
            'uuid':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_uuid_value_prefix()
                    # store: "uuid"
                }
        },

        additional: {
            type_fieldname: 'http://purl.org/net/biblio#Letter'
        }
    },

    ########
    #
    # People
    #
    {
        title_singular: "person",
        title_plural: "people",

        translations: {

            'person_id':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_normal_id_value_prefix(),
                    store: "id"
                },

            'iperson_id':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_integer_id_value_prefix(),
                },

            'is_organisation':
                {
                    predicate: fieldmap.get_is_organisation_fieldname(),
                    converter: convert_to_rdf_boolean,
                },

            'date_of_birth_day':
                {
                    predicate: fieldmap.get_day_fieldname(),
                    transient: {
                        transient: "_date_of_birth",
                        predicate: fieldmap.get_birth_fieldname()
                    },
                },

            'date_of_birth_month':
                {
                    predicate: fieldmap.get_month_fieldname(),
                    transient: {
                        transient: "_date_of_birth",
                        predicate: fieldmap.get_birth_fieldname()
                    },
                },

            'date_of_birth_year':
                {
                    predicate: fieldmap.get_year_fieldname(),
                    transient: {
                        transient: "_date_of_birth",
                        predicate: fieldmap.get_birth_fieldname()
                    },
                },

            'date_of_birth_inferred':
                {
                    predicate: fieldmap.get_uncertainty_flag_inferred(),
                    transient: {
                        transient: "_date_of_birth",
                        predicate: fieldmap.get_birth_fieldname()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'date_of_birth_uncertain':
                {
                    predicate: fieldmap.get_uncertainty_flag_uncertain(),
                    transient: {
                        transient: "_date_of_birth",
                        predicate: fieldmap.get_birth_fieldname()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'date_of_birth_approx':
                {
                    predicate: fieldmap.get_uncertainty_flag_approx(),
                    transient: {
                        transient: "_date_of_birth",
                        predicate: fieldmap.get_birth_fieldname()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'person_aliases':
                {
                    predicate: fieldmap.get_person_titles_or_roles_fieldname(),
                },

            'skos_altlabel':
                {
                    predicate: fieldmap.get_alias_fieldname(),
                },

            'foaf_name':
                {
                    predicate: fieldmap.get_person_name_fieldname(),
                    # could do with adding firstName, givenName, surname...
                },  # yeah well, we're not going to, data model is frozen for now.

            'date_of_death_day':
                {
                    predicate: fieldmap.get_day_fieldname(),
                    transient: {
                        transient: "_date_of_death",
                        predicate: fieldmap.get_death_fieldname()
                    },
                },

            'date_of_death_month':
                {
                    predicate: fieldmap.get_month_fieldname(),
                    transient: {
                        transient: "_date_of_death",
                        predicate: fieldmap.get_death_fieldname()
                    },
                },

            'date_of_death_year':
                {
                    predicate: fieldmap.get_year_fieldname(),
                    transient: {
                        transient: "_date_of_death",
                        predicate: fieldmap.get_death_fieldname()
                    },
                },

            'date_of_death_inferred':
                {
                    predicate: fieldmap.get_uncertainty_flag_inferred(),
                    transient: {
                        transient: "_date_of_death",
                        predicate: fieldmap.get_death_fieldname()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'date_of_death_uncertain':
                {
                    predicate: fieldmap.get_uncertainty_flag_uncertain(),
                    transient: {
                        transient: "_date_of_death",
                        predicate: fieldmap.get_death_fieldname()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'date_of_death_approx':
                {
                    predicate: fieldmap.get_uncertainty_flag_approx(),
                    transient: {
                        transient: "_date_of_death",
                        predicate: fieldmap.get_death_fieldname()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'gender':
                {
                    predicate: fieldmap.get_gender_fieldname(),
                    converter: convert_people_gender,
                },

            'creation_timestamp':
                {
                    predicate: fieldmap.get_date_created_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'change_timestamp':
                {
                    predicate: fieldmap.get_date_changed_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'date_of_death':
                {
                    predicate: None,
                    solr: 'date_of_death_sort',
                    converter: convert_to_solr_date,
                },

            'date_of_birth':
                {
                    predicate: None,
                    solr: 'date_of_birth_sort',
                    converter: convert_to_solr_date,
                },

            'skos_hiddenlabel': None,
            'creation_user': None,
            'published': None,  # ignore

            'change_user':
                {
                    predicate: fieldmap.get_changed_by_user_fieldname(),
                },

            'sent_count':
                {
                    predicate: fieldmap.get_total_works_written_by_agent_fieldname(),
                },

            'recd_count':
                {
                    predicate: fieldmap.get_total_works_recd_by_agent_fieldname(),
                },

            'mentioned_count':
                {
                    predicate: fieldmap.get_total_works_mentioning_agent_fieldname(),
                },

            'further_reading':
                {
                    predicate: fieldmap.get_person_further_reading_fieldname(),
                },
            'uuid':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_uuid_value_prefix()
                    # store: "uuid"
                }
        },

        additional: {  #
            type_fieldname: 'http://xmlns.com/foaf/0.1/Agent'  # Agents can be either people or organisations
        }
    },

    ###############
    #
    # manifestations
    #

    {
        title_singular: "manifestation",
        title_plural: "manifestations",

        translations: {

            'manifestation_id':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_normal_id_value_prefix(),
                    store: "id"
                },

            'manifestation_type':
                {
                    predicate: fieldmap.get_manifestation_type_fieldname(),
                    converter: convert_manifestation_type,
                },

            'number_of_pages_of_document':
                {
                    predicate: fieldmap.get_number_of_pages_of_document_fieldname(),
                },

            'id_number_or_shelfmark':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_shelfmark_value_prefix(),
                },

            'manifestation_creation_calendar':
                {
                    predicate: fieldmap.get_original_calendar_fieldname(),
                },

            'manifestation_creation_date_year':
                {
                    predicate: fieldmap.get_year_fieldname(),
                    transient: {
                        transient: "_created",
                        predicate: fieldmap.get_creation_date_fieldname()},
                },

            'manifestation_creation_date_month':
                {
                    predicate: fieldmap.get_month_fieldname(),
                    transient: {
                        transient: "_created",
                        predicate: fieldmap.get_creation_date_fieldname()},
                },

            'manifestation_creation_date_day':
                {
                    predicate: fieldmap.get_day_fieldname(),
                    transient: {
                        transient: "_created",
                        predicate: fieldmap.get_creation_date_fieldname()},
                },

            'manifestation_creation_date_inferred':
                {
                    predicate: fieldmap.get_uncertainty_flag_inferred(),
                    transient: {
                        transient: "_created",
                        predicate: fieldmap.get_creation_date_fieldname()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'manifestation_creation_date_uncertain':
                {
                    predicate: fieldmap.get_uncertainty_flag_uncertain(),
                    transient: {
                        transient: "_created",
                        predicate: fieldmap.get_creation_date_fieldname()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'manifestation_creation_date_approx':
                {
                    predicate: fieldmap.get_uncertainty_flag_approx(),
                    transient: {
                        transient: "_created",
                        predicate: fieldmap.get_creation_date_fieldname()
                    },
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },

            'language_of_manifestation':
                {
                    predicate: fieldmap.get_language_fieldname(),
                },

            'manifestation_ps':
                {
                    predicate: fieldmap.get_postscript_fieldname(),
                },

            'manifestation_incipit':
                {
                    predicate: fieldmap.get_incipit_fieldname(),
                },

            'manifestation_excipit':
                {
                    predicate: fieldmap.get_excipit_fieldname(),
                },

            'seal':
                {
                    predicate: fieldmap.get_seal_fieldname(),
                },

            'paper_type_or_watermark':
                {
                    predicate: fieldmap.get_paper_type_fieldname(),
                },

            'paper_size':
                {
                    predicate: fieldmap.get_paper_size_fieldname(),
                },

            'postage_marks':
                {
                    predicate: fieldmap.get_postage_mark_fieldname(),
                },

            'printed_edition_details':
                {
                    predicate: fieldmap.get_printed_edition_details_fieldname(),
                },

            'endorsements':
                {
                    predicate: fieldmap.get_endorsements_fieldname(),
                },

            'address':
                {
                    predicate: fieldmap.get_manifestation_address_fieldname(),
                },

            'number_of_pages_of_text':
                {
                    predicate: fieldmap.get_number_of_pages_of_text_fieldname(),
                },

            'non_letter_enclosures':
                {
                    predicate: fieldmap.get_non_letter_enclosures_fieldname(),
                },

            'manifestation_is_translation':
                {
                    predicate: fieldmap.get_is_translation_fieldname(),
                    converter: convert_to_rdf_boolean,
                },

            'creation_timestamp':
                {
                    predicate: fieldmap.get_date_created_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'change_timestamp':
                {
                    predicate: fieldmap.get_date_changed_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'manifestation_creation_date':
                {
                    predicate: None,
                    solr: 'creation_date_sort',
                    converter: convert_to_solr_date,
                },

            'manifestation_creation_date_gregorian':
                {
                    predicate: None,
                    solr: "creation_date_gregorian_sort",
                    converter: convert_to_solr_date,
                },

            'creation_user': None,  # ignore
            'published': None,  # ignore

            'change_user':
                {
                    predicate: fieldmap.get_changed_by_user_fieldname(),
                },
            'uuid':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_uuid_value_prefix()
                    # store: "uuid"
                },
            'opened':
                {
                    predicate: fieldmap.get_opened_fn(),
                    converter: convert_manifestation_opened,
                },
            'routing_mark_stamp':
                {
                    predicate: fieldmap.get_routing_mark_stamp_fn(),
                },
            'routing_mark_ms':
                {
                    predicate: fieldmap.get_routing_mark_ms_fn(),
                },
            'handling_instructions':
                {
                    predicate: fieldmap.get_handling_instructions_fn(),
                },
            'stored_folded':
                {
                    predicate: fieldmap.get_stored_folded_fn(),
                },
            'postage_costs_as_marked':
                {
                    predicate: fieldmap.get_postage_costs_as_marked_fn(),
                },
            'postage_costs':
                {
                    predicate: fieldmap.get_postage_costs_fn(),
                },
            'non_delivery_reason':
                {
                    predicate: fieldmap.get_non_delivery_reason_fn(),
                },
            'date_of_receipt_as_marked':
                {
                    predicate: fieldmap.get_date_of_receipt_as_marked_fn(),
                },
            'manifestation_receipt_calendar':
                {
                    predicate: fieldmap.get_manifestation_receipt_calendar_fn(),
                },
            'manifestation_receipt_date':
                {
                    predicate: fieldmap.get_manifestation_receipt_date_fn(),
                    converter: convert_to_rdf_date,
                },
            'manifestation_receipt_date_gregorian':
                {
                    predicate: fieldmap.get_manifestation_receipt_date_gregorian_fn(),
                    converter: convert_to_rdf_date,
                },
            'manifestation_receipt_date_year':
                {
                    predicate: fieldmap.get_fieldname_manifestation_receipt_date_year(),
                },
            'manifestation_receipt_date_month':
                {
                    predicate: fieldmap.get_fieldname_manifestation_receipt_date_month(),
                },
            'manifestation_receipt_date_day':
                {
                    predicate: fieldmap.get_fieldname_manifestation_receipt_date_day(),
                },
            'manifestation_receipt_date_inferred':
                {
                    predicate: fieldmap.get_manifestation_receipt_date_inferred_fn(),
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },
            'manifestation_receipt_date_uncertain':
                {
                    predicate: fieldmap.get_manifestation_receipt_date_uncertain_fn(),
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },
            'manifestation_receipt_date_approx':
                {
                    predicate: fieldmap.get_manifestation_receipt_date_approx_fn(),
                    converter: convert_to_rdf_boolean,
                    ignoreIfEqual: 'false',
                },
            'manifestation_receipt_date2_year':
                {
                    predicate: fieldmap.get_manifestation_receipt_date2_year_fn(),
                },
            'manifestation_receipt_date2_month':
                {
                    predicate: fieldmap.get_manifestation_receipt_date2_month_fn(),
                },
            'manifestation_receipt_date2_day':
                {
                    predicate: fieldmap.get_manifestation_receipt_date2_day_fn(),
                },
            'manifestation_receipt_date_is_range':
                {
                    predicate: fieldmap.get_manifestation_receipt_date_is_range_fn(),
                    converter: convert_to_rdf_boolean,
                },
            'accompaniments':
                {
                    predicate: fieldmap.get_accompaniments_fn(),
                }

        },

        additional: {
            type_fieldname: 'http://purl.org/vocab/frbr/core#Manifestation'
        }
    },

    ########
    #
    # Institutions
    #
    {
        title_singular: "institution",
        title_plural: "institutions",

        translations: {

            'institution_id':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_normal_id_value_prefix(),
                    store: "id"
                },

            'institution_city':
                {
                    predicate: fieldmap.get_repository_city_fieldname(),
                },

            'institution_city_synonyms':
                {
                    predicate: fieldmap.get_repository_alternate_city_fieldname(),
                },

            'institution_country':
                {
                    predicate: fieldmap.get_repository_country_fieldname(),
                },

            'institution_country_synonyms':
                {
                    predicate: fieldmap.get_repository_alternate_country_fieldname(),
                },

            'institution_name':
                {
                    predicate: fieldmap.get_repository_name_fieldname(),
                },

            'institution_synonyms':
                {
                    predicate: fieldmap.get_repository_alternate_name_fieldname(),
                },

            'creation_timestamp':
                {
                    predicate: fieldmap.get_date_created_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'change_timestamp':
                {
                    predicate: fieldmap.get_date_changed_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'creation_user': None,  # ignore
            'published': None,  # ignore

            'change_user':
                {
                    predicate: fieldmap.get_changed_by_user_fieldname(),
                },

            'document_count':
                {
                    predicate: fieldmap.get_total_docs_in_repos_fieldname(),
                },
            'uuid':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_uuid_value_prefix()
                    # store: "uuid"
                }
        },

        additional: {
            type_fieldname: 'http://purl.org/vocab/aiiso/schema#Institution'
        }
    },

    ########
    #
    # resources
    #
    {
        title_singular: "resource",
        title_plural: "resources",

        translations: {

            'resource_id':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_normal_id_value_prefix(),
                    store: "id"
                },

            'resource_details':
                {
                    predicate: fieldmap.get_resource_details_fieldname(),
                },

            'resource_name':
                {
                    predicate: fieldmap.get_resource_title_fieldname(),
                },

            'resource_url':
                {
                    predicate: fieldmap.get_resource_url_fieldname(),
                    converter: convert_to_local_url,
                },

            'creation_timestamp':
                {
                    predicate: fieldmap.get_date_created_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'change_timestamp':
                {
                    predicate: fieldmap.get_date_changed_fieldname(),
                    converter: convert_to_rdf_date,
                },

            'creation_user': None,  # ignore
            'published': None,  # ignore

            'change_user':
                {
                    predicate: fieldmap.get_changed_by_user_fieldname(),
                },
            'uuid':
                {
                    predicate: fieldmap.get_core_id_fieldname(),
                    prefix: fieldmap.get_uuid_value_prefix()
                    # store: "uuid"
                }
        },

        additional: {
            type_fieldname: 'http://www.w3.org/2000/01/rdf-schema#Resource'
        }
    },
]

# ----------------------------------------------------------------------------------------------

if __name__ == '__main__':

    import reversemap

    print('Listing conversion values:')
    print('')
    first_col_width = 15
    indent = ' '
    bigger_indent = indent.ljust(first_col_width + len(indent) + 1)
    fieldsep = '----------------------'

    for conv in conversions:
        title = ''
        if 'title_singular' in conv:
            title = conv['title_singular'].capitalize()
            print('')
            print('************************' + title + '************************')
        for key, val in conv.items():
            if key == 'translations':
                # --------------------------------
                # Main bit of mapping SQL -> Solr
                # --------------------------------
                print('')
                for sql_column_name, translated in val.items():
                    if type(translated) == dict:
                        print(title + ': SQL column name "' + sql_column_name + '" {')
                        for first_half, second_half in translated.items():
                            if str(first_half) == 'predicate':
                                print('')
                            print(indent + first_half.ljust(first_col_width) + ' ' + str(second_half))
                            if type(second_half) == str:
                                funclist = reversemap.get_functions_returning_value(second_half)
                                if len(funclist) > 0:
                                    print(bigger_indent + 'Returned from fieldmap by: ' + str(funclist))
                                    print('')
                            elif type(second_half) == dict:
                                if 'predicate' in second_half:
                                    funclist = reversemap.get_functions_returning_value(second_half['predicate'])
                                    if len(funclist) > 0:
                                        print(bigger_indent + 'Predicate returned from fieldmap by: ' + str(funclist))
                                        print('')
                        print('}')
                        print(fieldsep)
                        # ----------------------------------
                        # No mapping from SQL field to Solr
                        # ----------------------------------
                    else:
                        print(title + ': SQL column name "' + sql_column_name + '": ' + str(translated))
                        print('')
                        print(fieldsep)
                    print('')
# ----------------------------------------------------------------------------------------------
