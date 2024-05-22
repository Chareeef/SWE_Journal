#!/usr/bin/env python3
"""
Module for managing storage of SWE_journal in MongoDB.
"""
from pymongo.errors import ConnectionFailure
from pymongo import ReturnDocument
from pymongo.results import InsertOneResult
from pymongo import MongoClient
from bson import ObjectId
import os
import bcrypt
from typing import Any, Dict, List, Optional, Tuple, Union


def hash_pass(password: str) -> bytes:
    """ hash a password and return the hashed value """
    hash_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    return hash_password


def check_hash_password(hashed_password: bytes, password: str) -> bool:
    """ check if hashed value of two string are the same """
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password)


def serialize_ObjectId(di: dict) -> Dict[str, Any]:
    """ serialize ObjectId of documents """
    user_id = di.get('user_id')
    post_id = di.get('post_id')
    id = di.get('_id')

    if user_id is not None:
        di['user_id'] = str(user_id)

    if post_id is not None:
        di['post_id'] = str(post_id)

    if id is not None:
        di['_id'] = str(id)

    return di


class DBStorage:
    """ Defines a class that manages storage of SWE_journal in MongoDB. """

    def __init__(self) -> None:
        """ Constructor """
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '27017')
        db_name = os.getenv('DB_DATABASE', 'swe_journal')
        self._client = MongoClient(f"mongodb://{db_host}:{db_port}/")

        try:
            self._client.admin.command('ismaster')
            print(f"Connected to MongoDB successfully on port: {db_port}")
        except ConnectionFailure as err:
            print(f"Connection failed: {err}")
            raise

        self._db = self._client[db_name]

    def insert_user(self, document: Dict[str, Any]) -> InsertOneResult:
        """ Create a new user document """
        password = document['password']
        document['password'] = hash_pass(password)
        users = self._db['users']
        new_user = users.insert_one(document)
        return new_user.inserted_id

    def insert_post(self, document: Dict[str, Any]) -> InsertOneResult:
        """ Create a new post document """
        posts = self._db['posts']
        new_post = posts.insert_one(document)

        return new_post.inserted_id

    def find_user(self, info: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """ Return a user document """
        users = self._db['users']
        try:
            user = users.find(info, {'password': 0})
            return list(map(serialize_ObjectId, user))[0]

        except Exception as e:
            return None

    def get_hash(self, email: str) -> Optional[Dict[str, Any]]:
        """ Return a user's hashed password """
        users = self._db['users']
        try:
            user = users.find_one({'email': email})
            return user['password']
        except Exception as e:
            return None

    def find_user_posts(self, user_id: str) -> Optional[List[Dict[str, Any]]]:
        """ Return a posts documents created by a user. """
        posts = self._db['posts']
        try:
            user_posts = posts.find({'user_id': ObjectId(user_id)})
            return list(map(serialize_ObjectId, user_posts))

        except Exception as e:
            return None

    def find_post(self, info: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """ Return a post document """
        posts = self._db['posts']
        try:
            post = posts.find(info)
            return list(map(serialize_ObjectId, post))[0]

        except Exception as e:
            return None

    def update_user_info(
            self,
            user_id: str,
            update_fields: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """ update and return a user document. """
        users = self._db['users']
        update_fields.pop('password', None)
        try:
            updated_user = users.find_one_and_update(
                {'_id': ObjectId(user_id)},
                {'$set': update_fields},
                return_document=ReturnDocument.AFTER
            )
            return list(map(serialize_ObjectId, updated_user))[0]

        except Exception as e:
            return None

    def update_user_password(
            self,
            user_id: str,
            old_password: str,
            new_password: str
    ) -> int:
        """Update the user's password as hash

        Return 0 if successfully updated, otherwise:
            * -1: user not found
            * -2: wrong old password
            * -3: any other error
        """
        users = self._db['users']
        user = users.find_one({'_id': ObjectId(user_id)})

        if not user:
            return -1

        if not check_hash_password(user['password'], old_password):
            return -2

        new_hashed_password = hash_pass(new_password)
        try:
            users.find_one_and_update(
                {'_id': ObjectId(user_id)},
                {'$set': {'password': new_hashed_password}}
            )

            return 0

        except Exception as e:
            return -3

    def update_post(
            self,
            post_id: str,
            user_id: str,
            update_fields: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """ update and return a post document. """
        posts = self._db['posts']
        try:
            updated_post = posts.find_one_and_update(
                {'_id': ObjectId(post_id), 'user_id': ObjectId(user_id)},
                {'$set': update_fields},
                return_document=ReturnDocument.AFTER
            )
            return list(map(serialize_ObjectId, updated_post))

        except Exception as e:
            return None

    def delete_post(self, post_id: str, user_id: str) -> bool:
        """ deletes a post ducoment from db """
        posts = self._db['posts']
        try:
            posts.delete_one({
                '_id': ObjectId(post_id),
                'user_id': ObjectId(user_id)
            })
            return True
        except Exception as e:
            return False

    def find_all_users(self) -> List[Dict[str, Any]]:
        """ Returns all users in the db """
        users = self._db['users']

        return list(map(serialize_ObjectId, users.find({}, {'password': 0})))

    def find_all_posts(self) -> List[Dict[str, Any]]:
        """ Returns all posts in the db """
        posts = self._db['posts']

        return list(map(serialize_ObjectId, posts.find()))

    def like_post(self, user_id: str, post_id: str) -> bool:
        """ add likes to a post document. """
        posts = self._db['posts']
        post = posts.find_one({"_id": ObjectId(post_id)})
        user_id = ObjectId(user_id)

        if user_id not in post['likes']:
            posts.update_one(
                {"_id": ObjectId(post_id)},
                {
                    "$inc": {"number_of_likes": 1},
                    "$addToSet": {"likes": user_id}
                }
            )
            return False
        return True

    def unlike_post(self, user_id: str, post_id: str) -> bool:
        posts = self._db['posts']
        post = posts.find_one({"_id": ObjectId(post_id)})
        user_id = ObjectId(user_id)

        if user_id in post['likes']:
            posts.update_one(
                {"_id": ObjectId(post_id)},
                {
                    "$inc": {"number_of_likes": -1},
                    "$pull": {"likes": user_id}
                }
            )
            return False
        return True

    def clear_db(self):
        """
        THIS METHOD SHOULD BE USED ONLY FOR TESTING.
        """
        self._db.drop_collection('users')
        self._db.drop_collection('posts')
