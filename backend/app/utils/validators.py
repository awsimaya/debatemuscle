from .constants import TOURNAMENTS, DIVISIONS


def validate_tournament(tournament):
    if tournament not in TOURNAMENTS:
        raise ValueError(f"Invalid tournament: {tournament}")
    return tournament


def validate_division(division):
    if division not in DIVISIONS:
        raise ValueError(f"Invalid division: {division}")
    return division


def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions
