import json


class User:
    def __init__(self, name, isAdmin, points):
        self._name = name
        self._isAdmin = isAdmin
        self._points = points

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def isAdmin(self):
        return self._isAdmin

    @isAdmin.setter
    def isAdmin(self, value):
        self._isAdmin = value

    @property
    def points(self):
        return self._points

    @points.setter
    def points(self, value):
        self._points = value

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__,
            sort_keys=True, indent=4)