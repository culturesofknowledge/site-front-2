__author__ = 'sers0034'
from dotenv import load_dotenv
load_dotenv()

import sys
import time
import subprocess
import codecs
import os

import redis

import redisconfig
import csvtordf

import AdditionalSolr

# For remote debug inside Dockers
#import pydevd
#pydevd.settrace('129.67.193.177', port=55157, stdoutToServer=True, stderrToServer=True)

import indexer
import sourceconfig_base
# import imp

indexer_check_file = os.path.join(sourceconfig_base.base, "need_index")

def GetSelection():
	print("CSV conversion to RDF and Solr")
	print("------------------------------")
	print("")
	print("This process needs Solr and Redis to be running. Some Solr data will be deleted then replaced.")
	print("It will not create any RDF data in the entitystore only replace the Solr data.")
	print("If you've updated a Solr schema remember to restart Solr before starting this process.")
	print("")
	print("Which do you want to re-index?")
	print("    1. comments")
	print("    2. images")
	print("    3. institutions")
	print("    4. locations  ")
	print("    5. manifestations")
	print("    6. people ")
	print("    7. resources ")
	print("    8. works")
	#print "    9. (skip id creation)"
	print("    x. exit")
	print("")

	response = input( "Enter your combination here (e.g. 247) : ")
	if response == 'x' or response == 'X' :
		return [], False, "Exiting"

	try:
		int( response )
	except:
		return [], False, "No numbers selected, exiting."

	indexing = []
	if "1" in response:
		indexing.append("comments")
	if "2" in response:
		indexing.append("images")
	if "3" in response:
		indexing.append("institutions")
	if "4" in response:
		indexing.append("locations")
	if "5" in response:
		indexing.append("manifestations")
	if "6" in response:
		indexing.append("people")
	if "7" in response:
		indexing.append("resources")
	if "8" in response:
		indexing.append("works")

	if len( indexing ) <= 0:
		return [], False, "Incorrect numbers selected, exiting."

	skip_id_gen = False
	#if '9' in response:
	#	skip_id_gen = True

	return indexing, skip_id_gen, ""


def RunIndexing( indexing=None, skip_id_generation=False, skip_store_relations=False, skip_clean=False, skip_delete_previous_solr=False ) :

	if indexing is None :
		indexing, __skip_id_generation, message = GetSelection()

	if not len( indexing ) :
		sys.exit( message )

	# Start
	timeBegin = time.time()


	if not skip_clean :
		#
		# Clean CSVs of control characters
		#
		# A vertical tabulation character has found it's way into EMLO - this breaks pythons CSV reading ability (newlines where there shouldn't be newlines)
		# so I'm stripping them out.

		print("- Cleaning CSVs of rogue characters")
		timeStart = time.time()

		for csv_file_name in csvtordf.csv_files:

			csv_file_location = os.path.join(sourceconfig_base.base, csvtordf.csv_files[csv_file_name][0])
			new_csv_file_location = csv_file_location + ".new"

			if os.path.isfile(csv_file_location) :

				print("   -", csv_file_location)

				stat_info = os.stat(csv_file_location)
				with codecs.open( new_csv_file_location, encoding="utf-8", mode="w") as csv_file:

					with codecs.open( csv_file_location, encoding="utf-8", mode="r") as csv_file_original :

						for line in csv_file_original:

							line = line.replace( '\u000B', '' )  # U+000B : <control-000B> (LINE TABULATION) {VERTICAL TABULATION [VT]}
							csv_file.write(line)

				os.rename( csv_file_location, csv_file_location + '.bak' ) # original file to backup
				os.rename( csv_file_location + '.new', csv_file_location ) # new file to original
				os.chown( csv_file_location, stat_info.st_uid, stat_info.st_gid )

		timeEnd = time.time()
		print("  - Done (in %0.1f seconds)." % ( (timeEnd-timeStart)))


	#
	# Create ID's
	#
	if not skip_id_generation:

		print("- Storing all IDs:")
		timeStart = time.time()

		errored = subprocess.call( ["python index_generate_ids.py"], shell=True )

		if errored:
			sys.exit( "Sorry couldnt generate ids - there may be errors with the csv files which will need to be fixed. (It could be unicode problems, try removing the invalid lines)")
		else :
			timeEnd = time.time()
			print("  - Done (in %0.1f seconds)." % ( (timeEnd-timeStart)))

	#
	# Store relationships
	#
	if not skip_store_relations:

		timeStart = time.time()
		print("- Storing relationships in temp Redis database:")

		errored = subprocess.call( ["python index_store_relations.py"], shell=True )

		if errored:
			sys.exit( "Sorry, relations problem. There maybe errors with the csv files which will need to be fixed. (It could be unicode problems, try removing the invalid lines)")
		else:
			timeEnd = time.time()
			print("  - Done (in %0.1f seconds)." % (timeEnd-timeStart))


	#
	# Clear old data (if exists)
	#
	indexer.ClearSolrData( indexing )


	#
	# open redis relations database
	#
	red_relations = redis.Redis(host=redisconfig.host, db=redisconfig.db_temp_cofk_create)

	#
	# Save the RDF and output to Solr
	#
	indexer.FillSolr( indexing, red_relations )


	#
	# Update Works if needed
	#
	if 'works' in indexing :

		timeStart = time.time()

		AdditionalSolr.AdditionalWorksData()

		timeEnd = time.time()
		print("  - Done (in %0.1f seconds)." % (timeEnd-timeStart))
	#
	# Switch from the staging cores to real ones.
	#
	indexer.SolrOptimize( indexing )
	indexer.SwitchSolrCores( indexing )

	if not skip_delete_previous_solr:
		#
		# We don't need to keep the old data so clear it out.
		#
		indexer.ClearSolrData( indexing )

	#
	# Done!
	#
	timeFinished = time.time()
	print("Conversion completed in %0.1f seconds (%0.1f minutes)." % ( (timeFinished-timeBegin), (timeFinished-timeBegin)/60 ))


def check_file_mark_processing() :
	checker = open(indexer_check_file, "w")
	checker.write("2")
	checker.close()

def check_file_clear() :
	checker = open(indexer_check_file, "w")
	checker.write("0")
	checker.close()

def check_file_need_index() :

	need_index = False

	try :
		checker = open(indexer_check_file, "r")

		if checker :

			number = checker.readline()[0]

			if number == "1" :

				need_index = True

			checker.close()

	except IOError:
		pass

	return need_index


if __name__ == '__main__':

	if not check_file_need_index() :
		print ("No indexing is necessary")

	else:

		check_file_mark_processing()

		# These two lines are hacks. They switch the default encoding to utf8 so that the command line will convert UTF8 + Ascii to UTF8
		# imp.reload(sys)
		# sys.setdefaultencoding("utf8")
		sys.path.append( 'lib' )

		# debug = True
		debug = False

		if debug :
			print("Using test csv data...")
			print()
			csvtordf.csv_files = csvtordf.test_csv_files

		index_all = [
			"comments",
			"images",
			"institutions",
			"locations",
			"manifestations",
			"people",
			"resources",
			"works"
		]

		if len( sys.argv ) == 0 :
			RunIndexing( index_all, False, False, False )

		else :

			index = index_all
			if "ask" in sys.argv :
				index = None
			elif "locations" in sys.argv or "comments" in sys.argv or "people" in sys.argv  or "manifestations" in sys.argv  or  "images" in sys.argv  or "institutions" in sys.argv  or "resources" in sys.argv  or "works" in sys.argv :
				index = []
				if "locations" in sys.argv :
					index.append("locations")
				if "comments" in sys.argv :
					index.append("comments")
				if "people" in sys.argv :
					index.append("people")
				if "manifestations" in sys.argv :
					index.append("manifestations")
				if "images" in sys.argv :
					index.append("images")
				if "institutions" in sys.argv :
					index.append("institutions")
				if "resources" in sys.argv :
					index.append("resources")
				if "works" in sys.argv :
					index.append("works")


			RunIndexing( index, "skipid" in sys.argv, "skiprel" in sys.argv, "skipclean" in sys.argv, "skipsolrdelete" in sys.argv )

		check_file_clear()

