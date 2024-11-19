import os
host = os.getenv('REDIS_HOST', '')
port = os.getenv('REDIS_PORT', '6379')

# Databases we are using
db_object_ids = 1
db_temp_cofk_create = 2
