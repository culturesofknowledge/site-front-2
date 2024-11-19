__author__ = 'sers0034'

import redis

import indexer
import redisconfig

print((redisconfig, redisconfig.host, redisconfig.port))
red_ids = redis.Redis(host=redisconfig.host, port=redisconfig.port, db=redisconfig.db_object_ids)
indexer.GenerateIds(None, red_ids)
