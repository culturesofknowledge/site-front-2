# -*- coding: utf-8 -*-
import sys
import pprint

#import solr
import pysolr

# These two lines are hacks. They switch the default encoding to utf8 so that the command line will convert UTF8 + Ascii to UTF8
reload(sys)
sys.setdefaultencoding("utf8")

import solrconfig

web_lib_path = 'lib'
sys.path.append( web_lib_path )
import fieldmap as f
from helpers import escape_colons
from helpers import get_records_from_solr, uuid_from_uri

def main() :

	start = 0
	batch = 200

	solr = pysolr.Solr(solrconfig.solr_urls['people'])

	fields = ",".join([
		'uuid',
		'frbr_creatorOf-work',
		'mail_recipientOf-work',
		'dcterms_identifier-editi_'
	])

	people = solr.search( "*:*", **{
	#people = solr.search( "uuid:06dc4197-2486-424b-831b-d5f45f077f23", **{
		'fields' : fields,
		'start' : start,
		'rows' : batch,
		'score' : False
	})


	# count_down = total = people.numFound
	count_down = total = people.hits
	while start < total :

		people_updates = []
		for result in people.docs:  # people.results:

			updated = {}

			if 'frbr_creatorOf-work' in result:
				works_created = get_records_from_solr( result['frbr_creatorOf-work'] , [
					'mail_recipient-person',  # person sent to
					'mail_origin-location',  # place wrote in
				] )

				if works_created:

					works_created_locations = set()
					works_to_people = set()

					for work in works_created.itervalues() :
						if 'mail_origin-location' in work:
							for location in work['mail_origin-location'] :
								works_created_locations.add( uuid_from_uri( location ) )

						if 'mail_recipient-person' in work:
							for person in work['mail_recipient-person'] :
								works_to_people.add( uuid_from_uri( person ) )

					if len( works_created_locations ):
						updated[u'works_created_locations'] = works_created_locations

					if len( works_created_locations ):
						updated[u'works_to_people'] = works_to_people

			if 'mail_recipientOf-work' in result:
				works_recipient = get_records_from_solr( result['mail_recipientOf-work'] , [
					'frbr_creator-person',  # person received from
					'mail_destination-location'  # place received from
				] )

				if works_recipient:
					# print works_recipient

					works_received_locations = set()
					works_from_people = set()

					for work in works_recipient.itervalues() :

						if 'mail_destination-location' in work :
							for location in work['mail_destination-location']:
								works_received_locations.add( uuid_from_uri( location ) )

						if 'frbr_creator-person' in work:
							for person in work['frbr_creator-person']:
								works_from_people.add( uuid_from_uri( person ) )

					if len( works_received_locations ) :
						updated[u'works_received_locations'] = works_received_locations

					if len( works_from_people ) :
						updated[u'works_from_people'] = works_from_people

			if updated:
				updated[u"dcterms_identifier-uuid_"] = u"uuid_" + result['uuid']

				# print updated
				#for key, value in result.iteritems():
				#	if key not in ['id', 'name-strict', 'foaf_name-firstletter', '_version_' ] : # These keys are solr copy-fields and shouldn't be indexed directly.
				#		updated[key] = value

				# add dummy so it works:
				#updated[u'uuid_related'] = ['6a9b17f5-e7ce-4da2-ab67-9a58cdaecfcf']
				# print updated
				#
				people_updates.append( updated )

			count_down -= 1

		#solr_people.add_many( people_updates, False )
		for person_updates in people_updates :

			try:
				solr.add([person_updates], fieldUpdates={
					u'works_created_locations': 'set',
					u'works_to_people': 'set',
					u'works_received_locations': 'set',
					u'works_from_people': 'set'
				})
			except pysolr.SolrError as se:
				# catch bug in solr, raise if something else
				if "TransactionLog" not in se.message or "java.util.UUID" not in se.message :
					raise

		print "...at " + str(start)
		start += batch
		people = solr.search( "*:*", **{
			'fields' : fields,
			'start' : start,
			'rows' : batch,
			'score' : False
		})

	solr.commit()
	# solr_people.close()

	print "done " + str(start) + "(from " + str(total) + ")"

main()
