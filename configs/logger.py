class LoggerConfig:
    def __init__(self) -> None:
        # This is the logger config
        self.LogDir = "./log/"
        self.BackTrace = False
        self.MaxBytes = 10485760  # 10MB ~ 10485760
        self.MaxBackupCount = 10
        self.SerializeJSON = True
        self.Diagnose = False  # This should be disabled in production
