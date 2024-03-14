import codecs
import csv
import datetime
import decimal
import logging
import os.path
import time

import solr

from site_front_2 import app_paths
from site_front_2.datasrc import csvtordf, fieldmap, solrconfig

lat_min = decimal.Decimal("-90")
lat_max = decimal.Decimal("90")
long_min = decimal.Decimal("-180")
long_max = decimal.Decimal("180")

log = logging.getLogger(__name__)


def fill_solr(indexing, red_temp):
    """
    Generate a solr entry for each object
    """

    uri_base = 'http://localhost/'

    sol_all = solr.SolrConnection(solrconfig.solr_urls_stage['all'])

    core_id_name = fieldmap.get_core_id_fieldname()
    uri_prefix = fieldmap.get_uri_value_prefix()
    date_added_name = fieldmap.get_date_added_fieldname()

    for con in csvtordf.conversions:

        if con[csvtordf.title_plural] not in indexing:
            continue

        singular = con[csvtordf.title_singular]
        plural = con[csvtordf.title_plural]

        print("- Converting " + plural)

        sol = solr.SolrConnection(solrconfig.solr_urls_stage[plural])

        # Keep track of what is happening with these
        timeStart = time.time()
        record_count = 0
        record_skip = 0

        # id_field = singular + "_id" # TOBEREMOVE
        uri_base_with_type = uri_base + singular + "/"

        now = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

        csvs = csvtordf.csv_files[plural]  # This is more than likely to be a single csv only

        for csv_file in csvs:
            #
            # open each csvfile and output to entity store as rdf
            #
            csv_file_location = app_paths.path_data() / csv_file
            print(f"  - CSV file:  {csv_file_location.as_posix()}")

            csv_records = []
            csv_codec_file = None
            published_flag = False

            if os.path.isfile(csv_file_location):
                csv_codec_file = codecs.open(csv_file_location, encoding="utf-8", mode="rb")
                csv_records = csv.DictReader(csv_codec_file, restval="")

                csv_fields = csv_records.fieldnames

                published_flag = "published" in csv_fields  # Check for column while we switch over formats
            else:
                log.warning(f"  - CSV file not found: {csv_file_location.as_posix()}")

            translation_errors = []
            solr_list = []

            for record in csv_records:

                record_count += 1

                if published_flag and record["published"] != "1":
                    continue

                uid = record["uuid"]
                uri = uri_base_with_type + uid

                solr_item = {
                    "uuid": uid,
                    "uri": "//emlo.bodleian.ox.ac.uk/" + uid,
                    "object_type": singular,
                    date_added_name: now
                }

                add(solr_item, core_id_name, uri, uri_prefix)

                #
                # Add predicates and objects from csv
                #

                # entity.add_namespaces(con[csvtordf.namespaces])

                translations = con[csvtordf.translations]
                for field in csv_fields:

                    if field not in translations:
                        if field not in translation_errors:
                            translation_errors.append(field)
                            print("Warning: '" + field +
                                  "' not found in csvtordf.py file. Skipping that particular field.")
                    else:
                        translation = translations[field]

                        if translation and (translation[csvtordf.predicate] or translation[csvtordf.solr]):
                            data = ''
                            if field in record:
                                data = record[field].strip()
                            else:
                                print("Warning: '" + str(field) + "' not found in record. Record:" + str(
                                    record) + " . Skipping that particular field.")

                            if data != '':

                                # Convert data if a function present
                                if csvtordf.converter in translation:
                                    converter = translation[csvtordf.converter]
                                    data = converter(data)

                                # check to see whether we need to ignore this value
                                if csvtordf.ignoreIfEqual not in translation or translation[
                                    csvtordf.ignoreIfEqual] != data:

                                    if translation[csvtordf.predicate]:
                                        prefix = translation.get(csvtordf.prefix, None)
                                        transient = translation.get(csvtordf.transient, None)

                                        add(solr_item, translation[csvtordf.predicate], data, prefix=prefix,
                                            transient=transient)

                                    else:  # translation[csvtordf.solr]:
                                        add_solr(solr_item, translation[csvtordf.solr], data)

                #
                # Add additional predicates not in CSV files
                #
                additional = con[csvtordf.additional]
                for predicate, obj in additional.items():
                    add(solr_item, predicate, obj)

                # create additional fields from existing
                generateAdditional(singular, record, solr_item)

                #
                # Add relationships
                #

                # members = red_temp.smembers(uid)  # get relationships  # TOBEREMOVE

                # members = red_temp.lrange(uid, 0, -1)  # get all relationships # KTODO debugging
                members = None  # KTODO debugging
                if members:
                    # if entity :
                    #     entity.add_namespaces( relationships.namespaces )

                    uuid_related = []

                    for i in range(0, len(members), 3):
                        relation = members[i]
                        uid_related = members[i + 1]
                        type_related = members[i + 2]

                        uri_relationship = uri_base + type_related + "/" + uid_related
                        add(solr_item, relation, uri_relationship, relationship=type_related)

                        uuid_related.append(uid_related)

                    add(solr_item, "uuid_related", uuid_related)

                    # if entity:
                    #    entity.commit()

                    # print solr_item
                else:
                    if singular == 'work':
                        add(solr_item, "uuid_related", [])

                if members or singular == 'work':
                    solr_list.append(solr_item)  # only add it if it is related to something or a work on it's own...
                else:
                    record_skip += 1

                if record_count % 5000 == 0:
                    print("  - add to solr to", record_count)
                    add_to_solr(sol, solr_list)
                    add_to_solr(sol_all, solr_list)
                    del solr_list[:]

                    # rest a while, give something else a chance!
                    time.sleep(0.1)

            print("  - adding to solr last to", record_count)
            add_to_solr(sol, solr_list)
            add_to_solr(sol_all, solr_list)

            del solr_list[:]

            if csv_codec_file is not None:
                csv_codec_file.close()

        print("  - committing", record_count - record_skip, "from", record_count)
        sol.commit()
        sol_all.commit()

        sol.close()

        timeEnd = time.time()
        print("- Done. Added " + str(record_count) + " records in %0.1f seconds." % (timeEnd - timeStart))

    print('- Committing to solr "all" repository')

    sol_all.close()


