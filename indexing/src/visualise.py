'''
Created on 12 Jul 2011

@author: dev
'''

import solr
import solrconfig

def get_records_from_solr( uids, fields=None ): # by id.

   results = {}
   
   uids_unique = {}.fromkeys(uids).keys() # Fast implementation to get unique list items
   total = len( uids_unique )
        
   if total > 0 :
      sol = solr.SolrConnection( solrconfig.solr_urls["all"] )
      
      limit = 100
      count = 0
   
      while total > count:
         ids= uids_unique[count:count+limit]
         
         res = sol.query( "dcterms\:identifier-uri\::(" + " ".join(ids).replace(":","\:") + ")", score=False, rows=len(ids), start=0, fields=fields)
         
         results.update( [result['dcterms:identifier-uri:'],result] for result in res.results )
         count += limit
      
      sol.close()

   return results

sol = solr.SolrConnection( solrconfig.solr_urls['all'] )
sol_response = sol.query( "object_type:work", fields=['frbr:creator-person','mail:recipient-person'], score=False, rows=1, start=0)  

total = sol_response.numFound
print "Works " + str(total)

#total = 200

step = 2000
count = 0
people_links = {}

while count < total:
    sol_response = sol.query( "object_type:work", fields=['frbr:creator-person','mail:recipient-person'], score=False, rows=step, start=count)
    
    
    for res in sol_response.results:
        if 'frbr:creator-person' in res and 'mail:recipient-person' in res:
            creator = res['frbr:creator-person'][0]
            recipient = res['mail:recipient-person'][0]
            
            if creator in people_links:
                if recipient in people_links[creator]:
                    people_links[creator][recipient] = people_links[creator][recipient] + 1
                else:
                    people_links[creator][recipient] = 1
            else:
                people_links[creator] = { recipient : 1 }
        else:
            #print "Error: no link"
            pass     

    count += step
    print count

count = 1
people_set = set()
for creator, recipients in people_links.iteritems():
    
    if creator not in people_set:
        people_set.add( "uri:" + creator )
    
    for recipient in recipients:
        if recipient not in people_set:
            people_set.add( "uri:" + recipient )
    
    if count % 100 == 0:
        print creator, recipients
        
    count += 1

print "People: " + str(len( people_set ))
    
records = get_records_from_solr( people_set, ['dcterms:identifier-uri:','foaf:name'] )
print "Records: " + str(len( records ))

ids = 1
for uri, data in records.iteritems():
    data['id'] = str(ids)
    ids += 1
    
count = 1
for id, data in records.iteritems():
    print id, data
    
    if count == 100:
        break
    
    count += 1


import codecs

f = codecs.open( 'cofk.nwb','w', encoding='utf8' )

f.write( "*Nodes\n" )
f.write( "id*int\tlabel*string\n" )
count = 1
for uri, data in records.iteritems():
    if "foaf:name" not in data:
        name = "Unknown"
    else:
        name = data['foaf:name'].replace("\n"," ")
        
    f.write( '%s\t"%s"\n' % ( data['id'], name  ) )
    
f.write( "*DirectedEdges\n" )
f.write( "source*int\ttarget*int\tweight*int\n" )

for uri_from,uri_tos in people_links.iteritems():
    person_from = records['uri:'+uri_from]
    
    for uri_to, num in uri_tos.iteritems():
        if uri_from != uri_to:
            person_to = records['uri:'+uri_to]
        
            f.write( "%s\t%s\t%d\n" % (person_from['id'], person_to['id'], num) )
        
f.close()
print "File output"
