class ResourceNotFoundError(Exception):
    """
    Raised when a requested resource does not exist.
    """
    pass


class DuplicateResourceError(Exception):
    """
    Raised when an attempt to create a resource that already exists is made.
    """
    pass

class ClipNotFoundError(Exception):
    """
    Raised when a requested clip does not exist.
    """
    pass

class ClipValidationFailedError(Exception):
    """
    Raised when clip validation fails.
    """
    pass

class VideoNotFoundError(Exception):
    """
    Raised when a requested video does not exist.
    """
    pass