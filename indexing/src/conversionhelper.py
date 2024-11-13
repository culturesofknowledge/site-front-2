# -*- coding: utf-8 -*-
'''
Created on 24 Aug 2010

@author: Matthew Wilcoxson

functions convert from one value to another in the form:
def conversion(value):
    #do something
    return new_value
'''


import time

def convert_to_rdf_date(value):
    
    date_check = value
    # rdf uses format '1651-12-31T00:00:00Z' or '1651-12-31T00:00:00.999Z'
    # Recognisers dates in the format:
    # * 'YYYY-M-D' to 'YYYY-MM-DD'
    # * 'YYYY-MM-DD HH:MM:SS'
    # * 'YYYY-MM-DD HH:MM:SS.M' to 'YYYY-MM-DD HH:MM:SS.MMMMMMM'
    d = None
    date_length = len( date_check )
    
    if 8 <= date_length <= 10 :
        d = time.strptime( date_check, '%Y-%m-%d')
    elif date_length == 19 :
        d = time.strptime( date_check, '%Y-%m-%d %H:%M:%S')
    elif 20 <= date_length <= 26 : 
        d = time.strptime( date_check[:23], '%Y-%m-%d %H:%M:%S.%f')
    
    if d == None :
        raise SyntaxError( "Value '" + value +"' can not be converted to a date")
    

    # Annoyingly time.strftime does not cope with years less than 1900, so I'm forced to use this:
    new_value = "%(year)d-%(month)02d-%(day)02dT%(hour)02d:%(minute)02d:%(second)02dZ" % \
        { 'year':d.tm_year, 'month':d.tm_mon, 'day':d.tm_mday, 'hour':d.tm_hour, 'minute':d.tm_min, 'second':d.tm_sec }
        
    return new_value 

def convert_to_solr_date(value):
    # Just use rdf one!
    return convert_to_rdf_date(value)


def convert_to_rdf_boolean( value ):
    value = value.lower()
    
    if value == '1' or value == 'y' or value == 'true' :
        new_value = 'true'
    elif value == '0' or value == 'n' or value == 'false' :
        new_value = 'false'
    else:
        raise SyntaxError( "Value '" + value + "' can not be converted to a boolean")
    
    return new_value

def convert_to_solr_boolean(value):
    # Just use rdf one!
    return convert_to_rdf_boolean(value)


def convert_people_gender( value ):
    valuelow = value.lower()
    if valuelow == 'male' or valuelow == 'm' or valuelow == 'man' or valuelow == 'men':
        new_value = "male"
    elif valuelow == 'female' or valuelow == 'f' or valuelow == 'woman' or valuelow == 'women':
        new_value = "female"
    else:
        raise SyntaxError( "Value '" + value + "' can not be converted to a gender" )
    
    return new_value

def convert_to_local_url( value ) :
   value = value.replace( 'http://sers018.sers.ox.ac.uk/history/cofk/union.php?iwork_id=', '/profile?iwork_id=' )
   value = value.replace( 'http://sers018.sers.ox.ac.uk/history/cofk/selden_end.php?iwork_id=', '/profile?iwork_id=' )
   
   return value

def convert_photo_url( value ) :
   value = value.replace( 'cofk2.bodleian.ox.ac.uk', 'emlo-edit.bodleian.ox.ac.uk' )

   return value
  
def convert_manifestation_type( value ):
   if value == 'Scribal copy' :
      return "Manuscript copy"
   
   return value


def convert_manifestation_opened( value ):
    if value == 'o' :
        return "Opened"
    elif value == 'p' :
        return "Partially Opened"
    elif value == 'u' :
        return "Unopened"

    return "Unknown:"+value
