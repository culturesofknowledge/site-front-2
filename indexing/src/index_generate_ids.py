__author__ = 'sers0034'

import redis

import indexer
import redisconfig

print(redisconfig, redisconfig.host,)
red_ids = redis.Redis(host=redisconfig.host, db=redisconfig.db_object_ids)
indexer.GenerateIds(None, red_ids)
