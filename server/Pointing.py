import json


class Pointing:
    def __init__(self, roomId, users, stories, selected_story):
        self._roomId = roomId
        self._users = users
        self._stories = stories
        self._selected_story = selected_story

    @property
    def roomId(self):
        return self._roomId

    @roomId.setter
    def roomId(self, value):
        self._roomId = value

    @property
    def users(self):
        return self._users

    @property
    def selected_story(self):
        return self._selected_story

    @users.setter
    def users(self, value):
        self._users = value

    @property
    def stories(self):
        return self._stories

    @stories.setter
    def stories(self, value):
        self._stories = value

    @selected_story.setter
    def selected_story(self, value):
        self._selected_story = value

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__,
            sort_keys=True, indent=4)