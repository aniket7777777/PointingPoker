import copy
import csv
import eventlet
import time
import os
from Point import Point
from Pointing import Pointing
from User import User
from flask import Flask, render_template, request, json
from flask_cors import CORS
from flask_socketio import SocketIO, join_room

eventlet.monkey_patch()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
socketio = SocketIO(app, cors_allowed_origins=[], logger=True, engineio_logger=True, path='backend')
CORS(app)
pointingData = {}
current_milli_time = lambda: int(round(time.time() * 1000))
cf_port = os.getenv('PORT')


@app.route('/')
def sessions():
    return render_template('session.html')


@socketio.on('createManually')
def create_manually(data):
    room_id = setup_pointing_data({}, data['username'])
    on_login({'roomId': room_id, 'username': data['username']})


@socketio.on('login')
def on_login(data):
    room_id_ = data['roomId']
    join_room(room_id_)
    username_ = data['username']
    print('user ' + username_ + ' connected to the room: ' + room_id_)
    pointing = pointingData[room_id_]
    if not username_ in pointing['public'].users:
        user = User(username_, False, {})
        pointing['public'].users[username_] = user
        pointing['private'][username_] = copy.deepcopy(user)
    socketio.emit('pointingData', pointing['public'].toJSON(), room=room_id_)


@socketio.on('selectStory')
def on_select_story(data):
    pointing = pointingData[data['roomId']]
    if pointing['public'].users[data['username']].isAdmin is True:
        pointing['public'].selected_story = pointing['public'].stories[data['Key']]
        socketio.emit('selectStoryResp', pointing['public'].stories[data['Key']], room=data['roomId'])


@socketio.on('flip')
def on_flip(data):
    pointing = pointingData[data['roomId']]
    if pointing['public'].users[data['username']].isAdmin is True:
        pointing['public'].users = copy.deepcopy(pointing['private'])
        publish_users(pointing)


def publish_users(pointing):
    socketio.emit('publishUsers', json.dumps(pointing['public'].users, default=lambda o: o.__dict__),
                  room=pointing['public'].roomId)


@socketio.on('enterFinalPoints')
def on_enter_final_points(data):
    pointing = pointingData[data['roomId']]
    if pointing['public'].users[data['username']].isAdmin is True:
        pointing['public'].stories[data["Key"]]["Story Points"] = data['points']
        socketio.emit('publishStories', json.dumps(pointing['public'].stories, default=lambda o: o.__dict__),
                      room=data['roomId'])


@socketio.on('selectPoint')
def on_select_point(data):
    point = data['point']
    room_id_ = data['roomId']
    username_ = data['username']
    pointing = pointingData[room_id_]
    user = pointing['public'].users[username_]
    is_pointed = True
    if point is None or len(point) == 0:
        is_pointed = False
    user.points[data['Key']] = Point(data['Key'], is_pointed, '')
    pointing['private'][username_].points[data['Key']] = Point(data['Key'], is_pointed, point)
    publish_users(pointing)


@socketio.on('addStory')
def add_story(data):
    room_id_ = data['roomId']
    username_ = data['username']
    story = data['story']
    pointing = pointingData[room_id_]
    if pointing['public'].users[username_].isAdmin is True:
        pointing['public'].stories[story['Key']] = story
        socketio.emit('publishStories', json.dumps(pointing['public'].stories, default=lambda o: o.__dict__),
                      room=room_id_)


def utf_8_encoder(unicode_csv_data):
    for line in unicode_csv_data:
        yield line.encode('utf-8')


@app.route('/file/upload', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        username = request.headers["Username"]
        print(username + ' logged in')
        csv_contents = request.files['upload'].read().decode('utf-8', errors='replace')
        request_file = csv_contents.splitlines()
        dict_reader = csv.DictReader(request_file)
        stories = {}
        for item in dict_reader:
            stories[item['Key']] = {}
            stories[item['Key']]['Key'] = item['Key']
            stories[item['Key']]['Summary'] = item['Summary']
            stories[item['Key']]['Story Points'] = item['Story Points']
        # print(stories)
        roomId = setup_pointing_data(stories, username)
        # print(pointingData[roomId].toJSON())
        # return json.dumps(pointingData)
        return roomId


def setup_pointing_data(stories, username):
    roomId = current_milli_time().__str__()
    users = {}
    user = User(username, True, {})
    users[username] = user
    selected_story = {}
    if bool(stories):
        selected_story = stories[list(stories.keys())[0]]
    pointing = Pointing(roomId, users, stories, selected_story)
    pointing = {'public': pointing, 'private': copy.deepcopy(pointing.users)}
    pointingData[roomId] = pointing
    return roomId


if __name__ == '__main__':
    if cf_port is None:
        socketio.run(app, host='0.0.0.0', port=5000, debug=True)
    else:
        socketio.run(app, host='0.0.0.0', port=int(cf_port), debug=True)
