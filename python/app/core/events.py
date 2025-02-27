class EventEmitter:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = EventEmitter()
        return cls._instance
    
    def __init__(self):
        self.listeners = {}
        
    def on(self, event, callback):
        if event not in self.listeners:
            self.listeners[event] = []
        self.listeners[event].append(callback)
        
    def emit(self, event, data=None):
        if event in self.listeners:
            for callback in self.listeners[event]:
                callback(data)