#! /bin/bash
#----------------------------------------------------------------------------------------
# This script is designed to be run as a cron job by dev.
#----------------------------------------------------------------------------------------
# It assumes that the latest version of the CSV files will already have been generated
# on cofk2 (editing interface/back end) and will have been copied across to the front end
# via scp as a cron job run on the back end by cofkadmin.
#----------------------------------------------------------------------------------------

export INDSRC=/home/dev/workspace/indexing/src/
indexscript=${INDSRC}index.py

#-------------------------------------------------------------

export CSV_ARRIVAL_POINT=/home/cofkxfer/
export CSV_DESTINATION=/home/dev/source/union/

echo 'Data files transferred across from the editing interface:'
ls -l $CSV_ARRIVAL_POINT
echo ''
echo ''

for c in $( ls ${CSV_ARRIVAL_POINT}cofk_union*.csv )
do
  echo "Copying $c to $CSV_DESTINATION"
  \cp $c $CSV_DESTINATION
done

echo ''
echo 'Files copied:'
ls -l $CSV_DESTINATION
echo ''
echo ''

#-------------------------------------------------------------

echo 'No need to install manually-uploaded images, as we can link to these on the editing interface.'
## echo 'Installing manually-uploaded image files transferred from the editing interface...'
## ${INDSRC}transfer_all_images.sh

echo ''
echo ''

#-------------------------------------------------------------

echo "Starting the indexing process..."
date 
echo ''

cd $INDSRC
python $indexscript <<!
12345678
!

echo ''
echo "Finished the indexing process."
date 

#-------------------------------------------------------------
