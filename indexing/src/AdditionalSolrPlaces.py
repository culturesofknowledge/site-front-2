# -*- coding: utf-8 -*-
import sys
import json

import pysolr
# These two lines are hacks. They switch the default encoding to utf8 so that the command line will convert UTF8 + Ascii to UTF8
reload(sys)
sys.setdefaultencoding("utf8")

import solrconfig

web_lib_path = 'lib'
sys.path.append( web_lib_path )

levels = [
	"level_empire",
	"level_country",
	"level_county",
	"level_city",
	"level_parish",
	"level_building",
	"level_room"
]

debug = False #True #

def main() :

	start = 0
	batch = 200

	fields = ",".join(levels) + ",uuid,geonames_name",

	solr = pysolr.Solr(solrconfig.solr_urls['locations'])
	places = solr.search("*:*", **{
	#places = solr.search("uuid:(d90260ee-660d-4f7f-9cda-aefa9db81943 283a71a7-cf68-4832-a381-9bf5388e1860 30ef492a-1264-4905-9695-9bcdeebbf258)", **{
		'fl' : fields,
		'start': start,
		'rows' : batch,
		'score': False,
	})

	count_down = total = places.hits
	while start < total :

		places_updates = []
		for result in places.docs:

			updated = {}

			add_parents( solr, result, updated)
			add_direct_children( solr, result, updated )

			if updated:
				updated["dcterms_identifier-uuid_"] = "uuid_" + result['uuid']

				if debug:
					print updated

				# Empty.
				#updated = {
				#	"parents" : ["0"],
				#	"parents_json" : "[]",
				#	"dcterms_identifier-uuid_" : "uuid_" + result['uuid']
				#}

				places_updates.append( updated )

			count_down -= 1

		# Because of a bug in Solr the add incorrectly causes a SolrError because of fields with multiple uuids in a list
		# So we have to call this one at a time...
		for place_updates in places_updates :

			try:
				solr.add([place_updates], fieldUpdates={
					'parents': 'set',
					'parents_json': 'set',
					'children': 'set',
					'children_json': 'set'
				})
			except pysolr.SolrError as se:
				# catch bug in solr, raise if something else
				if "TransactionLog" not in se.message or "java.util.UUID" not in se.message :
					raise

		print "To go: " + str(count_down)

		start += batch
		places = solr.search("*:*", **{
			'fl' : fields,
			'start': start,
			'rows' : batch,
			'score': False,
		})

	solr.commit()

	print "done " + str(start) + "(from " + str(total) + ")"


# From Belgium, Flanders, Ghent
# Produce ['Belgium', 'Flanders, Belgium'] and find both
def add_parents( solr, result, updated):

	place_levels = []
	for level in levels :
		if level in result:
			# Some "levels" are actually more than one level *e.g. "Petty France, Westminster"
			# so let's try to split them up
			splits = result[level].split(",")
			splits.reverse()
			for split in splits:
				place_levels.append(split.strip())

	parents = []
	parent_count = len(place_levels)

	if debug:
		print place_levels
		print result

	for level in range(1, parent_count ) :

		place_levels_parent = place_levels[:level]

		place_levels_parent.reverse()
		parents.append( ", ".join(place_levels_parent) )

	if parents :
		q = 'browse: ("' + '" "'.join(parents) + '")'

		if debug:
			print q

		parents = solr.search( q, **{
			'fl' : "uuid,geonames_name",
			'start': 0,
			'rows' : parent_count,
			'score': False,
		})


		if parents.hits > 0:

			if debug:
				print parents.docs

			updated['parents'] = []
			for parent_doc in parents.docs :
				updated['parents'].append( parent_doc['uuid'] )

			updated['parents_json'] = json.dumps(parents.docs)

def add_direct_children( solr, doc, updated ) :

	last_level = None
	q = []
	for level in levels :
		if level in doc:
			last_level = level
			q.append(level + ':"' + doc[level] + '"')

	if q:
		last_level_pos = levels.index(last_level)
		if last_level_pos <= 5 :
			next_level = levels[last_level_pos+1]
			q.append( next_level + ":[* TO *]" )

		if last_level_pos <= 4 :
			next_level = levels[last_level_pos+2]
			q.append( "-" + next_level + ":[* TO *]" )

		q = " AND ".join(q)

		if debug:
			print q

		children = solr.search( q, **{
			'fl' : "uuid,geonames_name",
			'start': 0,
			'rows' : 100,
			'score': False,
		})

		# print children.docs

		updated['children'] = []
		for child_doc in children.docs :
			updated['children'].append( child_doc['uuid'] )

		updated['children_json'] = json.dumps(children.docs)

		#updated["children"] = []
		#updated["children_json"] = ''

main()
