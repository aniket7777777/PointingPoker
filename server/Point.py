import json


class Point:
    def __init__(self, issueId, isPointed, point):
        self._issueId = issueId
        self._point = point
        self._isPointed = isPointed

    @property
    def issueId(self):
        return self._issueId

    @issueId.setter
    def issueId(self, value):
        self._issueId = value

    @property
    def point(self):
        return self._point

    @point.setter
    def point(self, value):
        self._point = value

    @property
    def isPointed(self):
        return self._isPointed

    @isPointed.setter
    def isPointed(self, value):
        self._isPointed = value

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__,
            sort_keys=True, indent=4)