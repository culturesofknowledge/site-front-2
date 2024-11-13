__author__ = 'sers0034'

import sys

fieldmap_path = 'lib'
sys.path.append( fieldmap_path )

import indexer

if __name__ == '__main__':

	# These two lines are hacks. They switch the default encoding to utf8 so that the command line will convert UTF8 + Ascii to UTF8
	reload(sys)
	sys.setdefaultencoding("utf8")

	sys.path.append( fieldmap_path )

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

	indexer.SwitchSolrCores( index_all )
