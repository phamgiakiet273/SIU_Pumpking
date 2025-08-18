import logging
from pathlib import Path
from loguru import logger

import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking/")

from configs.logger import LoggerConfig


def get_logger():
    """Return logger object."""
    return logger


def setup_logger(
    name: str = "app",
    logdir: Path | str = Path(LoggerConfig().LogDir),
    log_level: int = logging.INFO,
    backtrace: bool = LoggerConfig().BackTrace,
    serialize: bool = LoggerConfig().SerializeJSON,
    diagnose: bool = LoggerConfig().Diagnose,
):
    """Setup a logger with file and stream handlers.

    Args:
        name (str, optional): name of logger. Defaults to "app".

        logdir (Path | str, optional): folder where log files will
        be stored. Defaults to Path(LoggerConfig.LogDir).

        log_level (int, optional): log level. Defaults to logging.INFO.

        backtrace (bool, optional): enable backtrace. Defaults to LoggerConfig.BackTrace.

        serialize (bool, optional): enable serialize. Defaults to LoggerConfig.SerializeJSON.

        diagnose (bool, optional): enable diagnose. Defaults to LoggerConfig.Diagnose.

    Returns:
        logging.Logger: logger object
    """  # noqa: E501

    # Make log directory
    logdir = Path(logdir)
    logdir.mkdir(parents=True, exist_ok=True)
    path = logdir / name

    # Remove default std.err handler
    logger.remove(0)

    logger.add(
        sys.stdout,
        level=log_level,
        backtrace=backtrace,
        diagnose=diagnose,
        enqueue=True,
    )

    logger.add(
        path.with_suffix(".log"),
        level=log_level,
        rotation=int(LoggerConfig().MaxBytes),
        retention=int(LoggerConfig().MaxBackupCount),
        backtrace=backtrace,
        diagnose=diagnose,
        enqueue=True,
        serialize=serialize,  # Enable this to log in json format
    )

    return logger
