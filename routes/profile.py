#!/usr/bin/env python3
"""The routes for the user space management
"""
from flask import Blueprint, jsonify, request
from datetime import datetime
from db import db
from routes.utils import get_user_id

# Create profile Blueprint
profile_bp = Blueprint('profile_bp', __name__)


@profile_bp.route('/posts')
def get_posts():
    """Get the user's posts
    """

    # Get user_id
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 404

    # Return posts
    posts = db.find_user_posts(user_id)
    for p in posts:
        del p['_id']
        del p['user_id']
        p['datePosted'] = p['datePosted'].strftime('%Y/%m/%d %H:%M:%S')

    return jsonify(posts)


@profile_bp.route('/update_infos', methods=['PUT'])
def update_infos():
    """Update the user's infos
    """

    # Get user_id
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 404

    # Get the data to update
    data = request.get_json()

    # Check fields
    accepted_fields = ['email', 'username']
    for field in data.keys():
        if field not in accepted_fields:
            return jsonify({'error': 'Only update email and/or username'}), 400

    # Update the user's infos
    db.update_user_info(user_id, data)

    return jsonify({'success': 'user updated'}), 201
