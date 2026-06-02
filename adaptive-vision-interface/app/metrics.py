import time

class Metrics:
    """
    Tracks performance, viewer count, and uptime for monitoring and observability.
    """

    def __init__(self):
        self.frames = 0                # Total frames processed
        self.active_viewers = 0        # Number of faces detected in current frame
        self.last_detection = None     # Last timestamp a face was seen
        self.start_time = time.time()  # Application start time

    def update(self, viewers, timestamp):
        """
        Update metrics on each frame iteration.

        Args:
            viewers (int): Number of viewers detected
            timestamp (float): Current frame timestamp
        """
        self.frames += 1
        self.active_viewers = viewers
        if viewers > 0:
            self.last_detection = timestamp

    def export(self):
        """
        Returns metrics data as a dictionary for JSON output.
        """
        uptime = time.time() - self.start_time
        since_viewer = time.time() - self.last_detection if self.last_detection else None

        return {
            "frames_processed": self.frames,
            "active_viewers": self.active_viewers,
            "last_detection": self.last_detection,
            "uptime_sec": round(uptime, 2),
            "since_last_viewer_sec": round(since_viewer, 2) if since_viewer else None
        }
