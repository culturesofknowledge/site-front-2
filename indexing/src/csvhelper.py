# -*- coding: utf-8 -*-
import sys
import os
import time
import codecs
import csv

def get_csv_data( csvfilelocation, csvfile, headings=None, skip_first=False ):
    """ Get the data from a csv file and place it into a list of dictionaries.One dictionary per line
        as header:value. 
        
        e.g: [ {'header1':'val1', 'header2':'val2'}, {'header1':'val3', 'header2:'val4'} ]
        
        if headings==None : headings are taken from the first line of the csv file
        if headings!=None and skip_first==True : the first row is skipped.
    """

    csvreader = csv.reader( csvfile, dialect='excel' )
    
    if headings is None:
        headings = csvreader.next()
    elif skip_first :
        csvreader.next()
    
    csvdata = []
    
    try:
        for record in csvreader:
            
            have_data = False
            for data in record:
                if data.strip() != '' :
                    have_data = True
                    break
                    
            if have_data:
                #dict_record = {}
                #for num, data in enumerate( record ):
                #    dict_record[headings[num].encode("utf8")] = data.encode("utf8")
                #csvdata.append( dict_record )
                csvdata.append( dict( zip( headings, record ) ) )
            #else:
            #    print "Blank record"
    
    except UnicodeError, exception:
        print('Error converting to unicode %s, line %d: %s' % (csvfilelocation, csvreader.line_num, exception))
    except csv.Error, exception:
        sys.exit('Error reading file %s, line %d: %s' % (csvfilelocation, csvreader.line_num, exception))

    return csvdata

def get_csv_data_via_location( csvfilelocation, headings=None, skip_first=False):

    try:
        filesize = os.path.getsize(csvfilelocation)
    except OSError:
        csv_data = None
    else:
        if filesize == 0 :
            csv_data = []
        else :
            csv_file = codecs.open( csvfilelocation, encoding="utf-8", mode="rb")
            csv_data = get_csv_data( csvfilelocation, csv_file, headings, skip_first )
            csv_file.close()

    return csv_data


def get_csv_headings( csvfile ):
    """ Get the headings from the first line of the CSV file """
    csvreader = csv.reader( csvfile )
    headings =  csvreader.next()
    
    utf8_headings = []
    for heading in headings:
        utf8_headings.append( heading.encode("utf8") )
        
    return utf8_headings

def get_csv_headings_via_location( csvfilelocation ):

    try:
        filesize = os.path.getsize(csvfilelocation)
    except OSError:
        csv_fieldnames = None
    else:
        if filesize == 0:
            csv_fieldnames = []
        else:
            csv_file =  codecs.open( csvfilelocation, encoding="utf-8", mode="rb")
            csv_fieldnames = get_csv_headings( csv_file )
            csv_file.close()
    
    return csv_fieldnames

def get_csv_field_data( csvfilelocation, field ):
    csv_file =  codecs.open( csvfilelocation, encoding="utf-8", mode="rb")
    csv_data = get_csv_data_via_location( csvfilelocation )
    csv_file.close()
    
    field_data = None
    
    if csv_file is not None:
        field_data = []
        line = 0
        for record in csv_data:
            line += 1
            if record.has_key(field) :
               data = record[field].strip()
               if data != '' :
                  field_data.append(data)
            else :
               print "Error: Can't read " + field + " on line " + line + " of " + csvfilelocation

    del csv_data
    
    return field_data


