from flask import jsonify


class APIError(Exception):
    def __init__(self, status, title, detail):
        self.status, self.title, self.detail = status, title, detail


def problem(status, title, detail):
    response = jsonify(type='about:blank', title=title, status=status, detail=detail)
    response.status_code = status
    response.content_type = 'application/problem+json'
    return response
