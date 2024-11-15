"""Extra field-map utilities

Allows you to pass in a hard-coded string and get back a list of the functions that return it.
Or lists all functions from fieldmap ordered by the string returned.
"""

import sys
import inspect

fieldmap_path = '/home/dev/subversion/trunk/pylons/web/web/lib'
sys.path.append( fieldmap_path )
import fieldmap

#-----------------------------------------------------------------------------------------------------
# Returns a list of functions from 'fieldmap' sorted by the STRING RETURNED, e.g.
#--------------------------------------------------------------------------------
#             bibo:annotates-person  |  get_person_commented_on_fieldname
#               bibo:annotates-work  |  get_work_commented_on_fieldname
#                         bibo:Note  |  get_comments_fieldname
#                     bibo:numPages  |  get_number_of_pages_of_document_fieldname
#                         bio:Birth  |  get_birth_fieldname
#                  bio:Birth-indef:  |  get_birth_date_flags_fieldname_root
#                  bio:Birth-ox:day  |  get_birth_day_fieldname
#                bio:Birth-ox:month  |  get_birth_month_fieldname
#                 bio:Birth-ox:year  |  get_birth_year_fieldname
#--------------------------------------------------------------------------------

def list_functions_by_return_value():

  module_items = dir(fieldmap)
  unsorted = []

  for item_name in module_items:
    obj = getattr( fieldmap, item_name )
    if inspect.isfunction( obj ):
      retval = obj()
      if type( retval ) == str:
        unsorted.append(( retval, item_name ))
      #endif
    #endif
  #endfor

  sorted_by_retval = sorted( unsorted, key = lambda ret_and_func : ret_and_func[ 0 ].lower() )
  return sorted_by_retval

#----------------------------------------------------------------------------------------------
# Returns a LIST, e.g. if you pass in 'dcterms:description' you should get something like:
# ['get_main_displayable_fieldname',get_resource_details_fieldname','get_work_description_fieldname']

def get_functions_returning_value( the_value ):

  all_funcs = list_functions_by_return_value()
  relevant_funcs = []

  for retval, func in all_funcs:
    if retval == the_value:
      relevant_funcs.append( func )
    #endif
  #endfor

  return relevant_funcs

#----------------------------------------------------------------------------------------------

if __name__ == '__main__':

  # List all functions from fieldmap IN ORDER OF RETURN VALUE
  print 'Functions from fieldmap ordered by return value:'
  funcs = list_functions_by_return_value()
  for retval, func in funcs:
    if type( retval ) == str:
      print retval.rjust( 35 ) + '  |  ' + func
    #endif
  #endfor
#endif

#----------------------------------------------------------------------------------------------