def convert_csv_to_solr( csv_file_location, solrconversion ):
    """ Get data from the CSV file and convert that data to one solr can read """
    
    csv_fieldnames = get_csv_headings_via_location( csv_file_location )
    
    
    # Update the csv_fieldnames to the solr ones, checking the array as we go.
    csv_and_solr_fieldnames = csv_fieldnames[:]
    solr_fieldnames= []
    for position,heading in enumerate( csv_fieldnames ):
        if solrconversion.has_key( heading ) :
            solr_fieldname = solrconversion.get( heading ).get( 'solr', None )
            
            if solr_fieldname == None or solr_fieldname == '' :
                solr_fieldname = heading
            
            csv_and_solr_fieldnames[position] =  solr_fieldname
            solr_fieldnames.append(solr_fieldname)
    
    
    # Get the data as a list of dicts with 
    all_csv_data = get_csv_data_via_location( csv_file_location, headings=csv_and_solr_fieldnames, skip_first=True )
    
    
    # Remove unwanted fields as per the csvtosolr file and fields with blank values
    data = []
    for row in all_csv_data:
        new_row = dict()
        for field,value in row.iteritems():
            if value.strip() and field in solr_fieldnames :
                new_row[field] = unicode( value, "utf-8" )
                
        data.append(new_row)
    
        
    # Construct an index with Solr name as key, as csv_fieldnames changed above - quicker this way
    people_solr = {}
    for heading in csv_fieldnames:
        if solrconversion.has_key( heading ) :
            heading_info = solrconversion.get(heading,None)
            solr_field = heading_info.get( 'solr', None )
            
            if solr_field == None or solr_field == "" :
                solr_field = heading
                
            people_solr.update( { solr_field : heading_info } )
        
    
    # Check values are in a correct format, try to fix if not.
    for number,row in enumerate( data ):
        for field,value in row.iteritems():
            
            #See whether this value can be empty_ok
            empty_ok = people_solr.get(field).get('empty', None)
            if value == "" and empty_ok == 'no' :
                sys.exit( "Error: Field '" + field + "' is empty, row:" + str( number ) ) 
             
            # Check the format of the value   
            if value != '' :
                check = people_solr.get(field).get('check', None)
                
                if check != None:
                    value = value.lower()
                    new_value = None
                    
                    if check == 'date' :
                        date_check = value
                        # solr uses format '1651-12-31T00:00:00Z' or '1651-12-31T00:00:00.999Z'
                        # Recognisers dates in the format:
                        # * 'YYYY-MM-DD'
                        # * 'YYYY-MM-DD HH:MM:SS'
                        # * 'YYYY-MM-DD HH:MM:SS.M' to 'YYYY-MM-DD HH:MM:SS.MMMMMMM'
                        d = None
                        date_length = len( date_check )
                        
                        if date_length == 10 :
                            d = time.strptime( date_check, '%Y-%m-%d')
                        elif date_length == 19 :
                            d = time.strptime( date_check, '%Y-%m-%d %H:%M:%S')
                        elif 20 <= date_length <= 26 : 
                            d = time.strptime( date_check[:23], '%Y-%m-%d %H:%M:%S.%f')
                        
                        if d == None :
                            sys.exit( "Error: Field '" + field + "', value '" + date_check + "' is not a recognised date, row:" + str( number ) ) 
                    
                        # Annoyingly time.strftime does not cope with years less than 1900, so I'm forced to use this:
                        new_value = "%(year)d-%(month)02d-%(day)02dT%(hour)02d:%(minute)02d:%(second)02dZ" % \
                            { 'year':d.tm_year, 'month':d.tm_mon, 'day':d.tm_mday, 'hour':d.tm_hour, 'minute':d.tm_min, 'second':d.tm_sec } 
                         
                    elif check == 'number' : 
                        num_check = int( value )
                        try:
                            float( num_check ) # Complex numbers are not acceptable values
                        except ValueError:
                            sys.exit( "Error: Field '" + field + "' is not a number, row:" + str( number ) ) 
                    
                    elif check == 'boolean' :
                        boolean_check = value
                        if (boolean_check != '1'    and boolean_check != '0' and \
                            boolean_check != 'true' and boolean_check != 'false' and \
                            boolean_check != 'y'    and boolean_check != 'n' ):
                            sys.exit( "Error: Field '" + field + "' is not a boolean, row:" + str( number ) ) 
                        elif boolean_check == '1' or boolean_check == 'y':
                            new_value = 'true'
                        else : # value == '0' or value == 'n'
                            new_value = 'false'
                    
                    if new_value != None:
                        data[number][field] = new_value
                        

    return data


