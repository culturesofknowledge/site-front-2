'''
Deletes everything from Solr (lifted out of Mat's index.py which deletes and then reloads).
I thought we might need to run this if we CHANGE a field name, i.e. delete everything 
before trying to reload. But actually I think it's unnecessary. However will add it into
Subversion just in case it turns out to be useful after all.

@author: dev
'''

# pythons
import sys

# libraries
import solr

# created
import solrconfig

#----------------------------------------------------------------------------------

def plural_to_singular( plural ):
    if plural == 'people' :
        return "person"
   
    return plural[:-1]

#----------------------------------------------------------------------------------

def ClearSolrData( ):
    #
    # Clear settings
    #
    print " - Removing existing data from Solr:"

    indexing = []
    indexing.append("comments")
    indexing.append("images")
    indexing.append("institutions")
    indexing.append("locations")
    indexing.append("manifestations")
    indexing.append("people")
    indexing.append("resources")
    indexing.append("works")
    
    for index in indexing:
        sol = solr.SolrConnection( solrconfig.solr_urls[index] )
        sol.delete_query( "*:*" )
        sol.commit()
        sol.close()
        
        print "   - " + index + " emptied." 
    
    sol = solr.SolrConnection( solrconfig.solr_urls['all'] )
    for index in indexing:
        sol.delete_query( "object_type:" + plural_to_singular( index ) )
        
    sol.commit()
    sol.close()
    
    print '   - "all" cleared of selected objects'
    
#----------------------------------------------------------------------------------
    
if __name__ == '__main__':
    
    ClearSolrData( )
    
#----------------------------------------------------------------------------------
