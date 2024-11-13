__author__ = 'sers0034'

import redis

import indexer
import redisconfig

red_rel = redis.Redis(host=redisconfig.host, db=redisconfig.db_temp_cofk_create)
red_ids = redis.Redis(host=redisconfig.host, db=redisconfig.db_object_ids)

indexer.StoreRelations( [], red_rel, red_ids )

