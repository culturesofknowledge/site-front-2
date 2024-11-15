#! /bin/bash
# Install images that were manually uploaded to the editing interface (cofk2) by researchers.
# At the moment (1st Aug 2011) there are not many, so I are just going to bung them all across
# every time. At a later stage it would be sensible just to get the recently-added ones.

FROM_DIR=/home/cofkxfer/images/
TO_DIR=/home/dev/web/web/public/scans/uploaded/

chmod +w $TO_DIR/*.*

echo "Copying all image files:"
echo "From $FROM_DIR"
echo "To $TO_DIR"

for f in $(ls $FROM_DIR/*.*)
do
  echo "Copying $f to $TO_DIR"
  \cp $f $TO_DIR
done

chmod -w $TO_DIR/*.*