def add_solr(item, key, value):
    try:
        item[key].append(value)
    except KeyError:
        item[key] = value
    except AttributeError:
        item[key] = [item[key], value]


def add(solr_item, predicate, uid, prefix=None, transient=None, relationship=None):
    if transient:
        solr_key = "%s-%s" % (transient[csvtordf.predicate], predicate)
    else:
        solr_key = predicate

    if prefix:
        solr_key = solr_key + "-" + prefix
        solr_value = prefix + uid
    else:
        solr_value = uid

    if relationship:
        solr_key = solr_key + "-" + relationship

    add_solr(solr_item, solr_key, solr_value)


def add_to_solr(sol, items):
    total = len(items)
    start = 0
    batch = 1000

    while start < total:
        # print start,
        sol.add_many(items[start:start + batch], False)
        start += batch


def generateAdditional(singular, record, solr_item):
    if singular == "location":

        if "latitude" in record and "longitude" in record:

            latitude = record["latitude"]
            longitude = record["longitude"]

            if latitude != "" and longitude != "":
                latitude_dec = decimal.Decimal(latitude)
                longitude_dec = decimal.Decimal(longitude)

                if lat_min <= latitude_dec <= lat_max and long_min <= longitude_dec <= long_max:
                    add_solr(solr_item, "geo", record["latitude"] + "," + record["longitude"])
                    # TODO: Add a uncertainty over a position, i.e. a radius ofa cirlce around a point. Large for just countries, small for streets and houses. Solr fieldneeds library adding.
                    # add_solr( solr_item, "geo_rpt", "Circle(" + record["latitude"] + "," + record["longitude"] + " d=0.01)" )

                else:
                    print("Incorrect Lat/Long: ", latitude_dec, longitude_dec, "for", id)

        if "location_name" in record:
            country = record["location_name"]
        else:
            country = "unknown"


def main():
    pass


if __name__ == '__main__':
    main()
